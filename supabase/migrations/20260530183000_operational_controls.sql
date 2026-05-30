-- Operational controls for the redesigned app:
-- - reference data management
-- - default driver food expense
-- - custom expense aware cash totals
-- - revenue analytics views
-- - strict close-day carryover helper

alter table cash_columns
  alter column food_expenses set default 0;

create or replace function set_default_driver_food_expense()
returns trigger
language plpgsql
as $$
begin
  if coalesce(new.food_expenses, 0) = 0
     and (new.driver_id is not null or nullif(trim(new.driver_name), '') is not null)
  then
    new.food_expenses := 80;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_default_driver_food_expense on cash_columns;
create trigger trg_default_driver_food_expense
  before insert on cash_columns
  for each row execute function set_default_driver_food_expense();

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'drivers' and policyname = 'drivers read') then
    create policy "drivers read" on drivers for select using (auth.uid() is not null);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'drivers' and policyname = 'admin manager manage drivers') then
    create policy "admin manager manage drivers" on drivers for all
      using (current_app_role() in ('admin', 'manager'))
      with check (current_app_role() in ('admin', 'manager'));
  end if;
end $$;

create or replace view v_cash_totals as
with custom_totals as (
  select
    report_id,
    column_key,
    coalesce(sum(amount), 0) as custom_expenses
  from cash_custom_expenses
  group by report_id, column_key
)
select
  r.id as report_id,
  r.report_date,
  r.point_id,
  c.column_key,
  c.driver_id,
  c.driver_name,
  c.product_revenue,
  c.food_expenses,
  c.discounts,
  c.fuel,
  c.kfc,
  c.for_home,
  c.car_wash,
  c.tinting,
  c.other_expenses,
  coalesce(ct.custom_expenses, 0) as custom_expenses,
  c.handed_over,
  (
    c.product_revenue
    - c.food_expenses
    - c.discounts
    - c.fuel
    - c.kfc
    - c.for_home
    - c.car_wash
    - c.tinting
    - c.other_expenses
    - coalesce(ct.custom_expenses, 0)
    - c.client_took_debt
    + c.client_returned_debt
    - c.we_returned_debt
    + c.we_owe
  ) as should_hand_over,
  c.handed_over - (
    c.product_revenue
    - c.food_expenses
    - c.discounts
    - c.fuel
    - c.kfc
    - c.for_home
    - c.car_wash
    - c.tinting
    - c.other_expenses
    - coalesce(ct.custom_expenses, 0)
    - c.client_took_debt
    + c.client_returned_debt
    - c.we_returned_debt
    + c.we_owe
  ) as shortage_or_plus
from daily_reports r
join cash_columns c on c.report_id = r.id
left join custom_totals ct on ct.report_id = c.report_id and ct.column_key = c.column_key;

create or replace view v_daily_point_revenue as
select
  report_date,
  point_id,
  sum(amount) as revenue
from v_report_lines
group by report_date, point_id;

create or replace view v_daily_driver_revenue as
select
  r.report_date,
  r.point_id,
  c.column_key,
  c.driver_id,
  c.driver_name,
  c.product_revenue as revenue
from daily_reports r
join cash_columns c on c.report_id = r.id
where c.driver_name <> '' or c.product_revenue <> 0;

create or replace view v_stock_carryover_audit as
select
  current_report.id as report_id,
  current_report.report_date,
  current_report.point_id,
  current_item.product_id,
  current_item.previous_rest,
  previous_report.id as previous_report_id,
  previous_report.report_date as previous_report_date,
  previous_report.status as previous_report_status,
  previous_item.home_rest as previous_home_rest,
  current_item.previous_rest is not distinct from previous_item.home_rest as matches_previous_close
from daily_reports current_report
join report_items current_item on current_item.report_id = current_report.id
left join lateral (
  select *
  from daily_reports pr
  where pr.point_id = current_report.point_id
    and pr.report_date < current_report.report_date
    and pr.status = 'closed'
  order by pr.report_date desc
  limit 1
) previous_report on true
left join report_items previous_item
  on previous_item.report_id = previous_report.id
 and previous_item.product_id = current_item.product_id;

create or replace function close_report_and_prepare_next_day(p_report_id text)
returns text
language plpgsql
security definer
as $$
declare
  source_report daily_reports%rowtype;
  next_report_id text;
  next_report_date date;
begin
  select * into source_report
  from daily_reports
  where id = p_report_id
  for update;

  if not found then
    raise exception 'Report % not found', p_report_id;
  end if;

  if exists (
    select 1
    from report_items
    where report_id = p_report_id and home_rest is null
  ) then
    raise exception 'Cannot close report with missing product rests';
  end if;

  update daily_reports
  set status = 'closed',
      closed_at = coalesce(closed_at, now()),
      updated_at = now()
  where id = p_report_id;

  next_report_date := source_report.report_date + 1;
  next_report_id := next_report_date::text || '_' || source_report.point_id;

  insert into daily_reports (id, report_date, point_id, driver_id, status)
  values (next_report_id, next_report_date, source_report.point_id, source_report.driver_id, 'open')
  on conflict (report_date, point_id) do nothing;

  select id into next_report_id
  from daily_reports
  where report_date = next_report_date and point_id = source_report.point_id;

  insert into report_items (report_id, product_id, previous_rest, incoming, movement, extra_request)
  select
    next_report_id,
    ri.product_id,
    coalesce(ri.home_rest, ri.current_rest, 0),
    0,
    0,
    0
  from report_items ri
  where ri.report_id = p_report_id
  on conflict (report_id, product_id) do update
    set previous_rest = excluded.previous_rest,
        updated_at = now()
    where report_items.home_rest is null;

  insert into cash_columns (report_id, column_key, driver_id, driver_name)
  select
    next_report_id,
    c.column_key,
    c.driver_id,
    c.driver_name
  from cash_columns c
  where c.report_id = p_report_id
    and (c.driver_id is not null or c.driver_name <> '')
  on conflict (report_id, column_key) do nothing;

  return next_report_id;
end;
$$;
