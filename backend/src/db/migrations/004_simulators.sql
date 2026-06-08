create table tariffs (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid null references branches(id) on delete cascade,
  name varchar(160) not null,
  simulator_zone varchar(32) not null check (simulator_zone in ('main','vip','all')),
  duration_minutes int not null check (duration_minutes > 0),
  price numeric(14,2) not null check (price >= 0),
  type varchar(32) not null check (type in ('time','package','promo','vip','group','birthday','night','weekend')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table simulators (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  name varchar(160) not null,
  code varchar(64) not null,
  zone varchar(32) not null check (zone in ('main','vip')),
  simulator_type varchar(32) not null check (simulator_type in ('main','vip')),
  status varchar(64) not null default 'ready_to_play' check (status in ('ready_to_play','busy','reserved','unpaid','broken','repair_requested','repair_approved','fixing','fixed_waiting_confirmation','offline','locked')),
  device_id varchar(160) unique,
  ip_address varchar(96),
  ws_rig_id varchar(160),
  is_online boolean not null default false,
  current_session_id uuid null,
  last_seen_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(branch_id, code)
);

create index simulators_branch_status_idx on simulators(branch_id, status);
create trigger tariffs_updated_at before update on tariffs for each row execute function set_updated_at();
create trigger simulators_updated_at before update on simulators for each row execute function set_updated_at();
