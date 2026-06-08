create table settings (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid null references branches(id) on delete cascade,
  key varchar(120) not null,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(branch_id, key)
);

create trigger settings_updated_at before update on settings for each row execute function set_updated_at();
