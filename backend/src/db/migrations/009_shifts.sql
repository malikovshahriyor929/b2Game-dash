create table shifts (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  opened_by uuid not null references users(id),
  closed_by uuid null references users(id),
  status varchar(32) not null default 'open' check (status in ('open','closed')),
  starting_cash numeric(14,2) not null default 0,
  expected_cash numeric(14,2) not null default 0,
  actual_cash numeric(14,2),
  card_total numeric(14,2) not null default 0,
  qr_total numeric(14,2) not null default 0,
  product_sales numeric(14,2) not null default 0,
  session_sales numeric(14,2) not null default 0,
  refunds numeric(14,2) not null default 0,
  difference numeric(14,2) not null default 0,
  notes text,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index one_open_shift_per_branch on shifts(branch_id) where status='open';
create trigger shifts_updated_at before update on shifts for each row execute function set_updated_at();
