-- Legacy snapshot kept only for reference.
-- Source of truth: run files in supabase/migrations in timestamp order.
-- Latest operational controls: 20260530183000_operational_controls.sql

create extension if not exists pgcrypto;

do $$
begin
  create type app_role as enum ('admin', 'manager', 'driver', 'accountant');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type report_status as enum ('open', 'closed');
exception
  when duplicate_object then null;
end $$;

create table if not exists points (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  price numeric(12, 2) not null default 0,
  norm numeric(12, 2) not null default 0,
  category text not null default 'Напитки',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role app_role not null default 'driver',
  point_id uuid references points(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  name text not null,
  point_id uuid not null references points(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists daily_reports (
  id uuid primary key default gen_random_uuid(),
  report_date date not null,
  point_id uuid not null references points(id),
  driver_id uuid not null references drivers(id),
  status report_status not null default 'open',
  closed_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_date, point_id)
);

create table if not exists report_items (
  report_id uuid not null references daily_reports(id) on delete cascade,
  product_id uuid not null references products(id),
  incoming numeric(12, 2) not null default 0,
  home_rest numeric(12, 2),
  updated_at timestamptz not null default now(),
  primary key (report_id, product_id)
);

create table if not exists transfers (
  id uuid primary key default gen_random_uuid(),
  transfer_date date not null,
  from_point_id uuid not null references points(id),
  to_point_id uuid not null references points(id),
  product_id uuid not null references products(id),
  quantity numeric(12, 2) not null check (quantity > 0),
  comment text not null default '',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  check (from_point_id <> to_point_id)
);

create table if not exists cash_records (
  report_id uuid primary key references daily_reports(id) on delete cascade,
  driver_id uuid not null references drivers(id),
  food_expenses numeric(12, 2) not null default 0,
  we_returned_debt numeric(12, 2) not null default 0,
  we_owe numeric(12, 2) not null default 0,
  client_returned_debt numeric(12, 2) not null default 0,
  client_took_debt numeric(12, 2) not null default 0,
  discounts numeric(12, 2) not null default 0,
  fuel numeric(12, 2) not null default 0,
  kfc numeric(12, 2) not null default 0,
  for_home numeric(12, 2) not null default 0,
  car_wash numeric(12, 2) not null default 0,
  tinting numeric(12, 2) not null default 0,
  other_expenses numeric(12, 2) not null default 0,
  handed_over numeric(12, 2) not null default 0,
  comment text not null default ''
);

create or replace view v_report_lines as
select
  r.id as report_id,
  r.report_date,
  r.point_id,
  p.id as product_id,
  p.name as product_name,
  p.price,
  p.norm,
  coalesce(prev.home_rest, p.norm) as previous_rest,
  coalesce(ri.incoming, 0) as incoming,
  coalesce(movement.quantity, 0) as movement,
  ri.home_rest,
  case
    when ri.home_rest is null then 0
    else coalesce(prev.home_rest, p.norm) + coalesce(ri.incoming, 0) - coalesce(movement.quantity, 0) - ri.home_rest
  end as sale,
  case
    when ri.home_rest is null then 0
    else (coalesce(prev.home_rest, p.norm) + coalesce(ri.incoming, 0) - coalesce(movement.quantity, 0) - ri.home_rest) * p.price
  end as amount,
  case
    when ri.home_rest is null then 0
    else greatest(p.norm - ri.home_rest, 0)
  end as request
from daily_reports r
cross join products p
left join report_items ri on ri.report_id = r.id and ri.product_id = p.id
left join lateral (
  select previous_item.home_rest
  from daily_reports previous_report
  join report_items previous_item on previous_item.report_id = previous_report.id
  where previous_report.point_id = r.point_id
    and previous_report.report_date < r.report_date
    and previous_report.status = 'closed'
    and previous_item.product_id = p.id
  order by previous_report.report_date desc
  limit 1
) prev on true
left join lateral (
  select
    sum(
      case
        when t.from_point_id = r.point_id then t.quantity
        when t.to_point_id = r.point_id then -t.quantity
        else 0
      end
    ) as quantity
  from transfers t
  where t.transfer_date = r.report_date
    and t.product_id = p.id
    and (t.from_point_id = r.point_id or t.to_point_id = r.point_id)
) movement on true
where p.active = true;

create or replace view v_cash_totals as
select
  r.id as report_id,
  r.report_date,
  r.point_id,
  c.driver_id,
  coalesce(sum(lines.amount), 0) as product_revenue,
  coalesce(sum(lines.amount), 0)
    - c.discounts
    - c.fuel
    - c.kfc
    - c.for_home
    - c.car_wash
    - c.tinting
    - c.other_expenses
    - c.client_took_debt
    + c.client_returned_debt
    - c.we_returned_debt
    + c.we_owe as should_hand_over,
  c.handed_over - (
    coalesce(sum(lines.amount), 0)
    - c.discounts
    - c.fuel
    - c.kfc
    - c.for_home
    - c.car_wash
    - c.tinting
    - c.other_expenses
    - c.client_took_debt
    + c.client_returned_debt
    - c.we_returned_debt
    + c.we_owe
  ) as shortage_or_plus
from daily_reports r
join cash_records c on c.report_id = r.id
left join v_report_lines lines on lines.report_id = r.id
group by r.id, c.report_id;

alter table points enable row level security;
alter table products enable row level security;
alter table profiles enable row level security;
alter table drivers enable row level security;
alter table daily_reports enable row level security;
alter table report_items enable row level security;
alter table transfers enable row level security;
alter table cash_records enable row level security;

create or replace function current_app_role()
returns app_role
language sql
stable
as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function current_point_id()
returns uuid
language sql
stable
as $$
  select point_id from profiles where id = auth.uid()
$$;

create policy "points read" on points
  for select using (auth.uid() is not null);

create policy "products read" on products
  for select using (auth.uid() is not null);

create policy "admin manage points" on points
  for all using (current_app_role() = 'admin') with check (current_app_role() = 'admin');

create policy "admin manage products" on products
  for all using (current_app_role() = 'admin') with check (current_app_role() = 'admin');

create policy "reports scoped read" on daily_reports
  for select using (
    current_app_role() in ('admin', 'manager', 'accountant')
    or point_id = current_point_id()
  );

create policy "managers manage reports" on daily_reports
  for all using (current_app_role() in ('admin', 'manager')) with check (current_app_role() in ('admin', 'manager'));

create policy "report items scoped read" on report_items
  for select using (
    exists (
      select 1 from daily_reports r
      where r.id = report_items.report_id
        and (current_app_role() in ('admin', 'manager', 'accountant') or r.point_id = current_point_id())
    )
  );

create policy "managers manage report items" on report_items
  for all using (current_app_role() in ('admin', 'manager')) with check (current_app_role() in ('admin', 'manager'));

create policy "drivers update report items" on report_items
  for update using (
    exists (
      select 1 from daily_reports r
      where r.id = report_items.report_id
        and r.status = 'open'
        and r.point_id = current_point_id()
    )
  ) with check (
    exists (
      select 1 from daily_reports r
      where r.id = report_items.report_id
        and r.status = 'open'
        and r.point_id = current_point_id()
    )
  );

create or replace function guard_report_item_update()
returns trigger
language plpgsql
as $$
declare
  parent_status report_status;
  user_role app_role;
begin
  select status into parent_status from daily_reports where id = new.report_id;
  user_role := current_app_role();

  if parent_status = 'closed' and user_role <> 'admin' then
    raise exception 'Closed report cannot be edited';
  end if;

  if user_role = 'driver' then
    if new.incoming is distinct from old.incoming then
      raise exception 'Drivers can update only home_rest';
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_guard_report_item_update on report_items;
create trigger trg_guard_report_item_update
  before update on report_items
  for each row execute function guard_report_item_update();

create policy "transfers manager read" on transfers
  for select using (
    current_app_role() in ('admin', 'manager', 'accountant')
    or from_point_id = current_point_id()
    or to_point_id = current_point_id()
  );

create policy "transfers manager write" on transfers
  for all using (current_app_role() in ('admin', 'manager')) with check (current_app_role() in ('admin', 'manager'));

create policy "cash scoped read" on cash_records
  for select using (
    current_app_role() in ('admin', 'manager', 'accountant')
    or exists (
      select 1 from daily_reports r
      where r.id = cash_records.report_id
        and r.point_id = current_point_id()
    )
  );

create policy "cash manager accountant write" on cash_records
  for all using (current_app_role() in ('admin', 'manager', 'accountant')) with check (current_app_role() in ('admin', 'manager', 'accountant'));

insert into points (name) values
  ('JVC'),
  ('Business Bay'),
  ('Silicon Oasis'),
  ('Al-Qusais'),
  ('Tikom')
on conflict (name) do nothing;
