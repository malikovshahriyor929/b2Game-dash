create table logs (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid null references branches(id) on delete set null,
  actor_id uuid null references users(id) on delete set null,
  actor_name varchar(160),
  actor_role varchar(32),
  action_type varchar(80) not null,
  entity_type varchar(80) not null,
  entity_id uuid,
  simulator_id uuid null references simulators(id) on delete set null,
  session_id uuid null references sessions(id) on delete set null,
  amount numeric(14,2),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index logs_filter_idx on logs(branch_id, action_type, entity_type, created_at desc);
