# Подключение Supabase

Приложение сейчас работает локально через `localStorage`. Supabase-схема уже подготовлена в папке `supabase/migrations`, чтобы потом заменить локальное хранение на API.

## 1. Создать проект

1. Создайте проект в Supabase.
2. Скопируйте `Project URL` и `anon public key`.
3. Заполните `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## 2. Применить миграции

Через Supabase CLI:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Либо откройте SQL Editor в Supabase и примените файлы из `supabase/migrations` по порядку:

1. `20260530120000_ledger_schema.sql`
2. `20260530183000_operational_controls.sql`

## 3. Роли

Таблица `profiles` использует роли:

- `admin` - управляет точками, товарами, водителями.
- `manager` - ведет отчеты, перемещения и кассу.
- `accountant` - видит отчеты и редактирует кассу.
- `driver` - заполняет только остатки своей точки.

После создания пользователя в Supabase Auth добавьте строку в `profiles` с его `auth.users.id`.

## 4. Остатки

Для жесткого переноса остатков используйте SQL-функцию:

```sql
select close_report_and_prepare_next_day('2026-05-30_jvc');
```

Она:

- запрещает закрытие, если есть незаполненные остатки;
- закрывает отчет;
- создает отчет следующего дня;
- переносит `home_rest` как `previous_rest`;
- создает кассовые колонки водителей с питанием `80 AED` по умолчанию.

## 5. Проверка

Полезные views:

- `v_report_lines` - строки отчета с продажами и суммами.
- `v_cash_totals` - касса с учетом доп. расходов.
- `v_daily_point_revenue` - выручка по точкам по дням.
- `v_daily_driver_revenue` - выручка по водителям по дням.
- `v_stock_carryover_audit` - аудит переноса остатков.

## 6. Следующий шаг в коде

Чтобы приложение начало читать/писать Supabase вместо `localStorage`, нужно добавить клиент Supabase и заменить функции `loadState/saveState` в `app/lib/storage.ts` на CRUD-операции к таблицам. До этого миграции можно использовать как backend-контракт.
