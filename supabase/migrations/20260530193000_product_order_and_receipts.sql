-- Canonical product order and receipt helpers.
-- This migration keeps report_items.incoming as the source for "Приходы".

alter table products
  add column if not exists sort_order int;

create unique index if not exists idx_products_sort_order_unique
  on products(sort_order)
  where sort_order is not null;

create or replace view v_ordered_products as
select
  id,
  name,
  price,
  norm,
  category,
  active,
  point_ids,
  sort_order
from products
where active = true
order by sort_order nulls last, name;

create or replace view v_receipts as
select
  r.id as report_id,
  r.report_date,
  r.point_id,
  p.sort_order,
  p.id as product_id,
  p.name as product_name,
  ri.incoming,
  ri.updated_at
from daily_reports r
join report_items ri on ri.report_id = r.id
join products p on p.id = ri.product_id
where ri.incoming <> 0
order by r.report_date, r.point_id, p.sort_order nulls last, p.name;

create or replace function ensure_report_items_for_all_products(p_report_id text)
returns int
language plpgsql
security definer
as $$
declare
  target_point_id text;
  target_report_date date;
  inserted_count int;
begin
  select point_id, report_date
    into target_point_id, target_report_date
  from daily_reports
  where id = p_report_id;

  if target_point_id is null then
    raise exception 'Report % not found', p_report_id;
  end if;

  insert into report_items (report_id, product_id, previous_rest, incoming, movement, extra_request)
  select
    p_report_id,
    p.id,
    previous_item.previous_rest,
    0,
    0,
    0
  from products p
  left join lateral (
    select coalesce(ri.home_rest, ri.current_rest, 0) as previous_rest
    from daily_reports pr
    join report_items ri on ri.report_id = pr.id and ri.product_id = p.id
    where pr.point_id = target_point_id
      and pr.report_date < target_report_date
      and pr.status = 'closed'
    order by pr.report_date desc
    limit 1
  ) previous_item on true
  where p.active = true
    and (p.point_ids = '{}' or target_point_id = any(p.point_ids))
  on conflict (report_id, product_id) do update
    set previous_rest = coalesce(report_items.previous_rest, excluded.previous_rest),
        updated_at = now()
    where report_items.previous_rest is null;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

create or replace function ensure_report_items_after_insert()
returns trigger
language plpgsql
security definer
as $$
begin
  perform ensure_report_items_for_all_products(new.id);
  return new;
end;
$$;

drop trigger if exists trg_daily_reports_ensure_items on daily_reports;
create trigger trg_daily_reports_ensure_items
  after insert on daily_reports
  for each row execute function ensure_report_items_after_insert();

