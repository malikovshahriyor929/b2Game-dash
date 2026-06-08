create table customers (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  name varchar(160) not null,
  phone varchar(64) not null,
  balance numeric(14,2) not null default 0,
  bonus numeric(14,2) not null default 0,
  total_spent numeric(14,2) not null default 0,
  sessions_count int not null default 0,
  last_visit_at timestamptz,
  status varchar(32) not null default 'active' check (status in ('active','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  simulator_id uuid not null references simulators(id) on delete restrict,
  customer_id uuid null references customers(id) on delete set null,
  customer_name varchar(160),
  phone varchar(64),
  tariff_id uuid null references tariffs(id) on delete set null,
  status varchar(32) not null check (status in ('active','paused','stopped','unpaid','cancelled')),
  payment_mode varchar(32) not null check (payment_mode in ('prepaid','postpaid','balance')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes int not null,
  added_minutes int not null default 0,
  remaining_seconds int not null default 0,
  session_amount numeric(14,2) not null default 0,
  added_time_amount numeric(14,2) not null default 0,
  shop_amount numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  paid_amount numeric(14,2) not null default 0,
  debt_amount numeric(14,2) not null default 0,
  created_by uuid not null references users(id),
  stopped_by uuid null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  session_id uuid null references sessions(id) on delete set null,
  sale_id uuid null,
  customer_id uuid null references customers(id) on delete set null,
  amount numeric(14,2) not null check (amount >= 0),
  method varchar(32) not null check (method in ('cash','card','qr','balance','mixed')),
  cash_amount numeric(14,2) not null default 0,
  card_amount numeric(14,2) not null default 0,
  qr_amount numeric(14,2) not null default 0,
  balance_amount numeric(14,2) not null default 0,
  status varchar(32) not null default 'paid' check (status in ('paid','refunded','cancelled')),
  paid_by_admin_id uuid not null references users(id),
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table simulators add constraint simulators_current_session_fk foreign key (current_session_id) references sessions(id) on delete set null;
create index sessions_branch_status_idx on sessions(branch_id, status);
create trigger customers_updated_at before update on customers for each row execute function set_updated_at();
create trigger sessions_updated_at before update on sessions for each row execute function set_updated_at();
