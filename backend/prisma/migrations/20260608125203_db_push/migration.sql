-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "branch_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulators" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "simulator_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ready_to_play',
    "device_id" TEXT,
    "ip_address" TEXT,
    "ws_rig_id" TEXT,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "current_session_id" UUID,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tariffs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID,
    "name" TEXT NOT NULL,
    "simulator_zone" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "weekday_price" DECIMAL(65,30),
    "weekend_price" DECIMAL(65,30),
    "weekday_bonus" TEXT,
    "weekend_bonus" TEXT,
    "type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tariffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "bonus" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sessions_count" INTEGER NOT NULL DEFAULT 0,
    "last_visit_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "simulator_id" UUID NOT NULL,
    "customer_id" UUID,
    "customer_name" TEXT,
    "phone" TEXT,
    "tariff_id" UUID,
    "status" TEXT NOT NULL,
    "payment_mode" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "duration_minutes" INTEGER NOT NULL,
    "added_minutes" INTEGER NOT NULL DEFAULT 0,
    "remaining_seconds" INTEGER NOT NULL DEFAULT 0,
    "session_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "added_time_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "shop_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paid_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "debt_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_by" UUID NOT NULL,
    "stopped_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "session_id" UUID,
    "sale_id" UUID,
    "customer_id" UUID,
    "amount" DECIMAL(65,30) NOT NULL,
    "method" TEXT NOT NULL,
    "cash_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "card_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "qr_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "balance_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "received_amount" DECIMAL(65,30),
    "change_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "paid_by_admin_id" UUID NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "cost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "icon" TEXT NOT NULL DEFAULT 'snack',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "before_quantity" INTEGER NOT NULL,
    "after_quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "session_id" UUID,
    "customer_id" UUID,
    "sold_by" UUID NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL,
    "total_cost" DECIMAL(65,30) NOT NULL,
    "profit" DECIMAL(65,30) NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "payment_method" TEXT NOT NULL DEFAULT 'cash',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sale_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(65,30) NOT NULL,
    "unit_cost" DECIMAL(65,30) NOT NULL,
    "total_price" DECIMAL(65,30) NOT NULL,
    "total_cost" DECIMAL(65,30) NOT NULL,
    "profit" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "simulator_id" UUID NOT NULL,
    "booking_type" TEXT NOT NULL,
    "customer_id" UUID,
    "customer_name" TEXT,
    "phone" TEXT,
    "repair_request_id" UUID,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "simulator_id" UUID NOT NULL,
    "requested_by" UUID NOT NULL,
    "approved_by" UUID,
    "confirmed_by" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "error_type" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "admin_note" TEXT,
    "super_admin_note" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "fixing_started_at" TIMESTAMP(3),
    "marked_fixed_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "revenue_impact" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repair_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "opened_by" UUID NOT NULL,
    "closed_by" UUID,
    "status" TEXT NOT NULL DEFAULT 'open',
    "starting_cash" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "expected_cash" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "actual_cash" DECIMAL(65,30),
    "card_total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "qr_total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "product_sales" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "session_sales" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "refunds" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "difference" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID,
    "actor_id" UUID,
    "actor_name" TEXT,
    "actor_role" TEXT,
    "action_type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "simulator_id" UUID,
    "session_id" UUID,
    "amount" DECIMAL(65,30),
    "details" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rig_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rig_id" TEXT NOT NULL,
    "simulator_id" UUID,
    "branch_id" UUID,
    "hostname" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT 'unknown',
    "latest_version" TEXT,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "lock_message" TEXT,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "update_status" TEXT,
    "first_seen_at" TIMESTAMP(3),
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rig_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "branches_code_key" ON "branches"("code");

-- CreateIndex
CREATE UNIQUE INDEX "simulators_device_id_key" ON "simulators"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "simulators_branch_id_code_key" ON "simulators"("branch_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_branch_id_product_id_key" ON "inventory"("branch_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "settings_branch_id_key_key" ON "settings"("branch_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "rig_connections_rig_id_key" ON "rig_connections"("rig_id");
