-- Drink Sales Ledger — schema aligned with the Next.js app (localStorage model)
-- Run: supabase db push / supabase migration up

create extension if not exists pgcrypto;

do $$ begin
  create type app_role as enum ('admin', 'manager', 'driver', 'accountant');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type report_status as enum ('open', 'closed');
exception when duplicate_object then null;
end $$;

-- ─── Reference data ───────────────────────────────────────────────

create table if not exists points (
  id text primary key,
  name text not null,
  sheet_name text,
  excel_title text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id text primary key,
  name text not null,
  price numeric(12, 2) not null default 0,
  norm numeric(12, 2) not null default 0,
  category text not null default 'Напитки',
  active boolean not null default true,
  point_ids text[] default '{}',
  excel_rows_by_point jsonb default '{}',
  numbers_by_point jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists drivers (
  id text primary key,
  name text not null,
  point_id text not null references points(id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role app_role not null default 'driver',
  point_id text references points(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── Daily reports ──────────────────────────────────────────────────

create table if not exists daily_reports (
  id text primary key,
  report_date date not null,
  point_id text not null references points(id),
  driver_id text references drivers(id),
  status report_status not null default 'open',
  closed_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_date, point_id)
);

create table if not exists report_items (
  report_id text not null references daily_reports(id) on delete cascade,
  product_id text not null references products(id),
  previous_rest numeric(12, 2),
  incoming numeric(12, 2) not null default 0,
  movement numeric(12, 2) not null default 0,
  home_rest numeric(12, 2),
  extra_request numeric(12, 2) not null default 0,
  current_rest numeric(12, 2),
  updated_at timestamptz not null default now(),
  primary key (report_id, product_id)
);

create table if not exists transfers (
  id text primary key default gen_random_uuid()::text,
  transfer_date date not null,
  from_point_id text not null references points(id),
  to_point_id text not null references points(id),
  product_id text not null references products(id),
  quantity numeric(12, 2) not null check (quantity > 0),
  comment text not null default '',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  check (from_point_id <> to_point_id)
);

-- Касса: 7 колонок (E–K), как в Excel-шаблоне
create table if not exists cash_columns (
  report_id text not null references daily_reports(id) on delete cascade,
  column_key text not null check (column_key in ('E','F','G','H','I','J','K')),
  driver_id text references drivers(id),
  driver_name text not null default '',
  product_revenue numeric(12, 2) not null default 0,
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
  comment text not null default '',
  primary key (report_id, column_key)
);

create table if not exists cash_custom_expenses (
  id text primary key default gen_random_uuid()::text,
  report_id text not null references daily_reports(id) on delete cascade,
  column_key text not null check (column_key in ('E','F','G','H','I','J','K')),
  label text not null,
  amount numeric(12, 2) not null default 0,
  sort_order int not null default 0,
  foreign key (report_id, column_key) references cash_columns(report_id, column_key) on delete cascade
);

-- ─── Views ──────────────────────────────────────────────────────────

create or replace view v_report_lines as
select
  r.id as report_id,
  r.report_date,
  r.point_id,
  p.id as product_id,
  p.name as product_name,
  p.price,
  p.norm,
  coalesce(ri.previous_rest, prev.home_rest, p.norm) as previous_rest,
  coalesce(ri.incoming, 0) as incoming,
  coalesce(ri.movement, 0) + coalesce(tm.quantity, 0) as movement,
  ri.home_rest,
  coalesce(ri.extra_request, 0) as extra_request,
  coalesce(ri.current_rest, ri.home_rest) as current_rest,
  case
    when ri.home_rest is null then 0
    else coalesce(ri.previous_rest, prev.home_rest, p.norm) + coalesce(ri.incoming, 0)
      - (coalesce(ri.movement, 0) + coalesce(tm.quantity, 0)) - ri.home_rest
  end as sale,
  case
    when ri.home_rest is null then 0
    else (
      coalesce(ri.previous_rest, prev.home_rest, p.norm) + coalesce(ri.incoming, 0)
        - (coalesce(ri.movement, 0) + coalesce(tm.quantity, 0)) - ri.home_rest
    ) * p.price
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
  select sum(
    case
      when t.from_point_id = r.point_id then t.quantity
      when t.to_point_id = r.point_id then -t.quantity
      else 0
    end
  ) as quantity
  from transfers t
  where t.transfer_date = r.report_date and t.product_id = p.id
) tm on true
where p.active = true;

-- ─── RLS ────────────────────────────────────────────────────────────

alter table points enable row level security;
alter table products enable row level security;
alter table profiles enable row level security;
alter table drivers enable row level security;
alter table daily_reports enable row level security;
alter table report_items enable row level security;
alter table transfers enable row level security;
alter table cash_columns enable row level security;
alter table cash_custom_expenses enable row level security;

create or replace function current_app_role()
returns app_role language sql stable as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function current_point_id()
returns text language sql stable as $$
  select point_id from profiles where id = auth.uid()
$$;

create policy "points read" on points for select using (auth.uid() is not null);
create policy "products read" on products for select using (auth.uid() is not null);
create policy "admin manage points" on points for all using (current_app_role() = 'admin') with check (current_app_role() = 'admin');
create policy "admin manage products" on products for all using (current_app_role() = 'admin') with check (current_app_role() = 'admin');

create policy "reports scoped read" on daily_reports for select using (
  current_app_role() in ('admin', 'manager', 'accountant') or point_id = current_point_id()
);
create policy "managers manage reports" on daily_reports for all
  using (current_app_role() in ('admin', 'manager'))
  with check (current_app_role() in ('admin', 'manager'));

create policy "report items scoped read" on report_items for select using (
  exists (
    select 1 from daily_reports r
    where r.id = report_items.report_id
      and (current_app_role() in ('admin', 'manager', 'accountant') or r.point_id = current_point_id())
  )
);
create policy "managers manage report items" on report_items for all
  using (current_app_role() in ('admin', 'manager'))
  with check (current_app_role() in ('admin', 'manager'));

create policy "drivers update home_rest only" on report_items for update using (
  exists (
    select 1 from daily_reports r
    where r.id = report_items.report_id and r.status = 'open' and r.point_id = current_point_id()
  )
) with check (
  exists (
    select 1 from daily_reports r
    where r.id = report_items.report_id and r.status = 'open' and r.point_id = current_point_id()
  )
);

create or replace function guard_report_item_update()
returns trigger language plpgsql as $$
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
    if new.incoming is distinct from old.incoming
      or new.movement is distinct from old.movement
      or new.extra_request is distinct from old.extra_request
      or new.current_rest is distinct from old.current_rest then
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

create policy "transfers read" on transfers for select using (
  current_app_role() in ('admin', 'manager', 'accountant')
  or from_point_id = current_point_id() or to_point_id = current_point_id()
);
create policy "transfers write" on transfers for all
  using (current_app_role() in ('admin', 'manager'))
  with check (current_app_role() in ('admin', 'manager'));

create policy "cash read" on cash_columns for select using (
  exists (
    select 1 from daily_reports r
    where r.id = cash_columns.report_id
      and (current_app_role() in ('admin', 'manager', 'accountant') or r.point_id = current_point_id())
  )
);
create policy "cash write" on cash_columns for all
  using (current_app_role() in ('admin', 'manager', 'accountant'))
  with check (current_app_role() in ('admin', 'manager', 'accountant'));

create policy "custom expenses read" on cash_custom_expenses for select using (auth.uid() is not null);
create policy "custom expenses write" on cash_custom_expenses for all
  using (current_app_role() in ('admin', 'manager', 'accountant'))
  with check (current_app_role() in ('admin', 'manager', 'accountant'));

-- Seed points (text ids match app template)
insert into points (id, name, sheet_name, excel_title) values
  ('jvc', 'JVC', 'JVC', 'B1 JVC'),
  ('business-bay', 'Bussines Bay', 'Bussines Bay', 'B2 Bussines Bay'),
  ('silicon-oasis', 'Silicon Oasis', 'Selicon', 'B3 Silicon Oasis'),
  ('al-qusais', 'Al-Qusais', 'Al-Qusais', 'B4 Al Qusais'),
  ('tikom', 'Tikom', 'Tikom', 'B5 Tikkom')
on conflict (id) do update set
  name = excluded.name,
  sheet_name = excluded.sheet_name,
  excel_title = excluded.excel_title;
