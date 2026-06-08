create table rig_connections (
  id uuid primary key default gen_random_uuid(),
  rig_id varchar(160) not null unique,
  simulator_id uuid null references simulators(id) on delete set null,
  branch_id uuid null references branches(id) on delete set null,
  hostname varchar(160) not null,
  label varchar(160) not null,
  version varchar(80) not null default 'unknown',
  latest_version varchar(80),
  locked boolean not null default false,
  lock_message text,
  online boolean not null default false,
  update_status varchar(240),
  first_seen_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rig_connections_status_idx on rig_connections(online, last_seen_at);
create trigger rig_connections_updated_at before update on rig_connections for each row execute function set_updated_at();
