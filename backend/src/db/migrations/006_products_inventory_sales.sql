create table products (
  id uuid primary key default gen_random_uuid(),
  name varchar(160) not null,
  category varchar(120) not null,
  barcode varchar(80) not null unique,
  price numeric(14,2) not null check (price >= 0),
  cost numeric(14,2) not null default 0 check (cost >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table inventory (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  stock_quantity int not null default 0,
  low_stock_threshold int not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(branch_id, product_id)
);

create table inventory_movements (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  type varchar(32) not null check (type in ('sale','restock','adjustment','refund')),
  quantity int not null,
  before_quantity int not null,
  after_quantity int not null,
  reason text,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table sales (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  session_id uuid null references sessions(id) on delete set null,
  customer_id uuid null references customers(id) on delete set null,
  sold_by uuid not null references users(id),
  subtotal numeric(14,2) not null,
  discount numeric(14,2) not null default 0,
  total numeric(14,2) not null,
  total_cost numeric(14,2) not null,
  profit numeric(14,2) not null,
  payment_status varchar(32) not null default 'pending' check (payment_status in ('pending','paid','refunded','cancelled')),
  payment_method varchar(32) not null default 'cash' check (payment_method in ('cash','card','qr','balance','mixed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid not null references products(id),
  product_name varchar(160) not null,
  barcode varchar(80) not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(14,2) not null,
  unit_cost numeric(14,2) not null,
  total_price numeric(14,2) not null,
  total_cost numeric(14,2) not null,
  profit numeric(14,2) not null
);

alter table payments add constraint payments_sale_fk foreign key (sale_id) references sales(id) on delete set null;
create trigger products_updated_at before update on products for each row execute function set_updated_at();
create trigger inventory_updated_at before update on inventory for each row execute function set_updated_at();
