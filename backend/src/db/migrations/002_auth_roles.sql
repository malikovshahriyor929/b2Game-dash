create table users (
  id uuid primary key default gen_random_uuid(),
  name varchar(160) not null,
  email varchar(220) not null unique,
  password_hash text not null,
  role varchar(32) not null check (role in ('admin','super_admin')),
  branch_id uuid null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger users_updated_at before update on users for each row execute function set_updated_at();
