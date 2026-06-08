create table branches (
  id uuid primary key default gen_random_uuid(),
  name varchar(160) not null,
  code varchar(64) not null unique,
  address text,
  phone varchar(64),
  status varchar(32) not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table users add constraint users_branch_fk foreign key (branch_id) references branches(id) on delete set null;
create trigger branches_updated_at before update on branches for each row execute function set_updated_at();
