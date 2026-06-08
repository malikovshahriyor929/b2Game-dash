create table repair_requests (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  simulator_id uuid not null references simulators(id) on delete restrict,
  requested_by uuid not null references users(id),
  approved_by uuid null references users(id),
  confirmed_by uuid null references users(id),
  title varchar(200) not null,
  description text not null,
  error_type varchar(40) not null check (error_type in ('game_error','device_error','network_error','payment_error','hardware_error','other')),
  priority varchar(32) not null check (priority in ('low','medium','high','critical')),
  status varchar(64) not null default 'requested' check (status in ('requested','approved','rejected','need_more_details','fixing','fixed_waiting_confirmation','confirmed_fixed','rejected_fix')),
  admin_note text,
  super_admin_note text,
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  fixing_started_at timestamptz,
  marked_fixed_at timestamptz,
  confirmed_at timestamptz,
  revenue_impact numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table bookings add constraint bookings_repair_fk foreign key (repair_request_id) references repair_requests(id) on delete set null;
create index repair_branch_status_idx on repair_requests(branch_id, status);
create trigger repair_requests_updated_at before update on repair_requests for each row execute function set_updated_at();
