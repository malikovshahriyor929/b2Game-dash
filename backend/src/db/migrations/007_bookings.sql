create table bookings (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  simulator_id uuid not null references simulators(id) on delete restrict,
  booking_type varchar(32) not null check (booking_type in ('customer_booking','repair_booking')),
  customer_id uuid null references customers(id) on delete set null,
  customer_name varchar(160),
  phone varchar(64),
  repair_request_id uuid null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status varchar(32) not null default 'pending' check (status in ('pending','confirmed','arrived','cancelled','no_show','completed')),
  note text,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index bookings_conflict_idx on bookings(simulator_id, start_time, end_time, status);
create trigger bookings_updated_at before update on bookings for each row execute function set_updated_at();