with canonical_products (id, name, category, sort_order, active) as (
values
  ('absolut-blue-ltr', 'ABSOLUT BLUE LTR', 'Крепкий алкоголь', 1, true),
  ('j-w-red-label-1-ltr', 'J/W RED LABEL  1 LTR', 'Крепкий алкоголь', 2, true),
  ('j-w-blak-label-1-ltr', 'J/W BLAK LABEL 1 LTR', 'Крепкий алкоголь', 3, true),
  ('jack-daniels-ltr', 'JACK DANIELS LTR', 'Крепкий алкоголь', 4, true),
  ('chivas-regal-1-ltr', 'CHIVAS REGAL 1 LTR', 'Крепкий алкоголь', 5, true),
  ('heineken-beer-cans-33cl', 'HEINEKEN BEER CANS 33CL', 'Пиво', 6, true),
  ('budweiser-beer-can-33-35', 'BUDWEISER BEER CAN 33/35', 'Пиво', 7, true),
  ('carlsberg-50cl-can', 'CARLSBERG 50CL Can', 'Пиво', 8, true),
  ('red-horse-50cl-can', 'RED HORSE 50CL Can', 'Пиво', 9, true),
  ('amstel-light-slim-can-35', 'AMSTEL LIGHT Slim Can 35', 'Пиво', 10, true),
  ('corona-beer-btl-35-5cl', 'CORONA BEER BTL 35.5CL', 'Пиво', 11, true),
  ('stella-33cl-btls', 'STELLA 33CL BTLS', 'Пиво', 12, true),
  ('stella-artois-33-cl-cans', 'STELLA ARTOIS 33 CL cans', 'Пиво', 13, true),
  ('heineken-beer-btl-33cl', 'HEINEKEN BEER BTL 33CL', 'Пиво', 14, true),
  ('budweiser-berr-btl-33cl', 'BUDWEISER BERR BTL 33cl', 'Пиво', 15, true),
  ('smirnoff-ice-red-27-5cl', 'SMIRNOFF ICE RED 27,5CL', 'Пиво', 16, true),
  ('peroni-nastro-azuro-beer', 'PERONI NASTRO AZURO BEER', 'Пиво', 17, true),
  ('jc-chardonnay-75cl', 'JC CHARDONNAY 75CL', 'Вино', 18, true),
  ('jc-shiraz-cabarnet-75cl', 'JC SHIRAZ CABARNET 75CL', 'Вино', 19, true),
  ('ces-pinot-grig-d-ven-fio', 'CES PINOT GRIG D VEN FIO', 'Вино', 20, true),
  ('le-grand-noir-sauv-blanc', 'Le GRAND Noir SAUV BLANC', 'Вино', 21, true),
  ('le-grand-noir-merlot-75c', 'Le GRAND Noir MERLOT 75C', 'Вино', 22, true),
  ('mip-collection-rose-provienc-7', 'MIP Collection ROSE Provienc 7', 'Вино', 23, true),
  ('ch-ksara-sunset-rose-75c', 'CH KSARA SUNSET ROSE 75C', 'Вино', 24, true),
  ('mateus-rose-75cl', 'MATEUS ROSE 75CL', 'Вино', 25, true),
  ('bacardi-white-rum-ltr', 'BACARDI WHITE RUM LTR', 'Крепкий алкоголь', 26, true),
  ('bacardi-black-1-ltr', 'BACARDI BLACK. 1 LTR', 'Крепкий алкоголь', 27, true),
  ('bacardi-gold-ltr', 'BACARDI GOLD LTR', 'Крепкий алкоголь', 28, true),
  ('jose-cuervo-gold-ltr', 'JOSE CUERVO GOLD LTR', 'Крепкий алкоголь', 29, true),
  ('jose-cuervo-silver-espec', 'JOSE CUERVO SILVER Espec', 'Крепкий алкоголь', 30, true),
  ('tanqueray-gin-ltr', 'TANQUERAY GIN LTR', 'Крепкий алкоголь', 31, true),
  ('gordons-pink-gin-ltr', 'GORDONS PINK GIN Ltr', 'Крепкий алкоголь', 32, true),
  ('gordons-gin-ltr', 'GORDONS GIN LTR', 'Крепкий алкоголь', 33, true),
  ('bombay-sapphire-gin-ltr', 'BOMBAY SAPPHIRE GIN LTR', 'Крепкий алкоголь', 34, true),
  ('hendricks-gin-1-ltr', 'HENDRICKS GIN 1 LTR', 'Крепкий алкоголь', 35, true),
  ('captain-morgan-blk-ltr', 'CAPTAIN MORGAN BLK LTR', 'Крепкий алкоголь', 36, true),
  ('captain-morgan-spiced-go', 'CAPTAIN MORGAN SPICED GO', 'Крепкий алкоголь', 37, true),
  ('malibu-whithe-rum-ltr', 'MALIBU WHITHE RUM LTR', 'Крепкий алкоголь', 38, true),
  ('baileys-irish-cream-ltr', 'BAILEYS IRISH CREAM LTR', 'Крепкий алкоголь', 39, true),
  ('amarula-cream-ltr', 'AMARULA CREAM LTR', 'Крепкий алкоголь', 40, true),
  ('jameson-irish-wsk-ltr', 'JAMESON IRISH WSK LTR', 'Крепкий алкоголь', 41, true),
  ('j-b-rare-scotch-1-ltr', 'J&B RARE SCOTCH 1 LTR', 'Крепкий алкоголь', 42, true),
  ('d-h-clarnet-select-5ltr', 'D/H CLARNET SELECT 5LTR', 'Вино', 43, true),
  ('d-h-prem-grn-cru-5ltr', 'D/H PREM GRN CRU 5LTR', 'Вино', 44, true),
  ('martini-bianco-1-ltr', 'MARTINI BIANCO 1 LTR', 'Крепкий алкоголь', 45, true),
  ('smirnoff-r-l-1-ltr', 'SMIRNOFF R/L 1 LTR', 'Крепкий алкоголь', 46, true),
  ('stolichnaya-vodka-ltr', 'STOLICHNAYA VODKA LTR', 'Крепкий алкоголь', 47, true),
  ('russian-std-peters-l', 'RUSSIAN STD. PETERS L', 'Крепкий алкоголь', 48, true),
  ('jagermeister-1-ltr', 'JAGERMEISTER  1 LTR', 'Крепкий алкоголь', 49, true),
  ('belvedere-vodka-ltr', 'BELVEDERE VODKA  LTR', 'Крепкий алкоголь', 50, true),
  ('grey-goose-vodka-ltr', 'GREY GOOSE VODKA LTR', 'Крепкий алкоголь', 51, true),
  ('beluga-noble-vodka-70cl', 'BELUGA  NOBLE VODKA 70CL', 'Крепкий алкоголь', 52, true),
  ('cirok-vodka-ltr', 'CIROK VODKA LTR', 'Крепкий алкоголь', 53, true),
  ('skyy-vodka-1-ltr', 'SKYY VODKA 1 LTR', 'Крепкий алкоголь', 54, true),
  ('arak-touma-50-54cl', 'ARAK TOUMA 50/54CL', 'Крепкий алкоголь', 55, true),
  ('efe-fresh-grape-raki-ltr-green', 'EFE Fresh Grape RAKI LTR Green', 'Крепкий алкоголь', 56, true),
  ('j-w-gold-label-reserv-1', 'J/W GOLD LABEL RESERV 1', 'Премиум', 57, true),
  ('j-w-double-black-ltr', 'J/W DOUBLE BLACK LTR', 'Премиум', 58, true),
  ('j-w-blue-label-1-ltr', 'J/W BLUE LABEL 1 LTR', 'Премиум', 59, true),
  ('hennessy-vs-ltr', 'HENNESSY VS LTR', 'Крепкий алкоголь', 60, true),
  ('hennessy-v-s-o-p-1-ltr-pr', 'HENNESSY V.S.O.P 1 LTR Pr', 'Премиум', 61, true),
  ('hennessy-xo-ltr', 'HENNESSY XO LTR', 'Премиум', 62, true),
  ('remy-martin-vsop-ltr', 'REMY MARTIN VSOP LTR', 'Премиум', 63, true),
  ('chivas-18-yrs-ltr', 'CHIVAS 18 YRS LTR', 'Премиум', 64, true),
  ('royal-salute-21-yrs-ltr', 'ROYAL SALUTE 21 YRS LTR', 'Премиум', 65, true),
  ('patron-coffe', 'PATRON COFFE', 'Крепкий алкоголь', 66, true),
  ('patron-silver-75cl-tequi', 'PATRON SILVER  75CL TEQUI', 'Крепкий алкоголь', 67, true),
  ('patron-anejo-75cl-gold-t', 'PATRON ANEJO 75CL GOLD T', 'Крепкий алкоголь', 68, true),
  ('don-julio-blanco-70-75cl', 'DON JULIO BLANCO 70/75CL', 'Крепкий алкоголь', 69, true),
  ('don-julio-reposado-70-75', 'DON JULIO REPOSADO 70/75', 'Крепкий алкоголь', 70, true),
  ('don-julio-anejo-70-75cl', 'DON JULIO ANEJO 70/75CL', 'Крепкий алкоголь', 71, true),
  ('don-julio-1942-anejo-70', 'DON JULIO 1942 ANEJO 70', 'Премиум', 72, true),
  ('asti-martini-75cl', 'ASTI MARTINI 75CL', 'Шампанское', 73, true),
  ('jc-chardonnay-pinot-noir', 'JC CHARDONNAY PINOT NOIR', 'Вино', 74, true),
  ('bottega-vino-d-poet-pros', 'BOTTEGA VINO D POET PROS', 'Шампанское', 75, true),
  ('bottega-rose-proseco-poe', 'BOTTEGA ROSE Proseco POE', 'Шампанское', 76, true),
  ('bottega-gold-brut-75c-vi', 'BOTTEGA GOLD BRUT 75C vi', 'Шампанское', 77, true),
  ('veuve-clicquot-y-l-ponsr', 'VEUVE CLICQUOT Y/L PONSR', 'Шампанское', 78, true),
  ('moet-chandon-brut-imp', 'MOET & CHANDON BRUT IMP', 'Шампанское', 79, true),
  ('moet-chandon-rose-75cl', 'MOET & CHANDON  ROSE 75CL', 'Шампанское', 80, true),
  ('moet-ice-imperial-75cl', 'MOET ICE IMPERIAL 75cl', 'Шампанское', 81, true),
  ('dom-perignon-m-c-75cl', 'DOM PERIGNON M&C 75CL', 'Премиум', 82, true),
  ('glendfidich-spl-r12yrs', 'GLENDFIDICH SPL R12YRS', 'Премиум', 83, true),
  ('glendfidich-15-yrs-ltr', 'GLENDFIDICH 15 YRS LTR', 'Премиум', 84, true),
  ('glendfidich-18y-smal-bat', 'GLENDFIDICH 18Y Smal Bat', 'Премиум', 85, true),
  ('baron-rimapere-sauv-blan', 'BARON RIMAPERE SAUV BLAN', 'Вино', 86, true),
  ('marchesi-gavi-d-gavi-75c', 'MARCHESI GAVI D GAVI 75C', 'Вино', 87, true),
  ('laroche-chablis-st-marti', 'LAROCHE CHABLIS ST MARTI', 'Вино', 88, true),
  ('l-j-bourgogne-bl-cuv-d-ja', 'L J BOURGOGNE BL Cuv D ja', 'Вино', 89, true),
  ('castel-ch-barreyres-haut-m-75', 'CASTEL CH. BARREYRES HAUT M 75', 'Вино', 90, true),
  ('ch-saint-leon-box-sup-75', 'CH SAINT LEON BOX SUP 75', 'Вино', 91, true),
  ('campo-viejo-reserva-rioj', 'CAMPO VIEJO RESERVA RIOJ', 'Вино', 92, true),
  ('campo-viejo-gran-reserva', 'CAMPO VIEJO GRAN RESERVA', 'Вино', 93, true),
  ('m-minuty-rose-provence', 'M MINUTY ROSE PROVENCE', 'Вино', 94, true),
  ('cav-d-escln-whispering', 'Cav D ESCLN WHISPERING', 'Вино', 95, true),
  ('jack-daniels-honey-ltr', 'JACK DANIELS HONEY LTR', 'Крепкий алкоголь', 96, true),
  ('baccardi-breezer-w-melon', 'BACCARDI BREEZER W/MELON', 'Пиво', 97, true),
  ('asahi-beer-btls-super-dr', 'ASAHI BEER BTLS SUPER DR', 'Пиво', 98, true),
  ('aperole-aperitivo-ltr', 'APEROLE Aperitivo LTR', 'Крепкий алкоголь', 99, true),
  ('chivas-25-yrs', 'CHIVAS 25 YRS', 'Премиум', 100, true),
  ('clase-azul-reposado-70-7', 'CLASE AZUL Reposado 70/7', 'Премиум', 101, true),
  ('ms-ch-perron-lalande-d-pomerol', 'MS CH PERRON LALANDE D POMEROL', 'Вино', 102, true),
  ('la-celia-reserva-malbec-75cl', 'LA CELIA RESERVA MALBEC 75CL', 'Вино', 103, true),
  ('calvet-sancerre-les-hautes', 'CALVET SANCERRE Les Hautes', 'Вино', 104, true),
  ('chateau-des-laurets-saint-emilion', 'CHATEAU des LAURETS Saint Emilion', 'Вино', 105, true),
  ('guinness-beer-cans-44cl', 'GUINNESS BEER CANS 44cl', 'Пиво', 106, true),
  ('xxl-vodka-mix-energy-can', 'XXL  VODKA MIX ENERGY CAN', 'Пиво', 107, true),
  ('monkey-47-dry-gin-50cl', 'MONKEY 47  DRY GIN 50CL', 'Премиум', 108, true),
  ('gentleman-jack-1-ltr-jd', 'GENTLEMAN JACK 1 LTR JD', 'Крепкий алкоголь', 109, true),
  ('macallan-12-yr-fin-trip', 'MACALLAN 12 YR FIN TRIP', 'Премиум', 110, true),
  ('macallan-15-yrs-double-ca', 'MACALLAN 15 YRS Double Ca', 'Премиум', 111, true),
  ('macallan-18-yrs', 'MACALLAN 18 YRS', 'Премиум', 112, true),
  ('hoegarden-blanche-33cl-b', 'HOEGARDEN BLANCHE 33CL B', 'Пиво', 113, true),
  ('tequila-rose-liquer-70c-s-bery', 'TEQUILA ROSE LIQUER 70C S/Bery', 'Крепкий алкоголь', 114, true),
  ('malfy-con-ara-blood-orange-gin-70', 'MALFY Con Ara Blood Orange GIN 70', 'Крепкий алкоголь', 115, true),
  ('malfy-gin-rosa-70cl-grapfruite', 'MALFY GIN ROSA 70cl GrapfruitE', 'Крепкий алкоголь', 116, true),
  ('drumshanb-gunpoder-gin', 'Drumshanb GUNPODER GIN', 'Крепкий алкоголь', 117, true),
  ('ch-saint-maur-l-exelenc-ros-7', 'CH SAINT MAUR L Exelenc ROS 7', 'Вино', 118, true),
  ('ch-lagrange-2010-st-julien', 'CH LAGRANGE 2010 St Julien', 'Вино', 119, true),
  ('ruinart-blanc-d-blanc-75-cl', 'RUINART BLANC D BLANC 75 CL', 'Шампанское', 120, true),
  ('zonin-prosecco-75cl', 'ZONIN PROSECCO 75CL', 'Шампанское', 121, true),
  ('oyster-bay-sauvignon', 'OYSTER BAY SAUVIGNON', 'Вино', 122, true),
  ('balantines', 'BALANTINES', 'Крепкий алкоголь', 123, true)
)
insert into products (id, name, category, sort_order, active, point_ids, numbers_by_point)
select
  id,
  name,
  category,
  sort_order,
  active,
  array['jvc', 'business-bay', 'silicon-oasis', 'al-qusais', 'tikom'],
  jsonb_build_object(
    'jvc', sort_order,
    'business-bay', sort_order,
    'silicon-oasis', sort_order,
    'al-qusais', sort_order,
    'tikom', sort_order
  )
from canonical_products
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  sort_order = excluded.sort_order,
  active = excluded.active,
  point_ids = excluded.point_ids,
  numbers_by_point = excluded.numbers_by_point,
  updated_at = now();

do $$
declare
  report_record record;
begin
  for report_record in select id from daily_reports loop
    perform ensure_report_items_for_all_products(report_record.id);
  end loop;
end $$;
