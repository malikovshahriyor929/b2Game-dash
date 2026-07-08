--
-- PostgreSQL database dump
--

\restrict 00fq3w7oBJEZLdDtUUKyr2qCMXJAw14y9DdzLYjtu2e6hZgRnwYGdNAnkdm5j3D

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg12+1)
-- Dumped by pg_dump version 16.11 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: b2game_club_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO b2game_club_user;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO b2game_club_user;

--
-- Name: admin_deductions; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.admin_deductions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    shift_id uuid,
    admin_id uuid NOT NULL,
    expense_id uuid,
    type text DEFAULT 'salary_advance'::text NOT NULL,
    amount numeric(14,2) NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    note text,
    created_by uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.admin_deductions OWNER TO b2game_club_user;

--
-- Name: admin_penalty_payments; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.admin_penalty_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    shift_id uuid,
    admin_id uuid NOT NULL,
    amount numeric(14,2) NOT NULL,
    method text DEFAULT 'cash'::text NOT NULL,
    cash_amount numeric(14,2) DEFAULT 0 NOT NULL,
    card_amount numeric(14,2) DEFAULT 0 NOT NULL,
    qr_amount numeric(14,2) DEFAULT 0 NOT NULL,
    received_amount numeric(14,2),
    change_amount numeric(14,2) DEFAULT 0 NOT NULL,
    recorded_by uuid NOT NULL,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.admin_penalty_payments OWNER TO b2game_club_user;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    simulator_id uuid NOT NULL,
    booking_type text NOT NULL,
    customer_id uuid,
    customer_name text,
    phone text,
    repair_request_id uuid,
    start_time timestamp(3) without time zone NOT NULL,
    end_time timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    note text,
    created_by uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tariff_name text,
    prepayment numeric(14,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.bookings OWNER TO b2game_club_user;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.branches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    address text,
    phone text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.branches OWNER TO b2game_club_user;

--
-- Name: cash_withdrawal_requests; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.cash_withdrawal_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    shift_id uuid,
    admin_id uuid NOT NULL,
    amount numeric(14,2) NOT NULL,
    initiated_by uuid NOT NULL,
    initiator_role text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    note text,
    confirmed_by uuid,
    created_at timestamp(3) without time zone DEFAULT now() NOT NULL,
    resolved_at timestamp(3) without time zone,
    purpose text DEFAULT 'owner_withdrawal'::text NOT NULL,
    deduction_type text,
    expense_id uuid
);


ALTER TABLE public.cash_withdrawal_requests OWNER TO b2game_club_user;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    balance numeric(65,30) DEFAULT 0 NOT NULL,
    total_spent numeric(65,30) DEFAULT 0 NOT NULL,
    sessions_count integer DEFAULT 0 NOT NULL,
    last_visit_at timestamp(3) without time zone,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.customers OWNER TO b2game_club_user;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    shift_id uuid,
    amount numeric(14,2) NOT NULL,
    method text DEFAULT 'cash'::text NOT NULL,
    source text NOT NULL,
    note text,
    spent_by uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.expenses OWNER TO b2game_club_user;

--
-- Name: inventory; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.inventory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    product_id uuid NOT NULL,
    stock_quantity integer DEFAULT 0 NOT NULL,
    low_stock_threshold integer DEFAULT 5 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.inventory OWNER TO b2game_club_user;

--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.inventory_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    product_id uuid NOT NULL,
    type text NOT NULL,
    quantity integer NOT NULL,
    before_quantity integer NOT NULL,
    after_quantity integer NOT NULL,
    reason text,
    created_by uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.inventory_movements OWNER TO b2game_club_user;

--
-- Name: logs; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid,
    actor_id uuid,
    actor_name text,
    actor_role text,
    action_type text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    simulator_id uuid,
    session_id uuid,
    amount numeric(65,30),
    details jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.logs OWNER TO b2game_club_user;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    session_id uuid,
    sale_id uuid,
    customer_id uuid,
    amount numeric(65,30) NOT NULL,
    method text NOT NULL,
    cash_amount numeric(65,30) DEFAULT 0 NOT NULL,
    card_amount numeric(65,30) DEFAULT 0 NOT NULL,
    qr_amount numeric(65,30) DEFAULT 0 NOT NULL,
    balance_amount numeric(65,30) DEFAULT 0 NOT NULL,
    received_amount numeric(14,2),
    change_amount numeric(14,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'paid'::text NOT NULL,
    paid_by_admin_id uuid NOT NULL,
    paid_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    shift_id uuid,
    source_type text DEFAULT 'payment'::text NOT NULL,
    source_note text
);


ALTER TABLE public.payments OWNER TO b2game_club_user;

--
-- Name: products; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    barcode text NOT NULL,
    price numeric(65,30) NOT NULL,
    cost numeric(65,30) DEFAULT 0 NOT NULL,
    icon character varying(40) DEFAULT 'snack'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.products OWNER TO b2game_club_user;

--
-- Name: repair_requests; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.repair_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    simulator_id uuid NOT NULL,
    requested_by uuid NOT NULL,
    approved_by uuid,
    confirmed_by uuid,
    title text NOT NULL,
    description text NOT NULL,
    error_type text NOT NULL,
    priority text NOT NULL,
    status text DEFAULT 'requested'::text NOT NULL,
    admin_note text,
    super_admin_note text,
    requested_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    approved_at timestamp(3) without time zone,
    fixing_started_at timestamp(3) without time zone,
    marked_fixed_at timestamp(3) without time zone,
    confirmed_at timestamp(3) without time zone,
    revenue_impact numeric(65,30) DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closed_at timestamp(3) without time zone,
    duration_minutes integer,
    charge_amount numeric(14,2) DEFAULT 0 NOT NULL,
    review_status text DEFAULT 'open'::text NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp(3) without time zone,
    session_id uuid,
    opened_during_session boolean DEFAULT false NOT NULL
);


ALTER TABLE public.repair_requests OWNER TO b2game_club_user;

--
-- Name: rig_connections; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.rig_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rig_id text NOT NULL,
    simulator_id uuid,
    branch_id uuid,
    hostname text NOT NULL,
    label text NOT NULL,
    version text DEFAULT 'unknown'::text NOT NULL,
    latest_version text,
    locked boolean DEFAULT false NOT NULL,
    lock_message text,
    online boolean DEFAULT false NOT NULL,
    update_status text,
    first_seen_at timestamp(3) without time zone,
    last_seen_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.rig_connections OWNER TO b2game_club_user;

--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.sale_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sale_id uuid NOT NULL,
    product_id uuid NOT NULL,
    product_name text NOT NULL,
    barcode text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(65,30) NOT NULL,
    unit_cost numeric(65,30) NOT NULL,
    total_price numeric(65,30) NOT NULL,
    total_cost numeric(65,30) NOT NULL,
    profit numeric(65,30) NOT NULL
);


ALTER TABLE public.sale_items OWNER TO b2game_club_user;

--
-- Name: sales; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.sales (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    session_id uuid,
    customer_id uuid,
    sold_by uuid NOT NULL,
    subtotal numeric(65,30) NOT NULL,
    discount numeric(65,30) DEFAULT 0 NOT NULL,
    total numeric(65,30) NOT NULL,
    total_cost numeric(65,30) NOT NULL,
    profit numeric(65,30) NOT NULL,
    payment_status text DEFAULT 'pending'::text NOT NULL,
    payment_method text DEFAULT 'cash'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    paid_at timestamp(3) without time zone
);


ALTER TABLE public.sales OWNER TO b2game_club_user;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    simulator_id uuid NOT NULL,
    customer_id uuid,
    customer_name text,
    phone text,
    tariff_id uuid,
    status text NOT NULL,
    payment_mode text NOT NULL,
    started_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at timestamp(3) without time zone,
    duration_minutes integer NOT NULL,
    added_minutes integer DEFAULT 0 NOT NULL,
    remaining_seconds integer DEFAULT 0 NOT NULL,
    session_amount numeric(65,30) DEFAULT 0 NOT NULL,
    added_time_amount numeric(65,30) DEFAULT 0 NOT NULL,
    shop_amount numeric(65,30) DEFAULT 0 NOT NULL,
    total_amount numeric(65,30) DEFAULT 0 NOT NULL,
    paid_amount numeric(65,30) DEFAULT 0 NOT NULL,
    debt_amount numeric(65,30) DEFAULT 0 NOT NULL,
    created_by uuid NOT NULL,
    stopped_by uuid,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    billing_mode text DEFAULT 'fixed'::text NOT NULL,
    hourly_rate numeric(14,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.sessions OWNER TO b2game_club_user;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid,
    key text NOT NULL,
    value jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.settings OWNER TO b2game_club_user;

--
-- Name: shift_withdrawals; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.shift_withdrawals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    shift_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    source text NOT NULL,
    amount numeric(65,30) NOT NULL,
    recipient text,
    note text,
    withdrawn_by uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.shift_withdrawals OWNER TO b2game_club_user;

--
-- Name: shifts; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.shifts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    opened_by uuid NOT NULL,
    closed_by uuid,
    status text DEFAULT 'open'::text NOT NULL,
    starting_cash numeric(65,30) DEFAULT 0 NOT NULL,
    expected_cash numeric(65,30) DEFAULT 0 NOT NULL,
    actual_cash numeric(65,30),
    card_total numeric(65,30) DEFAULT 0 NOT NULL,
    qr_total numeric(65,30) DEFAULT 0 NOT NULL,
    product_sales numeric(65,30) DEFAULT 0 NOT NULL,
    session_sales numeric(65,30) DEFAULT 0 NOT NULL,
    refunds numeric(65,30) DEFAULT 0 NOT NULL,
    difference numeric(65,30) DEFAULT 0 NOT NULL,
    notes text,
    opened_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    shift_type text,
    cash_sales numeric(65,30) DEFAULT 0 NOT NULL,
    balance_sales numeric(65,30) DEFAULT 0 NOT NULL,
    total_revenue numeric(65,30) DEFAULT 0 NOT NULL,
    cash_withdrawn numeric(65,30) DEFAULT 0 NOT NULL,
    card_withdrawn numeric(65,30) DEFAULT 0 NOT NULL,
    bank_withdrawn numeric(65,30) DEFAULT 0 NOT NULL,
    remaining_cash numeric(65,30) DEFAULT 0 NOT NULL,
    withdraw_recipient text
);


ALTER TABLE public.shifts OWNER TO b2game_club_user;

--
-- Name: simulator_admins; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.simulator_admins (
    simulator_id uuid NOT NULL,
    admin_id uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.simulator_admins OWNER TO b2game_club_user;

--
-- Name: simulators; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.simulators (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    zone text NOT NULL,
    simulator_type text NOT NULL,
    status text DEFAULT 'ready_to_play'::text NOT NULL,
    device_id text,
    ip_address text,
    ws_rig_id text,
    is_online boolean DEFAULT false NOT NULL,
    current_session_id uuid,
    last_seen_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    map_position jsonb
);


ALTER TABLE public.simulators OWNER TO b2game_club_user;

--
-- Name: tariffs; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.tariffs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid,
    name text NOT NULL,
    simulator_zone text NOT NULL,
    duration_minutes integer NOT NULL,
    price numeric(65,30) NOT NULL,
    weekday_price numeric(14,2),
    weekend_price numeric(14,2),
    weekday_bonus text,
    weekend_bonus text,
    type text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    available_days integer[] NOT NULL,
    available_from time(0) without time zone,
    available_until time(0) without time zone,
    availability_label text
);


ALTER TABLE public.tariffs OWNER TO b2game_club_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: b2game_club_user
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text NOT NULL,
    branch_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users OWNER TO b2game_club_user;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ade84108-ccc4-4d96-8dba-83e7d34eadd9	94424e6816ca54aaa003acc605d011726ef5be20c352d16b81d6b51e48bf7c43	2026-06-08 12:52:05.971318+00	20260608125203_db_push	\N	\N	2026-06-08 12:52:04.472455+00	1
db83c940-bac9-4755-8ebb-e47204aa1aa8	f17f72e7939c67300d1282acf34e52d58a087b00fe442bd547ae5c3474ad8405	2026-06-25 08:39:57.190137+00	20260625010000_maintenance_session_link	\N	\N	2026-06-25 08:39:55.9218+00	1
ff1ffb39-ae76-47d7-b851-96c00f3d0ae7	f1e4f1f56d7547d0d02eeaf25c1274acbe6170193becedd2c8a1f358a72653f7	2026-06-09 15:01:19.515153+00	20260609090000_add_simulator_map_position	\N	\N	2026-06-09 15:01:18.108622+00	1
89b62c98-f0ba-4a7a-b588-e4203e306c83	b806c8b036b104ab675833bb42bb871a65939ef714591e3feb5b7d84a2af5e08	2026-06-10 12:23:51.315864+00	20260610094714_db	\N	\N	2026-06-10 12:23:49.974061+00	1
f4aaffa0-3904-4322-9e62-3bea32ad1956	dc185ab02a37c0a64f47f8d85030e6a2b4d74ace44f08a02a5dea3e0f15df84b	2026-06-11 11:28:18.558058+00	20260611112815_re_add_simulator_map_position	\N	\N	2026-06-11 11:28:17.094395+00	1
5b7f1dba-8945-42f3-9701-9e136fed1a07	431c0046d49e22294ef0838259ee4bbda1ce34fc4532239edafe33f2f0c26e06	2026-06-11 13:27:23.325979+00	20260611120000_session_open_billing		\N	2026-06-11 13:27:23.325979+00	0
d2b033e7-8b62-4265-a412-a8f99188ba2b	c6f45bbcda34919152b33843d47028e8b99e7c0458fa05f141d656678f448625	2026-06-11 14:46:48.020041+00	20260611130000_add_shift_withdrawals_and_shift_totals		\N	2026-06-11 14:46:48.020041+00	0
43590d78-26d5-4ca0-be29-ee891cbfbef3	2e325aede2fcdc2a1645126fab7cef950f873f913f57b1ebd29bad097dcbdc8c	2026-06-11 15:23:28.072446+00	20260611140000_booking_tariff_prepayment		\N	2026-06-11 15:23:28.072446+00	0
2a6e1e42-a84d-4c6e-8f9b-89aec1252f63	ab5c345c4b6eb39aa69953f2f3cae9583b990559bbe3cdf0dc46f8ee8d55c24e	2026-06-25 08:41:01.18192+00	20260625084058_expenses_and_penalty_payments	\N	\N	2026-06-25 08:40:59.91969+00	1
73deca55-7858-4bf7-9f2d-182bb2a13c76	7163490068de0432bec3b0828a8165574880761d69f2036cfd5656cd5ca032ea	2026-06-12 07:07:55.92174+00	20260612000000_shift_one_open_per_branch	\N	\N	2026-06-12 07:07:53.298769+00	1
cb82201a-d493-4511-8373-19d87ef7d888	5a4ce7c93be7e22c60f8c29fc3a9be6e1700edc66527ffd33aa03c5fe82939e4	2026-06-12 07:34:28.437662+00	20260612010000_payment_shift_id	\N	\N	2026-06-12 07:34:25.814393+00	1
b67cc362-5ec5-4831-b864-d6a18109101f	f6f3ce82fc2fbad4921e7ad458845119c4e8d6654e71a9ba154ade204de82ba7	2026-06-12 11:28:36.890384+00	20260612090000_simulator_assigned_admin		\N	2026-06-12 11:28:36.890384+00	0
02d7a454-9586-4703-bebb-6b9e092d7e64	14e552eadafd44250220b5c17ebf0dd850851b6e6906395985d540245ebcd3e7	2026-06-12 12:40:39.048753+00	20260612120000_simulator_admins_m2m		\N	2026-06-12 12:40:39.048753+00	0
c49c3205-2691-4291-897d-f814fb3cc1a4	817f52703195742bb85baee6cbb07306c99e965b500a8822f8beaa05633495c6	2026-06-17 12:05:36.944303+00	20260617090000_cash_withdrawal_requests	\N	\N	2026-06-17 12:05:35.651174+00	1
3e7e0d27-001c-4d6a-ab8a-1190b836168e	e8525ff0e835b3707ddffc77dfc9f62bbd8399d75956d8b96d3ed0a0e4c94542	2026-06-29 08:21:59.053659+00	20260629090000_tariff_availability_windows	\N	\N	2026-06-29 08:21:57.579643+00	1
72f4b544-e576-4469-a777-4a5088197315	7e589b71de1e57655c4f6961dee1747fc12246abc6b1a6670b465fd0020ea2ba	2026-06-18 07:35:02.831777+00	20260618000000_drop_customer_bonus	\N	\N	2026-06-18 07:35:01.278168+00	1
90636901-d2d1-4afc-8690-f2a3037e01d3	d7a1a95d57cc0ee1eace24e56351d970c89163425bea5310524bfbce1312a5a9	2026-06-19 07:19:10.16212+00	20260619000000_maintenance_accountability	\N	\N	2026-06-19 07:19:08.662169+00	1
6056b80e-c0d6-4345-8168-88e16a524f1c	1a51a3b59ffbe7d476b4de89a2f62574de13fbc4da4ea72b7287694957ad825d	2026-06-23 06:04:14.344065+00	20260623060411_db	\N	\N	2026-06-23 06:04:12.89891+00	1
53121dec-9553-435c-b22d-c3526e7a91da	4f89d2792d4e2964954acad3fc2946eb4b11a700fd5d333c149081f3f83ecbf6	2026-07-07 15:06:16.939708+00	20260707000000_admin_deductions	\N	\N	2026-07-07 15:06:15.398062+00	1
bfe210bd-81fb-49a9-8fb5-510e259d637a	2b38182f98bf4628519707ab15fe98057eec55324820779b08d4c8e484ba1dbc	2026-06-25 08:28:12.586784+00	20260625000000_expenses_and_penalty_payments	\N	\N	2026-06-25 08:28:11.051117+00	1
6fc637c1-4b8a-4c2f-a401-6f0e51541d09	9e11441d766544c83c9d2aaa3abfdceebdcb124192fb5a53b6a949f0c8af00ae	2026-07-07 15:18:29.527246+00	20260707010000_cash_withdrawal_purpose	\N	\N	2026-07-07 15:18:27.811648+00	1
88e1ebf6-33d0-43bc-8ec5-edbd4aa3a28f	51d67989794fed3d031f2dc5f8556b38ecf5c209be2e9c91e939b6f9bf599108	2026-07-08 07:13:45.015678+00	20260708000000_tariff_time_precision	\N	\N	2026-07-08 07:13:43.0045+00	1
af024617-5f72-4938-a3c9-3215124de905	c87bbd2621e87dc091499bc49c687e789b53ad99797173b98cc35639578510ed	2026-07-08 07:14:26.934211+00	20260708071423	\N	\N	2026-07-08 07:14:25.135571+00	1
\.


--
-- Data for Name: admin_deductions; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.admin_deductions (id, branch_id, shift_id, admin_id, expense_id, type, amount, status, note, created_by, created_at) FROM stdin;
eb07a826-dc68-4a3a-a49b-f5c14bb158fe	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	17d4da99-d22d-4f8c-bd87-88841a733ede	67005460-527d-4723-915f-8ff20067e42d	\N	salary_advance	5000.00	open	taxi	dac28a45-122f-47f0-85d2-9bd2ae523eff	2026-07-07 15:42:22.38
\.


--
-- Data for Name: admin_penalty_payments; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.admin_penalty_payments (id, branch_id, shift_id, admin_id, amount, method, cash_amount, card_amount, qr_amount, received_amount, change_amount, recorded_by, note, created_at) FROM stdin;
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.bookings (id, branch_id, simulator_id, booking_type, customer_id, customer_name, phone, repair_request_id, start_time, end_time, status, note, created_by, created_at, updated_at, tariff_name, prepayment) FROM stdin;
bbf3f811-9fd9-4dbc-8064-a902125944e4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	93850eed-1a97-41de-9e9a-2506edd110ac	customer_booking	46952282-8dd4-4e18-8254-4634637ebd1f	007	998252525225	\N	2026-07-05 15:30:00	2026-07-05 16:30:00	no_show		67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:27:37.546	2026-07-05 15:52:24.617		0.00
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.branches (id, name, code, address, phone, status, created_at, updated_at) FROM stdin;
21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	B2 Main Arena	MAIN	Main Arena	+998900000000	active	2026-06-08 13:00:41.554	2026-06-11 14:38:54.439
\.


--
-- Data for Name: cash_withdrawal_requests; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.cash_withdrawal_requests (id, branch_id, shift_id, admin_id, amount, initiated_by, initiator_role, status, note, confirmed_by, created_at, resolved_at, purpose, deduction_type, expense_id) FROM stdin;
c8e84125-85c7-4ecf-876c-453889ba231e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	17d4da99-d22d-4f8c-bd87-88841a733ede	67005460-527d-4723-915f-8ff20067e42d	10000.00	dac28a45-122f-47f0-85d2-9bd2ae523eff	admin	rejected	\N	dac28a45-122f-47f0-85d2-9bd2ae523eff	2026-07-07 15:08:43.796	2026-07-07 15:11:08.714	owner_withdrawal	\N	\N
b417353d-1dd7-4966-bf1e-34af2c84f77c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	17d4da99-d22d-4f8c-bd87-88841a733ede	67005460-527d-4723-915f-8ff20067e42d	10000.00	dac28a45-122f-47f0-85d2-9bd2ae523eff	admin	rejected	\N	dac28a45-122f-47f0-85d2-9bd2ae523eff	2026-07-07 15:08:28.332	2026-07-07 15:11:15.097	owner_withdrawal	\N	\N
6f523c8d-31ba-4b73-9be0-9e550d845cc3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	17d4da99-d22d-4f8c-bd87-88841a733ede	67005460-527d-4723-915f-8ff20067e42d	5000.00	dac28a45-122f-47f0-85d2-9bd2ae523eff	admin	rejected	taksi uchun	22778489-a0f5-4640-87c1-b24ff009cb87	2026-07-07 15:11:32.717	2026-07-07 15:25:44.786	owner_withdrawal	\N	\N
a0a40756-33fd-48f2-ad64-570a03f04935	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	17d4da99-d22d-4f8c-bd87-88841a733ede	67005460-527d-4723-915f-8ff20067e42d	5000.00	dac28a45-122f-47f0-85d2-9bd2ae523eff	admin	confirmed	taxi	22778489-a0f5-4640-87c1-b24ff009cb87	2026-07-07 15:41:28.353	2026-07-07 15:42:21.694	admin_debt	salary_advance	\N
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.customers (id, branch_id, name, phone, balance, total_spent, sessions_count, last_visit_at, status, created_at, updated_at) FROM stdin;
b172db10-871c-4988-93d1-9c69c2906154	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Aziz	998901112233	0.000000000000000000000000000000	0.000000000000000000000000000000	0	2026-06-08 13:00:41.554	active	2026-06-08 13:00:41.554	2026-06-12 07:55:43.177
ccdf825e-dcde-4fca-aac0-f4c571cc7b27	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	doniyor	998888888888	0.000000000000000000000000000000	0.000000000000000000000000000000	0	\N	active	2026-06-17 16:58:20.927	2026-06-17 16:58:20.927
58dceacf-f773-4e62-bd9e-7748904919fa	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	nd	998886750811	0.000000000000000000000000000000	0.000000000000000000000000000000	0	\N	active	2026-06-17 16:56:27.755	2026-06-17 17:07:28.541
89eee425-4536-4af8-830b-3372bd950d90	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Bekzod	998998715503	0.000000000000000000000000000000	0.000000000000000000000000000000	0	\N	active	2026-06-17 17:19:30.177	2026-06-17 17:19:30.177
20222f92-3770-4b88-895a-f0ab6d2a03ed	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	1234	998098765432	0.000000000000000000000000000000	0.000000000000000000000000000000	2	2026-06-18 08:21:05.693	active	2026-06-18 07:24:29.31	2026-06-18 08:21:05.693
ced4930c-9a08-4434-a233-43d08364a850	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Asilbek	998882387992	0.000000000000000000000000000000	0.000000000000000000000000000000	1	2026-06-25 08:41:43.27	active	2026-06-17 07:59:15.009	2026-06-25 08:41:43.27
46952282-8dd4-4e18-8254-4634637ebd1f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	007	998252525225	0.000000000000000000000000000000	0.000000000000000000000000000000	0	\N	active	2026-06-25 14:11:00.059	2026-06-25 14:11:00.059
cc9fc856-5a2e-4620-9197-eb9365ed9b60	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Aziz	998901112233	0.000000000000000000000000000000	0.000000000000000000000000000000	1	2026-06-29 08:22:24.511	active	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.expenses (id, branch_id, shift_id, amount, method, source, note, spent_by, created_at) FROM stdin;
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.inventory (id, branch_id, product_id, stock_quantity, low_stock_threshold, created_at, updated_at) FROM stdin;
551b0fb6-347e-4023-a241-ab29603e53b8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7063cda0-36d5-49bc-8f5f-6c4c0c0594c4	48	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
db141904-4fdb-405a-b9a8-da76f029b574	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	1d3178da-38ca-4660-9f27-ec30dcd75239	80	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
658fdd05-f54e-45cd-9100-31f12a0a4c93	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	07fef28a-f6f4-42ba-a26c-f23f6176a9d3	44	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
f9533e0f-f2dc-46a0-9d24-ff56fe08023a	eb31d71a-6ede-496d-9851-542b42b8e2f9	7063cda0-36d5-49bc-8f5f-6c4c0c0594c4	48	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
450499cb-aad8-4e3f-9bc4-815c7f55066f	eb31d71a-6ede-496d-9851-542b42b8e2f9	1d3178da-38ca-4660-9f27-ec30dcd75239	80	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
614fcc3e-1499-4166-9b4e-6a26a48c1ac1	eb31d71a-6ede-496d-9851-542b42b8e2f9	f171db85-4db0-4b65-950e-53dc3852890c	12	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
0ac31602-4aec-4b50-8c5d-b2c633df9a11	eb31d71a-6ede-496d-9851-542b42b8e2f9	393cd93f-4b0c-49a9-a040-2c9f5024179f	25	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
5b0609e7-d5d7-4c5f-aa48-0543f95aa647	eb31d71a-6ede-496d-9851-542b42b8e2f9	89f8f31b-c725-4d9b-9e7c-eb546be23570	35	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
40782f75-f963-45f3-a2f0-1c6507365cc7	eb31d71a-6ede-496d-9851-542b42b8e2f9	07fef28a-f6f4-42ba-a26c-f23f6176a9d3	44	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
2ef70cdd-f4f8-4631-825b-1a97ffddcd18	09b2a6f7-90c0-4d54-a054-a5282277dda2	7063cda0-36d5-49bc-8f5f-6c4c0c0594c4	48	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
fbfc35ce-9a16-4ed4-8732-e7df312e641c	09b2a6f7-90c0-4d54-a054-a5282277dda2	1d3178da-38ca-4660-9f27-ec30dcd75239	80	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
19f0fd97-ea7e-44f2-94f2-a2b92f12c06c	09b2a6f7-90c0-4d54-a054-a5282277dda2	f171db85-4db0-4b65-950e-53dc3852890c	12	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
46583a6e-324b-4cc0-aba2-7f72039777e4	09b2a6f7-90c0-4d54-a054-a5282277dda2	393cd93f-4b0c-49a9-a040-2c9f5024179f	25	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
3f500201-5b74-4c7f-8b08-82a67b69a1a6	09b2a6f7-90c0-4d54-a054-a5282277dda2	89f8f31b-c725-4d9b-9e7c-eb546be23570	35	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
10f8580d-a784-4db8-bf90-7501bbbb9246	09b2a6f7-90c0-4d54-a054-a5282277dda2	07fef28a-f6f4-42ba-a26c-f23f6176a9d3	44	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
7df8ba9c-c98e-4097-9543-20c43e26ac0d	b051a52a-b76e-40fc-8929-6d31f05c006e	7063cda0-36d5-49bc-8f5f-6c4c0c0594c4	48	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
48547825-672a-4019-a63e-d9bd595201f4	b051a52a-b76e-40fc-8929-6d31f05c006e	1d3178da-38ca-4660-9f27-ec30dcd75239	80	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
aa5e96fc-7ab2-496e-ae77-e9ac0a29dd7a	b051a52a-b76e-40fc-8929-6d31f05c006e	f171db85-4db0-4b65-950e-53dc3852890c	12	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
531538cc-db4e-4f65-a6c9-ca9510a240c7	b051a52a-b76e-40fc-8929-6d31f05c006e	393cd93f-4b0c-49a9-a040-2c9f5024179f	25	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
15e60a7f-a519-4edd-b04b-fb103116cc7e	b051a52a-b76e-40fc-8929-6d31f05c006e	89f8f31b-c725-4d9b-9e7c-eb546be23570	35	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
8d6fc2ea-1d19-430c-b408-cfcfd9a9e51a	b051a52a-b76e-40fc-8929-6d31f05c006e	07fef28a-f6f4-42ba-a26c-f23f6176a9d3	44	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
09042fd3-b070-407b-9bd1-0949c334aa73	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	7063cda0-36d5-49bc-8f5f-6c4c0c0594c4	48	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
4f52b4d1-3e1f-441e-97b4-4ec9f9dea702	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	1d3178da-38ca-4660-9f27-ec30dcd75239	80	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
faa20097-6222-49e1-bfd9-45fb9cd7e6a7	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	f171db85-4db0-4b65-950e-53dc3852890c	12	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
df22c740-e780-4108-bed3-097085e8918e	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	393cd93f-4b0c-49a9-a040-2c9f5024179f	25	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
0d010f10-a5a8-48d7-b1a3-37c706f99023	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	89f8f31b-c725-4d9b-9e7c-eb546be23570	35	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
d9cf2cb9-0696-4011-8b86-8a97aa230922	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	07fef28a-f6f4-42ba-a26c-f23f6176a9d3	44	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
67a1c7a1-08df-4dec-86f0-ea6a927b6b84	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	37e42e81-2b80-43b4-8ad4-9de1327c91e3	22	5	2026-06-09 15:12:33.42	2026-06-09 15:12:33.42
7e76db11-b8cf-4867-947c-0618a5ff4af1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	5384e0c0-1630-48cb-99c4-da396559f5dc	6	5	2026-06-09 14:49:46.861	2026-06-09 14:49:46.861
557df262-d94b-4f61-8efd-c95a9bd22d8d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	393cd93f-4b0c-49a9-a040-2c9f5024179f	22	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
d9c8efc7-4d7f-42bf-9ef7-70616f19540b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	89f8f31b-c725-4d9b-9e7c-eb546be23570	34	5	2026-06-08 13:00:41.554	2026-06-11 11:39:20.811
5a06d402-c13b-485d-b2eb-96dd4929fca3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f171db85-4db0-4b65-950e-53dc3852890c	11	5	2026-06-08 13:00:41.554	2026-06-11 11:39:21.922
13d191c4-c7d9-49ff-9145-737f16a4d49b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	8c4dfff7-f020-47b8-b228-0c1432e6a96f	18	5	2026-06-11 15:15:19.923	2026-06-11 15:15:19.923
dcfe2b01-fb95-4521-b789-222057acf84c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	9e5cd792-2919-407f-963d-1e088654f9e6	5	5	2026-06-11 15:20:44.351	2026-06-11 15:20:44.351
146f84f2-5260-49cf-b468-c883a4a36dab	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7e30b780-f60c-424a-a184-4fef11a44306	13	5	2026-06-11 15:22:40.922	2026-06-11 15:22:40.922
e8c930a1-b823-4cfe-b4da-582ee73a6027	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	b41da9a9-0616-40f1-8cb3-e839597219c3	0	5	2026-06-12 15:19:47.62	2026-06-12 15:19:47.62
fbc097d3-dd90-4988-b1e1-3899d0e275b1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f3759cbd-9e91-441f-ae59-9845e2e864d4	1	5	2026-06-12 15:26:11.515	2026-06-12 15:26:11.515
af004244-77d0-400a-acb5-e953a394ebdc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a2103180-05cc-42f0-9b18-d4f459709873	10	5	2026-06-12 15:19:08.955	2026-06-12 15:19:08.955
303053f2-bc30-47b1-8462-515786f65b9a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	5b988a52-4c33-487c-afb5-6cbea9b943e8	1	5	2026-06-12 15:17:02.777	2026-06-12 15:17:02.98
d487c106-4b5e-4e84-9f9b-569f94896892	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	58ca5e9c-0755-4373-83be-6ec4dbd85ffe	12	5	2026-06-12 15:22:39.036	2026-06-12 15:22:39.036
9bacc2a0-4749-4cbf-9a5c-720ea3c4cc08	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	e59f9b81-a33d-4887-b2ac-254daf515c1b	10	5	2026-07-01 22:21:32.881	2026-07-01 22:21:32.881
6ad54080-650c-4612-8428-17d070f58cc3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	8f5711c5-1246-409e-ada9-73c3c7a9256b	11	5	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511
db3a1ced-e9e7-4d6c-9594-4eb67646f760	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f9010df5-ed1a-4f02-868d-eb730eb868b8	3	5	2026-06-12 15:29:35.627	2026-06-12 15:29:35.627
95899c6e-5a44-4fe4-9505-8b9acbb76eb2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	2d7ca282-2a5a-4033-ad5d-f8b52652e595	16	5	2026-06-12 15:27:26.645	2026-06-12 15:27:26.645
e0d79f70-c7cb-4ae2-9e3b-09a3f991ff8f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a61aac7a-fd11-4e7f-a448-6cdbd282f1d8	2	5	2026-06-12 15:17:44.413	2026-06-12 15:17:44.413
e6bbc208-0c3b-4988-aef4-d2c5334c0dad	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	0298f745-84fd-44b7-b8f5-301f70a5d8a8	2	5	2026-06-12 15:28:11.613	2026-06-12 15:28:11.613
6dab4514-e438-4af1-81ca-f7419daf63f5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	e0fbe6c5-a1d3-421f-8d11-6b1fa67199c8	20	5	2026-06-12 15:38:51.167	2026-06-12 15:38:51.167
1374ed76-97b3-4946-9d8c-cdf823b5b7dc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	1b76fc7b-1e64-48bb-9a0e-b446a4a43e95	11	5	2026-06-12 15:34:25.901	2026-06-12 15:34:25.901
f55548ba-fd3d-4c92-9487-5ef8f2b3292f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a8d7a5f3-b978-4d4e-93e0-897fb590eaac	2	5	2026-06-12 15:34:50.805	2026-06-12 15:34:50.805
201a1105-8861-4f5c-8154-82fb789d9abd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	5cd0fdb9-451d-4c5a-b32d-80585cf46eb9	10	5	2026-06-12 15:25:44.495	2026-06-12 15:25:44.495
171bae16-10b0-47c1-96ca-083eb65895c8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f888b38b-0201-484c-8aef-d3bcb8854950	13	5	2026-06-12 15:41:28.573	2026-06-12 15:41:28.573
cce94104-537c-4f42-9074-0261cfda4716	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	66c6f72a-2ef1-4ab9-b818-c7edd78457ad	17	5	2026-06-12 15:16:22.812	2026-06-12 15:16:22.812
dfc84ba0-14ee-4b1a-b1a8-8bf4df2bb05a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	978ee6cc-d260-4018-8723-8adff4d4aaf8	10	5	2026-06-12 15:15:39.296	2026-06-12 15:15:39.296
3347c334-68e7-4094-a5bf-791251fe73ca	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7dcb603c-2183-4ecc-a20b-6f22115197b2	19	5	2026-06-12 15:40:00.724	2026-06-12 15:40:00.724
41dac303-275f-45e1-96f9-614bbb5648b4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	9b8b5049-1d95-491c-baf4-0b4adceb8f52	29	5	2026-06-12 15:40:20.327	2026-06-12 15:40:20.327
851635d0-1c10-4a79-a443-82ea8f7a71c5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	70e7f8e9-aa5e-4611-be5a-0a2d1030e68b	23	5	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511
11ae0bc7-a87c-4c36-93f4-e16566b0b121	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	5a570593-cfbb-4e09-9ad9-ff5cd4472900	10000	5	2026-07-01 22:32:59.976	2026-07-01 22:32:59.976
34505e30-2706-4782-91a5-e9fb5fc9e7a6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a1d6a446-3e0c-4a20-951e-50c7b1b34fa4	14	5	2026-06-12 15:14:20.595	2026-06-12 15:14:20.595
d7e29204-ab72-43ea-afc2-868bceb65cbe	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	01a5dabe-de4e-47e1-bbc9-0d60af135a4b	3	5	2026-06-12 15:37:53.468	2026-06-12 15:37:53.468
84e45ffb-80d7-4179-83df-b923e418d801	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	66a5b903-2d53-4886-ade1-6238c28969e6	12	5	2026-06-12 15:21:06.039	2026-06-12 15:21:06.039
56adf74c-2335-45ce-bd45-8998b6047bdb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	0cc1edd1-c65d-4332-9484-9555b5ea4b0e	22	5	2026-06-12 15:35:43.495	2026-06-12 15:35:43.495
2d69091a-3f30-419f-89c9-23ad0651fd41	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a447b302-fcc0-4a85-833f-f86236329fe4	6	5	2026-06-12 15:14:58.154	2026-06-12 15:14:58.154
95a5bc7a-1d16-4b20-a054-bfa1f94a152a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a438fe77-74a0-4a86-87c5-6de222ea6373	8	5	2026-06-12 15:36:46.449	2026-06-12 15:36:46.449
2a362604-34e7-4076-8ba5-9c34e9f2b23e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	5e0c3039-285f-41ad-baa0-1a59a60e9c34	80	5	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511
76a06194-29bc-4d0a-95b2-c619d65792d9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	d3bd89f7-6c3a-495d-b236-ed0dc5bb65d4	25	5	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511
64abaadf-5cdd-488e-9a93-89f2563a0505	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	d6397ff6-c9fd-4d19-a463-fe2b2d40f469	35	5	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511
bcf4be59-0762-44e8-9544-0b6c5897add9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	60cb0922-1d71-4d03-ae81-1ebf4f506396	24	5	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511
67def552-1383-4378-bb8f-17666e1ff39f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	cc59e684-4a6b-42cf-9a27-2d1f84755135	14	5	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511
6cc4d284-8484-4fcb-98f2-c84b5c6d5885	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	bb889a9a-f2a0-4c2f-84c8-d03a026f5f2c	10000	5	2026-07-01 22:39:49.326	2026-07-01 22:39:49.326
56f7545e-c38f-4bae-a5b2-68b9a0cc35b2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	3e2c3880-6c39-4c2a-a3a1-010a186006ff	10	5	2026-07-01 22:24:35.898	2026-07-01 22:24:35.898
8f4c4160-ef66-4034-bda3-9d4f8b30bfa1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	d67b1954-9761-4dd4-a1ad-34bf55a8d770	10000	5	2026-07-01 22:38:22.075	2026-07-01 22:38:22.075
56587cf0-a18b-4a6f-946c-d6e4d48bad39	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f540f44e-9244-4f00-8184-afcdd580cc5f	4	5	2026-06-12 15:21:44.407	2026-06-12 15:21:44.407
a894d83e-3db2-4493-aa20-5701fb5c0353	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	acfb40b5-6e27-4a1b-ba4c-aa032c69c4c7	20	5	2026-07-01 22:44:21.462	2026-07-01 22:44:22.437
a60cb8df-834f-4f81-adb3-c4295447ad00	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7d8f12ab-9034-45c3-8735-b0ee46ce172c	10	5	2026-07-01 22:46:03.113	2026-07-01 22:46:03.113
a83a3e06-4497-4351-ba2a-68bf0f7ddea5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	24219e09-0e40-42ad-bada-6faf4a48aca5	10	5	2026-07-01 22:46:49.125	2026-07-01 22:46:49.125
957c80af-42aa-4099-97ff-9345c5c75ffc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	bb986954-5cca-41bc-82aa-8821c8faa139	10000	5	2026-07-01 22:47:40.561	2026-07-01 22:47:41.278
ea9ccd22-bb2a-4c18-8fae-ca1b595f0ca4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	eb6792f0-ef4b-4774-9002-cb219c7ac8d9	10000	5	2026-07-01 22:52:55.637	2026-07-01 22:52:55.637
d371c911-8697-4b9e-b373-bae4753b862f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	41a3b5bf-e4cb-42d4-b061-0558d3ddc93d	10	5	2026-07-01 22:54:06.801	2026-07-01 22:54:06.801
52b2295f-6ed6-4596-9f8c-49b96a78974c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	ba62679b-176a-473c-81b0-1f156361df92	9	5	2026-06-12 15:37:13.116	2026-06-12 15:37:13.116
7dfcee2d-86e4-4c3c-ab23-1b34af77fdb2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	38cf6445-2d6f-4ec1-9d1e-d30976aa503b	10	5	2026-07-01 22:57:55.368	2026-07-01 22:57:56.206
a646e29b-4467-4459-a0ce-a80980ba4646	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	ce629280-202d-4251-81a4-c6771a15fa00	10	5	2026-07-01 23:05:58.45	2026-07-01 23:05:59.099
916f6b69-1cc2-40d0-82d9-7d5288f95ac0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	9062379f-fbce-4452-aec1-42465710a42c	5	5	2026-07-01 23:15:22.618	2026-07-01 23:15:22.618
c17b9a53-265e-4584-8669-d3a38a716e92	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	e97d5c26-14af-48cc-ac27-ded8cd286c32	10	5	2026-07-01 23:26:16.354	2026-07-01 23:26:16.354
ee906b08-a3da-4981-90c1-bc862ee846cd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	3e44b847-85aa-4ad0-83f0-c696cb14f0c8	10	5	2026-07-01 23:27:00.192	2026-07-01 23:27:00.192
b9251538-1510-4009-99b5-c73229ead5d6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	60fbc4cd-9378-4bb5-8ea2-ee7f4a62ddec	10	5	2026-07-01 23:28:30.407	2026-07-01 23:28:30.407
9e0bd0da-cd51-4df9-b40d-7f7eb292a41e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	d37b6dc1-06ed-4d7c-b0a8-1ac2b3c755f3	10	5	2026-07-01 23:29:19.455	2026-07-01 23:29:19.455
9b1dddfd-425e-448b-a9bc-66b1d90fd1c6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	53f9c27b-c18d-4e5c-9e9c-4e17e7544704	10	5	2026-07-01 23:30:27.404	2026-07-01 23:30:27.404
f9e2f086-9def-4278-987c-869f6f7b3407	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	97ae7f2f-c33b-4027-9fc7-d29dbbee6c60	10	5	2026-07-01 23:31:11.774	2026-07-01 23:31:11.774
6bf8eb33-8284-49d7-9542-dd046acabfa4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	c242a797-938f-4f49-9b4f-e2b8952a04a3	10	5	2026-07-01 23:32:30.284	2026-07-01 23:32:30.284
b92f5a57-5392-46e7-9520-938a7c6b9538	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	578cd664-747b-4ea0-aa1e-fde12edec97b	10	5	2026-07-01 23:33:29.433	2026-07-01 23:33:29.433
b0dc8b57-dd52-40ea-b066-163d34605b04	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	775d3fb8-0729-4175-8aab-091f396192c1	15	5	2026-07-01 23:34:23.035	2026-07-01 23:34:23.035
435f9cf5-9511-4734-8478-f917aede11f0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	47b6ac8c-8343-4a42-9d96-cb8d2dc85e32	15	5	2026-07-01 23:34:58.478	2026-07-01 23:34:58.478
91f87fe3-27f5-4dc5-a1f8-46837cd91cd5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dd4c1fc7-15cd-4f0c-96af-c81faf8668e1	10	5	2026-07-01 23:37:26.113	2026-07-01 23:37:26.113
5718bea1-c555-4954-8206-c422cd729ddd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	72daa972-3cc5-42ba-b7e0-2c06682f5137	10	5	2026-07-01 23:38:19.211	2026-07-01 23:38:19.211
9eb37f6b-0a3b-4e97-9ed0-84a3ab4ba0ae	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	16070d60-617d-4fc2-9bbd-7177460cf31b	10	5	2026-07-01 23:39:45.686	2026-07-01 23:39:45.686
500552ff-dea6-4096-bc56-dee12a06852d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	58dd5df1-c231-479a-afa9-014019c543ea	10	5	2026-07-01 23:40:46.445	2026-07-01 23:40:46.445
50560211-ba57-4882-9c12-5aa53af25998	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	339d63d6-9619-46b0-a3e1-98b7d9ce5fbb	10	5	2026-07-01 23:42:12.987	2026-07-01 23:42:12.987
0154543b-4f6c-4466-8219-acb5482c7a60	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	8f2c46bd-aeaa-4e5e-8d16-8b8356a56116	10	5	2026-07-01 23:43:08.77	2026-07-01 23:43:08.77
29bc7d5b-801f-43a3-9c07-08f544e7ef91	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a8e0178e-a428-4b02-939c-784ef65743db	10	5	2026-07-01 23:44:48.866	2026-07-01 23:44:48.866
a4bf9b72-3cce-4ccc-a968-79adff2ecd50	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	30c68431-762c-4116-a9c2-8870ab5d3eed	10	5	2026-07-01 23:46:37.241	2026-07-01 23:46:37.241
aadd08e1-1d0a-4941-90f8-922f26077943	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	32576e86-47cb-4355-b6e9-6c6bb1e683f7	10	5	2026-07-01 23:47:59.438	2026-07-01 23:47:59.438
24d338d2-9393-4b18-8b82-0bfd60441930	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	1c521c54-f6c8-4967-8d4b-b4e2b7bcdd73	10	5	2026-07-01 23:50:34.307	2026-07-01 23:50:34.307
5d53a966-06e7-4eab-b72f-0de5f14cff83	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7a691efc-030a-49c6-9620-4fea2843cd22	10	5	2026-07-01 23:49:21.36	2026-07-01 23:49:21.36
50b5ccb5-bb98-4440-a2ed-ce8230b116b0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	30e4ca1e-89e8-414f-a5e4-6f41802d4855	10	5	2026-07-01 23:52:08.585	2026-07-01 23:52:08.585
24e7b2ed-e708-4132-9645-d7814852b551	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	4cb599c8-2d66-4406-a864-6073de3c2002	10	5	2026-07-01 23:53:14.827	2026-07-01 23:53:14.827
233c54f3-d68a-4d5f-829d-5d32ae8471fe	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	0aede6ba-4094-4e51-b8db-789b35b8b8ee	10	5	2026-07-01 23:54:26.016	2026-07-01 23:54:26.016
ef807d7d-18a0-4570-af83-aec08e097fa2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	673d5c1c-9f54-40c5-b8b2-a7d55713a15e	10	5	2026-07-01 23:55:11.805	2026-07-01 23:55:11.805
80fd909c-addb-4d31-9ddb-4b94b92bf5c4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	71fb7685-1cd4-4c96-bed3-b30cac8e52b7	10	5	2026-07-01 23:56:00.141	2026-07-01 23:56:00.141
39d6a2db-8d40-4002-932a-901e272f5b51	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f9e6adf0-8e50-4668-938d-19e7ef32b766	10	5	2026-07-02 00:02:05.439	2026-07-02 00:02:05.439
3627070b-7aba-463a-b7cb-6a3522f11e00	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	665ed85f-481f-4375-b438-586951259c8d	10	5	2026-07-02 00:02:46.564	2026-07-02 00:02:46.564
de4563fa-bfe9-45ef-9a75-5867b17c6b57	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	c7a8dd61-af92-46e6-989c-10204958f5cb	10	5	2026-07-01 23:31:49.08	2026-07-01 23:31:49.08
a5df8d43-1689-4bcd-8cd6-c3b816671813	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	39ba6975-8c2e-46bb-8eab-3d96f7bc1afd	18	5	2026-07-01 23:05:21.405	2026-07-01 23:05:22.005
f9164bf0-2349-469d-b9a2-53ba6ea44c86	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	717e503a-2141-4d77-9243-453133378a61	9	5	2026-07-01 23:13:32.73	2026-07-01 23:13:32.73
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.inventory_movements (id, branch_id, product_id, type, quantity, before_quantity, after_quantity, reason, created_by, created_at) FROM stdin;
62391dce-bf56-4f3e-9805-df409455192b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	9e5cd792-2919-407f-963d-1e088654f9e6	sale	2	2	0	sale paid	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-12 07:42:29.95
96986c48-5de7-4a2b-9480-cbdb38cf4a3d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	9e5cd792-2919-407f-963d-1e088654f9e6	adjustment	5	0	5	dashboard product update	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-12 07:43:30.727
dde5af22-08b9-4670-985e-249a8b99587f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7e30b780-f60c-424a-a184-4fef11a44306	sale	2	15	13	sale paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 07:55:45.317
ae25a7f8-cbc8-485e-affd-8e01a2bf7e00	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	2d7ca282-2a5a-4033-ad5d-f8b52652e595	adjustment	16	13	16	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:28:56.845
6ba41c29-7f1c-4af4-91a7-394f80f4518a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a2103180-05cc-42f0-9b18-d4f459709873	adjustment	10	10	10	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:31:17.951
7c6387b8-d237-43fe-a6f2-9d7c944b438d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	5b988a52-4c33-487c-afb5-6cbea9b943e8	adjustment	1	1	1	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:31:30.048
ee7f2646-6c09-4055-988f-47700c77dda4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	0cc1edd1-c65d-4332-9484-9555b5ea4b0e	adjustment	23	11	23	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:36:08.295
10c86c0a-450e-428e-bc79-0eaa8a9b719e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	ba62679b-176a-473c-81b0-1f156361df92	adjustment	10	10	10	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:42:01.991
8ad1f44f-fda0-4261-a881-e7ab01ead670	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	0cc1edd1-c65d-4332-9484-9555b5ea4b0e	adjustment	23	23	23	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:42:09.412
3f01ba50-9033-433f-ba3d-cfce143f0c0e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	0cc1edd1-c65d-4332-9484-9555b5ea4b0e	adjustment	23	23	23	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:42:16.431
ec3764dd-ee48-445b-b426-38cddb947472	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f9010df5-ed1a-4f02-868d-eb730eb868b8	adjustment	3	3	3	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:42:21.949
3668ee44-1ff8-4b0c-8d3e-8e5e1a15a3de	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a438fe77-74a0-4a86-87c5-6de222ea6373	adjustment	10	10	10	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:42:33.794
847cfc5b-5ac5-4cb5-8f15-b76dc59ae9ac	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	2d7ca282-2a5a-4033-ad5d-f8b52652e595	adjustment	16	16	16	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:42:42.016
28ef392c-66f5-40e6-ae92-7273a7e435b3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	0298f745-84fd-44b7-b8f5-301f70a5d8a8	adjustment	2	2	2	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:42:49.709
76f9f936-3dca-4313-b789-db09ef8dfc5a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	0298f745-84fd-44b7-b8f5-301f70a5d8a8	adjustment	2	2	2	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:42:55.638
8d9fd2ef-3e9c-40f8-97fe-0b6cd8e68d9d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	e0fbe6c5-a1d3-421f-8d11-6b1fa67199c8	adjustment	20	20	20	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:43:02.645
8c04a66b-01c5-48fc-a170-8322bdb5417b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	1b76fc7b-1e64-48bb-9a0e-b446a4a43e95	adjustment	11	11	11	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:43:09.119
e115aa3c-2b58-4948-9200-7808a71f803f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a8d7a5f3-b978-4d4e-93e0-897fb590eaac	adjustment	2	2	2	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:43:15.973
79175de5-223b-4eef-8ff0-56092ecdd766	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	5cd0fdb9-451d-4c5a-b32d-80585cf46eb9	adjustment	10	10	10	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:43:26.592
0a39cb6f-8f46-4b05-b830-c818e4cd9205	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f3759cbd-9e91-441f-ae59-9845e2e864d4	adjustment	1	1	1	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:43:35.795
da3ec1dc-9bae-4d7c-8c99-15bf1dbcb11f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	58ca5e9c-0755-4373-83be-6ec4dbd85ffe	adjustment	12	12	12	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:43:44.349
744f74f3-856f-4042-9f39-5061d26d19a6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a447b302-fcc0-4a85-833f-f86236329fe4	adjustment	7	7	7	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:43:54.443
9949b31b-4793-43a5-bf24-f29c082c468e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a61aac7a-fd11-4e7f-a448-6cdbd282f1d8	adjustment	2	2	2	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:44:03.635
98111873-d22e-4bd3-b1ed-787b67059831	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f888b38b-0201-484c-8aef-d3bcb8854950	adjustment	13	13	13	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:44:16.006
45218ee9-93cc-420f-af72-756069534582	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	66c6f72a-2ef1-4ab9-b818-c7edd78457ad	adjustment	17	17	17	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:44:24.202
0598d5db-a702-4790-991b-9ebd91f7577e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	978ee6cc-d260-4018-8723-8adff4d4aaf8	adjustment	10	10	10	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:44:36.185
9192a87b-45c0-4a18-8b65-80e1e945f7e1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7dcb603c-2183-4ecc-a20b-6f22115197b2	adjustment	19	19	19	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:44:44.83
28c34e4a-30b8-4c43-9bf4-ebabdbd991f0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	9b8b5049-1d95-491c-baf4-0b4adceb8f52	adjustment	29	29	29	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:44:55.804
a457db02-091c-4810-bc2d-14cde8154da7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f540f44e-9244-4f00-8184-afcdd580cc5f	adjustment	5	5	5	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:45:00.94
247f3085-cc31-4163-a98c-d86e26da75db	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	01a5dabe-de4e-47e1-bbc9-0d60af135a4b	adjustment	3	3	3	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:45:07.68
9110f7da-7505-49c8-b3e2-2a9d972a9462	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a1d6a446-3e0c-4a20-951e-50c7b1b34fa4	adjustment	14	14	14	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:45:15.223
f2abcb47-c3e6-48f4-8e05-a26ccfe582a5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	01a5dabe-de4e-47e1-bbc9-0d60af135a4b	adjustment	3	3	3	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:45:19.402
4f4c1720-7827-4ee1-ba8e-4b46091cc2a8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	66a5b903-2d53-4886-ade1-6238c28969e6	adjustment	12	12	12	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 15:45:27.297
738ad35d-6035-4811-ace0-8312aae24994	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a447b302-fcc0-4a85-833f-f86236329fe4	adjustment	7	7	7	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-06-17 17:02:07.736
42ff39a1-9629-49ec-b31b-3428f9d2eaaf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	0cc1edd1-c65d-4332-9484-9555b5ea4b0e	sale	1	23	22	sale paid	22778489-a0f5-4640-87c1-b24ff009cb87	2026-06-17 17:06:09.693
6a3acb95-837c-4e4d-bcd7-645e58fa8a77	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a438fe77-74a0-4a86-87c5-6de222ea6373	sale	1	10	9	sale paid	22778489-a0f5-4640-87c1-b24ff009cb87	2026-06-17 17:06:09.783
ead491e4-e7e2-4849-aff0-74c30be71f74	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a447b302-fcc0-4a85-833f-f86236329fe4	sale	1	7	6	sale paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-17 17:07:28.745
169cd937-f464-4c75-916e-d335707e3a70	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a438fe77-74a0-4a86-87c5-6de222ea6373	sale	1	9	8	sale paid	22778489-a0f5-4640-87c1-b24ff009cb87	2026-06-17 17:07:46.377
1f6ce34d-3097-495b-bb2e-12a79309d5da	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	8f5711c5-1246-409e-ada9-73c3c7a9256b	adjustment	11	12	11	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 18:45:33.486
a03be4ac-9e39-4719-8586-f4e869529390	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	8f5711c5-1246-409e-ada9-73c3c7a9256b	adjustment	11	11	11	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 18:46:18.716
88dc3066-c2db-411c-9381-4145f213858c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	70e7f8e9-aa5e-4611-be5a-0a2d1030e68b	adjustment	24	48	24	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 18:54:14.736
c52bac9a-7bc8-4b58-b76d-88b48e5bda56	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f540f44e-9244-4f00-8184-afcdd580cc5f	adjustment	5	5	5	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 18:55:52.593
fbff8669-8c43-4b47-bc4c-def860fb415d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	cc59e684-4a6b-42cf-9a27-2d1f84755135	adjustment	15	44	15	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 18:58:04.519
9bd9cc56-77d6-427a-9a74-e331b3a84c15	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	cc59e684-4a6b-42cf-9a27-2d1f84755135	adjustment	15	15	15	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 18:58:14.437
d592684f-4e49-4cf9-a351-843ff10c0709	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	70e7f8e9-aa5e-4611-be5a-0a2d1030e68b	sale	1	24	23	sale paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 19:00:57.989
08720c30-83ce-4a09-8db5-e5f40887285b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f540f44e-9244-4f00-8184-afcdd580cc5f	sale	1	5	4	sale paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 19:00:58.156
ed56f7de-cb3f-4b1d-907f-0c7259b713c8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	cc59e684-4a6b-42cf-9a27-2d1f84755135	sale	1	15	14	sale paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 19:00:58.318
339ea6a2-3c35-45c7-a6a6-09734e4e417e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	ba62679b-176a-473c-81b0-1f156361df92	adjustment	10	10	10	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 19:02:56.164
c7089a7b-9e5f-4bb6-9e91-1f0e28a1eed3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	e59f9b81-a33d-4887-b2ac-254daf515c1b	adjustment	10	0	10	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 22:22:26.818
2d672aa3-608e-42bb-891c-ce28beef8707	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	3e2c3880-6c39-4c2a-a3a1-010a186006ff	adjustment	10	10	10	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 22:40:21.888
abf9545f-be62-4a7a-bb2c-3260173d92a7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	d67b1954-9761-4dd4-a1ad-34bf55a8d770	adjustment	10000	10000	10000	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 22:41:34.23
3a781304-b2a5-45c6-a207-1fd721cd0a7c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f540f44e-9244-4f00-8184-afcdd580cc5f	adjustment	4	4	4	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 22:41:48.977
c18b9151-e30a-4a74-97b1-5569372d4c41	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	9062379f-fbce-4452-aec1-42465710a42c	adjustment	5	0	5	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 23:15:58.712
a6e3a5c1-cff1-4aa1-865f-e3dc146f6344	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7a691efc-030a-49c6-9620-4fea2843cd22	adjustment	10	10	10	dashboard product update	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 23:51:29.073
fd39ecf3-5c4c-4cab-b412-479adb75ce29	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	c7a8dd61-af92-46e6-989c-10204958f5cb	adjustment	10	10	10	dashboard product update	dac28a45-122f-47f0-85d2-9bd2ae523eff	2026-07-02 07:12:26.572
932f376c-f54c-419b-b5ee-63a65a17892e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	39ba6975-8c2e-46bb-8eab-3d96f7bc1afd	sale	2	20	18	sale paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:14:30.984
1d5c3b32-307f-44be-b502-7295b1c44ed1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	ba62679b-176a-473c-81b0-1f156361df92	sale	1	10	9	sale paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:18:09.037
dc2b487e-9d6d-4a6f-bc15-14ecf7b7eaa2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	717e503a-2141-4d77-9243-453133378a61	sale	1	10	9	sale paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:18:09.229
\.


--
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.logs (id, branch_id, actor_id, actor_name, actor_role, action_type, entity_type, entity_id, simulator_id, session_id, amount, details, created_at) FROM stdin;
be7a8f6a-2bd0-4c3e-9809-d98e44c604b8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	shift_opened	shift	cb40ae37-235a-4bca-9510-027675548a1e	\N	\N	\N	{"shift_type": "Tungi (19:00 - 03:00)", "starting_cash": 846000}	2026-07-01 18:14:24.91
d953bf2d-96c4-41e6-a320-1d7ff8f8ae2e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	978ee6cc-d260-4018-8723-8adff4d4aaf8	\N	\N	\N	{}	2026-07-01 22:30:28.426
a4b0c1dc-4247-4c1f-a398-44ba8b2b7d1b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	01a5dabe-de4e-47e1-bbc9-0d60af135a4b	\N	\N	\N	{}	2026-07-01 22:30:36.753
04962d74-485f-49cd-b7cb-3b504ef3794e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	9b8b5049-1d95-491c-baf4-0b4adceb8f52	\N	\N	\N	{}	2026-07-01 22:30:41.939
8a70c264-5051-49e1-8d3b-f7861bdb3e9e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	7dcb603c-2183-4ecc-a20b-6f22115197b2	\N	\N	\N	{}	2026-07-01 22:30:45.562
8c5e8aea-9f62-4e22-8624-ffa36518a1c2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	66a5b903-2d53-4886-ade1-6238c28969e6	\N	\N	\N	{}	2026-07-01 22:30:49.932
798937d0-e344-4b83-a0f5-d1a28f4b4931	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	3e2c3880-6c39-4c2a-a3a1-010a186006ff	\N	\N	\N	{"barcode": "4780072660161"}	2026-07-01 23:18:40.621
58f42356-2788-4140-82d2-9af601a87f71	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	0aede6ba-4094-4e51-b8db-789b35b8b8ee	\N	\N	\N	{}	2026-07-01 23:54:25.913
e364d06a-6844-4c14-ad62-091c28046b9c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	0aede6ba-4094-4e51-b8db-789b35b8b8ee	\N	\N	\N	{"cost": 0, "icon": "chicken", "name": "Megachips (sirniy)", "price": 10000, "barcode": "4810279000429", "category": "Snack", "stock_after": 10}	2026-07-01 23:54:26.068
1f9e2cd5-86e9-4488-9449-5685daf7d543	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	0aede6ba-4094-4e51-b8db-789b35b8b8ee	\N	\N	\N	{"barcode": "4810279000429"}	2026-07-01 23:54:30.392
0da9559f-73f3-4764-9cd9-b454bc632bed	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	0aede6ba-4094-4e51-b8db-789b35b8b8ee	\N	\N	\N	{"barcode": "4810279000429"}	2026-07-01 23:54:30.693
4e2c2558-d2c0-4a23-9610-c2e6298ec17b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	0aede6ba-4094-4e51-b8db-789b35b8b8ee	\N	\N	\N	{"barcode": "4810279000429"}	2026-07-01 23:54:32.186
6f97c034-e27b-49b7-bbc7-97aeac7678cf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	0aede6ba-4094-4e51-b8db-789b35b8b8ee	\N	\N	\N	{"barcode": "4810279000429"}	2026-07-01 23:54:32.529
c4e088df-4f4c-4503-b16c-8ef1da65e827	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	0aede6ba-4094-4e51-b8db-789b35b8b8ee	\N	\N	\N	{"barcode": "4810279000429"}	2026-07-01 23:54:40.043
999d105c-f377-4a09-9886-05d407fcbda7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	product_updated	product	c7a8dd61-af92-46e6-989c-10204958f5cb	\N	\N	\N	{}	2026-07-02 07:13:45.461
476657f1-ecbf-4ec6-b091-32ee8592f71f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	add_time	session	541f408d-e9b0-43eb-ae9c-22c0d0351143	9eae5376-edb1-4ebd-be59-1940bf83e7b6	541f408d-e9b0-43eb-ae9c-22c0d0351143	100000.000000000000000000000000000000	{}	2026-07-05 16:05:35.994
56ae6bc4-6254-475c-bb37-024383ec4c36	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Main Admin	admin	repair_requested	repair_request	c21671d4-9129-4b67-bda6-bf752bc184ff	ede5fe11-f029-4f7b-b355-938347c2dedd	\N	0.000000000000000000000000000000	{"seeded": true}	2026-06-08 13:00:41.554
cd0282dd-e125-469d-8683-930db29bed63	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	8f42a4ac-21ba-45f8-83a4-8c1497bf9e39	13f06790-c478-4e8e-8344-c1aa91b3e72f	8f42a4ac-21ba-45f8-83a4-8c1497bf9e39	0.000000000000000000000000000000	{}	2026-07-01 18:21:32.852
ac57cdc8-151d-42b9-8cb2-fd5e912e185b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a1d6a446-3e0c-4a20-951e-50c7b1b34fa4	\N	\N	\N	{"barcode": "4780102760304"}	2026-07-01 22:31:02.612
6e67e8ff-04af-41dd-b0a7-dff1dba47e85	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a1d6a446-3e0c-4a20-951e-50c7b1b34fa4	\N	\N	\N	{"barcode": "4780102760304"}	2026-07-01 22:31:06.263
6cabb839-935e-4cd9-be4a-a1f6ac6d0307	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	3e2c3880-6c39-4c2a-a3a1-010a186006ff	\N	\N	\N	{"barcode": "4780072660161"}	2026-07-01 23:18:40.823
46902ca0-7dd2-41da-bd23-6cc19ca8e0f8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	3e2c3880-6c39-4c2a-a3a1-010a186006ff	\N	\N	\N	{"barcode": "4780072660161"}	2026-07-01 23:18:41.227
578dd2cf-dee9-47b2-a619-6024c9f0f2e5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	673d5c1c-9f54-40c5-b8b2-a7d55713a15e	\N	\N	\N	{}	2026-07-01 23:55:11.7
0c1e0a00-dd5b-40cb-820f-b92d23d363ea	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	673d5c1c-9f54-40c5-b8b2-a7d55713a15e	\N	\N	\N	{"cost": 0, "icon": "cookie", "name": "Megachips (achik)", "price": 10000, "barcode": "4810279008340", "category": "Snack", "stock_after": 10}	2026-07-01 23:55:11.856
cf0fbf60-ba78-4d24-8a7c-59f6aac8d107	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	673d5c1c-9f54-40c5-b8b2-a7d55713a15e	\N	\N	\N	{"barcode": "4810279008340"}	2026-07-01 23:55:16.765
06678e23-e3a4-4398-9980-8befeaea7b9e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	673d5c1c-9f54-40c5-b8b2-a7d55713a15e	\N	\N	\N	{"barcode": "4810279008340"}	2026-07-01 23:55:16.936
f8e32d34-4ee2-46a6-8c35-cd56b05b0d34	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	673d5c1c-9f54-40c5-b8b2-a7d55713a15e	\N	\N	\N	{"barcode": "4810279008340"}	2026-07-01 23:55:25.315
5175328b-7fb8-43bf-b011-fb619521eb7e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	673d5c1c-9f54-40c5-b8b2-a7d55713a15e	\N	\N	\N	{"barcode": "4810279008340"}	2026-07-01 23:55:26.486
4f5d413d-e189-47cf-9b83-edfccb8ab5e9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	673d5c1c-9f54-40c5-b8b2-a7d55713a15e	\N	\N	\N	{"barcode": "4810279008340"}	2026-07-01 23:55:30.352
9aa10b59-1d46-417f-8559-de6d43ef3c93	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	\N	{}	2026-07-02 07:27:41.403
6302520a-6614-47da-9784-f480bfbae5da	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	d014d98c-c1f0-4ddf-a1dc-c07d26a1548d	93850eed-1a97-41de-9e9a-2506edd110ac	d014d98c-c1f0-4ddf-a1dc-c07d26a1548d	50000.000000000000000000000000000000	{}	2026-07-05 16:11:48.925
bb987fe0-a725-4672-a65a-470f96ec77a2	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:40.8
d330e01a-4113-4089-9f68-c97bb62cff35	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:40.9
55526e75-fde4-4fb5-9de9-5326eabc3e4d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:41.508
0ee79eb1-096b-440f-b0cf-c2f5b87f1f13	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	8f42a4ac-21ba-45f8-83a4-8c1497bf9e39	13f06790-c478-4e8e-8344-c1aa91b3e72f	8f42a4ac-21ba-45f8-83a4-8c1497bf9e39	\N	{}	2026-07-01 18:22:58.755
6fb99919-662e-461c-8552-cb91fd26409c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	\N	{"rig_id": "Vip-3"}	2026-07-01 18:22:59.176
046435fa-6d76-463c-aaf7-8b61a5d9d5af	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	5a570593-cfbb-4e09-9ad9-ff5cd4472900	\N	\N	\N	{}	2026-07-01 22:32:59.863
21c2033d-aaf9-4cc7-a6a5-e6ef3e5d47b7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	5a570593-cfbb-4e09-9ad9-ff5cd4472900	\N	\N	\N	{"cost": 0, "icon": "candy", "name": "TWIX", "price": 10000, "barcode": "6221134012712", "category": "Snack", "stock_after": 10000}	2026-07-01 22:33:00.031
223c4857-680a-4e1f-a4e7-e68e9644e816	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	5a570593-cfbb-4e09-9ad9-ff5cd4472900	\N	\N	\N	{"barcode": "6221134012712"}	2026-07-01 22:33:08.425
4b3d0abd-4264-4b78-a2fa-67ca6de9fe9e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a1d6a446-3e0c-4a20-951e-50c7b1b34fa4	\N	\N	\N	{"barcode": "4780102760304"}	2026-07-01 22:33:15.989
d40f1c75-d193-4878-926c-73b08e571b63	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	e97d5c26-14af-48cc-ac27-ded8cd286c32	\N	\N	\N	{}	2026-07-01 23:26:16.252
bd74e1f9-6f66-4aa2-b9de-bc442d68c722	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	e97d5c26-14af-48cc-ac27-ded8cd286c32	\N	\N	\N	{"cost": 0, "icon": "energy", "name": "Moxito klubnika kichik", "price": 15000, "barcode": "4600068054142", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 23:26:16.406
57d46d81-b642-4a74-bc5e-29f014c7b979	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	71fb7685-1cd4-4c96-bed3-b30cac8e52b7	\N	\N	\N	{}	2026-07-01 23:56:00.041
948269fb-34a6-4137-83cf-63c736833d72	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	71fb7685-1cd4-4c96-bed3-b30cac8e52b7	\N	\N	\N	{"cost": 0, "icon": "cookie", "name": "Megachips (shashlik)", "price": 10000, "barcode": "4810279008487", "category": "Snack", "stock_after": 10}	2026-07-01 23:56:00.192
5d9d5764-b141-4571-acf7-79f76da5e798	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	71fb7685-1cd4-4c96-bed3-b30cac8e52b7	\N	\N	\N	{"barcode": "4810279008487"}	2026-07-01 23:56:06.468
67b49a4d-3293-447d-a488-0b23b70e33bd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	71fb7685-1cd4-4c96-bed3-b30cac8e52b7	\N	\N	\N	{"barcode": "4810279008487"}	2026-07-01 23:56:10.847
6b850f2b-24fd-4ae0-8f31-c0f8dd33c5fc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	71fb7685-1cd4-4c96-bed3-b30cac8e52b7	\N	\N	\N	{"barcode": "4810279008487"}	2026-07-01 23:56:11.483
eb9b9825-d72f-480a-b231-d600b50fd301	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	71fb7685-1cd4-4c96-bed3-b30cac8e52b7	\N	\N	\N	{"barcode": "4810279008487"}	2026-07-01 23:56:11.886
1d387541-d3df-4cc0-81ca-84811ac2d5e6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	71fb7685-1cd4-4c96-bed3-b30cac8e52b7	\N	\N	\N	{"barcode": "4810279008487"}	2026-07-01 23:56:12.619
97daddae-5be4-4ac5-95aa-e825cd01b9ab	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	\N	{}	2026-07-02 08:36:51.532
623ee0b7-c95c-47ff-86e8-962ddec934cc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	63c908d4-c831-4252-bc67-f5701de7c381	8b29e323-2d6a-4bc4-8f9c-89a76d11e3aa	63c908d4-c831-4252-bc67-f5701de7c381	50000.000000000000000000000000000000	{}	2026-07-05 16:12:15.553
dad8275a-2c95-4fb1-a1aa-6e52ad207ae3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	795d7232-3141-482f-94bf-03668fa7835a	9eae5376-edb1-4ebd-be59-1940bf83e7b6	795d7232-3141-482f-94bf-03668fa7835a	80000.000000000000000000000000000000	{}	2026-07-01 18:26:55.309
974a5159-a5d8-42d3-ab93-7483900a6760	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	d67b1954-9761-4dd4-a1ad-34bf55a8d770	\N	\N	\N	{}	2026-07-01 22:38:21.972
38a93a1f-e79b-4fed-8e03-1d221c86442e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	d67b1954-9761-4dd4-a1ad-34bf55a8d770	\N	\N	\N	{"cost": 6500, "icon": "snack", "name": "Вакуум курт тош", "price": 10000, "barcode": "4780102760335", "category": "Ichimliklar", "stock_after": 10000}	2026-07-01 22:38:22.125
5bcb5a8a-ad50-4b00-bd0a-a1ce29cfd184	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	e97d5c26-14af-48cc-ac27-ded8cd286c32	\N	\N	\N	{"barcode": "4600068054142"}	2026-07-01 23:26:26.93
0989e02f-f1d8-4262-bb1b-c606b77a386a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	e97d5c26-14af-48cc-ac27-ded8cd286c32	\N	\N	\N	{"barcode": "4600068054142"}	2026-07-01 23:26:27.335
b494a98a-95b0-4961-bb01-b46523f313e4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	e97d5c26-14af-48cc-ac27-ded8cd286c32	\N	\N	\N	{"barcode": "4600068054142"}	2026-07-01 23:26:27.982
6344bf40-8689-4d2b-a365-59604a8e7a42	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	e97d5c26-14af-48cc-ac27-ded8cd286c32	\N	\N	\N	{"barcode": "4600068054142"}	2026-07-01 23:26:28.466
1768a1cb-fb81-45de-8b26-599db96359a7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	71fb7685-1cd4-4c96-bed3-b30cac8e52b7	\N	\N	\N	{"barcode": "4810279008487"}	2026-07-02 00:01:02.654
6c91492d-7dec-4815-a91f-f7f4799019f0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	0aede6ba-4094-4e51-b8db-789b35b8b8ee	\N	\N	\N	{"barcode": "4810279000429"}	2026-07-02 00:01:08.718
c6ad5c7d-4758-4e45-a515-4f862cff6dc6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	673d5c1c-9f54-40c5-b8b2-a7d55713a15e	\N	\N	\N	{"barcode": "4810279008340"}	2026-07-02 00:01:12.508
fea41741-20a0-48bc-9541-b9e1722c935f	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	\N	{}	2026-07-02 08:38:04.237
7f12b897-7cab-4ca0-b1f8-409492c565ec	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	2a86cce4-e6d1-4cf1-adb9-b746eb0495ed	1b7395de-87f0-46f0-996e-6d62617e0922	2a86cce4-e6d1-4cf1-adb9-b746eb0495ed	\N	{}	2026-07-05 16:18:38.179
bae9ddbf-5a3b-4466-89a1-350e98624cbf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	\N	{"rig_id": "Rig-4"}	2026-07-05 16:18:38.439
295a7602-f432-4ed4-9b07-eb797ce3e116	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	\N	{"simulator_map_layout": {"facilities": {"wc": {"col": 6, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 6, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 6, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-07-01 18:28:09.517
4edbd30b-c578-4a33-8c16-60e2423fdde4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	d67b1954-9761-4dd4-a1ad-34bf55a8d770	\N	\N	\N	{"barcode": "4780102760335"}	2026-07-01 22:38:43.602
786ac112-a615-4f60-baaa-df70be160a7b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	d67b1954-9761-4dd4-a1ad-34bf55a8d770	\N	\N	\N	{"barcode": "4780102760335"}	2026-07-01 22:38:50.967
5ae8674e-b3ec-455f-9b0b-6e0ff61af958	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	3e44b847-85aa-4ad0-83f0-c696cb14f0c8	\N	\N	\N	{}	2026-07-01 23:27:00.089
d277e212-e856-4d10-9945-60bc12bbd3b8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	3e44b847-85aa-4ad0-83f0-c696cb14f0c8	\N	\N	\N	{"cost": 0, "icon": "energy", "name": "Moxito laym kichik", "price": 15000, "barcode": "4600068054128", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 23:27:00.243
b9668f54-5948-4481-a44c-94f77b37a520	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	3e44b847-85aa-4ad0-83f0-c696cb14f0c8	\N	\N	\N	{"barcode": "4600068054128"}	2026-07-01 23:27:06.893
fa5a1828-66b9-4c26-9f73-5711870d8b0d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	3e44b847-85aa-4ad0-83f0-c696cb14f0c8	\N	\N	\N	{"barcode": "4600068054128"}	2026-07-01 23:27:08.404
3b6c4ee3-5e0d-4432-959c-71413b31bedf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	3e44b847-85aa-4ad0-83f0-c696cb14f0c8	\N	\N	\N	{"barcode": "4600068054128"}	2026-07-01 23:27:08.927
84336659-cf9f-4dd8-9fd7-3f99b2ca6e36	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	3e44b847-85aa-4ad0-83f0-c696cb14f0c8	\N	\N	\N	{"barcode": "4600068054128"}	2026-07-01 23:27:09.366
0ca52e94-5487-429c-885b-0e1022684222	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	f9e6adf0-8e50-4668-938d-19e7ef32b766	\N	\N	\N	{}	2026-07-02 00:02:05.335
8ca3568d-7571-456c-95f4-35872c3f9711	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	f9e6adf0-8e50-4668-938d-19e7ef32b766	\N	\N	\N	{"cost": 0, "icon": "cookie", "name": "Megachips (pitsa)", "price": 10000, "barcode": "4810279008654", "category": "Snack", "stock_after": 10}	2026-07-02 00:02:05.491
c3e6565c-2dc6-4b9e-8268-5217e1c243e7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	f9e6adf0-8e50-4668-938d-19e7ef32b766	\N	\N	\N	{"barcode": "4810279008654"}	2026-07-02 00:02:12.455
cc9941f5-ff8e-43ec-8908-6e13cb489a56	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	f9e6adf0-8e50-4668-938d-19e7ef32b766	\N	\N	\N	{"barcode": "4810279008654"}	2026-07-02 00:02:15.022
233b37c5-b288-4bef-8569-9ef778f6f46f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	tariff_updated	tariff	38401fb5-44df-4594-b645-6e94b746274f	\N	\N	\N	{}	2026-07-02 08:40:32.28
8de19313-8e39-48ec-be8c-4aa67e2deb61	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	tariff_updated	tariff	38401fb5-44df-4594-b645-6e94b746274f	\N	\N	\N	{}	2026-07-02 08:40:32.585
0379fe75-7f9d-44f4-bc84-db9f3f968fcc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	tariff_updated	tariff	38401fb5-44df-4594-b645-6e94b746274f	\N	\N	\N	{}	2026-07-02 08:40:33.091
95982429-4e84-40cf-93cf-92455c2069e5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	tariff_updated	tariff	38401fb5-44df-4594-b645-6e94b746274f	\N	\N	\N	{}	2026-07-02 08:40:33.386
731e49e3-2842-40af-9a3d-1007ae9eda43	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	tariff_updated	tariff	38401fb5-44df-4594-b645-6e94b746274f	\N	\N	\N	{}	2026-07-02 08:40:33.816
555d566e-34b6-45f0-b580-f4328fc10b34	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	maintenance_opened	repair_request	8caed594-6236-4f65-bb65-92a14dc6ed8f	1b7395de-87f0-46f0-996e-6d62617e0922	\N	\N	{}	2026-07-05 16:41:32.582
473cf105-570f-4eab-98bf-28e02f81423e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	maintenance_opened	repair_request	7874570c-19eb-4b81-91ad-47e72dd3c929	f124efe3-f0cc-4116-8984-b2d1bae6885b	\N	\N	{}	2026-07-05 16:41:42.079
93691328-216e-4979-9e39-b57c7fbf10ba	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	maintenance_opened	repair_request	3b2fbeef-7eda-4119-b98e-a350cf59b50d	7b32e26f-38b4-46db-a026-41b7b19ca136	\N	\N	{}	2026-07-05 16:41:50.638
6cb6c938-f67b-498c-9398-7da9caa5620d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:23.145
9bf89757-d040-4193-8db8-a2ddd6c27493	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:23.249
3e62b7a1-48ef-4563-9ad8-df7987052922	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:25.537
a486321d-4dcf-4048-94f6-f315bee72765	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:26.138
920a9900-7348-4a7c-b507-2bba6cfc3be8	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:29.439
b8ef61c1-c19f-4a08-b88f-0efca472f083	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:30.539
81335a16-a545-48f6-92b3-45a344a8fc9f	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:30.644
38921286-dc91-45c5-9fd3-282f68791c9a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:31.242
e0053a14-5b37-4b63-b2f5-9282c7e0aaa8	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:31.843
2d6d6b9d-3795-4658-a25c-2fac7fc97620	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:32.849
3f85348a-6992-4a37-98c6-7018477d038e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	\N	{"simulator_map_layout": {"facilities": {"wc": {"col": 6, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 6, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 6, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-07-01 18:28:33.28
d8fd5bc8-3bc2-48c1-85fe-9c3a6548bacd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	bb889a9a-f2a0-4c2f-84c8-d03a026f5f2c	\N	\N	\N	{}	2026-07-01 22:39:49.224
d5a78b4e-ff6a-472a-ac3d-116c40fde5ce	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	bb889a9a-f2a0-4c2f-84c8-d03a026f5f2c	\N	\N	\N	{"cost": 6500, "icon": "snack", "name": "Вакуум курт райхон", "price": 10000, "barcode": "4780102760328", "category": "Snack", "stock_after": 10000}	2026-07-01 22:39:49.378
0ec540d5-6a03-4d6c-8a4f-4c8dedb27fd2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	60fbc4cd-9378-4bb5-8ea2-ee7f4a62ddec	\N	\N	\N	{}	2026-07-01 23:28:30.307
3f0515a7-f5d1-4d4d-a0dc-3d850c249433	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	60fbc4cd-9378-4bb5-8ea2-ee7f4a62ddec	\N	\N	\N	{"cost": 0, "icon": "water", "name": "Fuse tea Ramashka", "price": 10000, "barcode": "4780069000840", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 23:28:30.457
95234c71-71cb-4ad5-834f-a405534f6850	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	60fbc4cd-9378-4bb5-8ea2-ee7f4a62ddec	\N	\N	\N	{"barcode": "4780069000840"}	2026-07-01 23:28:38.108
2f3b2d42-654a-40c5-b267-c6b9467e568b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	60fbc4cd-9378-4bb5-8ea2-ee7f4a62ddec	\N	\N	\N	{"barcode": "4780069000840"}	2026-07-01 23:28:40.658
0f2da5ef-e2e5-41e6-bd6c-085d00474989	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	60fbc4cd-9378-4bb5-8ea2-ee7f4a62ddec	\N	\N	\N	{"barcode": "4780069000840"}	2026-07-01 23:28:41.077
a30827de-afa4-483d-88b5-08fe333ec493	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	60fbc4cd-9378-4bb5-8ea2-ee7f4a62ddec	\N	\N	\N	{"barcode": "4780069000840"}	2026-07-01 23:28:41.518
01f7f773-f711-4666-9671-e1fdd7c2794b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	60fbc4cd-9378-4bb5-8ea2-ee7f4a62ddec	\N	\N	\N	{"barcode": "4780069000840"}	2026-07-01 23:28:42.758
92904c1d-2202-414c-bff8-794ec9f13542	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	665ed85f-481f-4375-b438-586951259c8d	\N	\N	\N	{}	2026-07-02 00:02:46.51
76d383fa-0c22-4682-85c9-17de2ade86c3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	665ed85f-481f-4375-b438-586951259c8d	\N	\N	\N	{"cost": 0, "icon": "cookie", "name": "Megachips (kalbasniy)", "price": 10000, "barcode": "4810279009187", "category": "Snack", "stock_after": 10}	2026-07-02 00:02:46.616
b600880b-c58d-46c4-97a2-e44fe86558ae	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	665ed85f-481f-4375-b438-586951259c8d	\N	\N	\N	{"barcode": "4810279009187"}	2026-07-02 00:02:54.858
95663870-a49c-44eb-b227-a2fa1b6b751d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	665ed85f-481f-4375-b438-586951259c8d	\N	\N	\N	{"barcode": "4810279009187"}	2026-07-02 00:02:55.59
6bfef5c1-673d-4497-bfd7-6ad363d9b6e7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	665ed85f-481f-4375-b438-586951259c8d	\N	\N	\N	{"barcode": "4810279009187"}	2026-07-02 00:02:55.97
4e956d9e-8769-41f9-a9d0-8533f0cf9c54	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	665ed85f-481f-4375-b438-586951259c8d	\N	\N	\N	{"barcode": "4810279009187"}	2026-07-02 00:02:56.337
9dcc0f3b-b416-40d0-8ebf-c15c804a3b4a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	665ed85f-481f-4375-b438-586951259c8d	\N	\N	\N	{"barcode": "4810279009187"}	2026-07-02 00:02:56.588
278a59db-ef6a-4e53-931c-3feab3d61b06	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	665ed85f-481f-4375-b438-586951259c8d	\N	\N	\N	{"barcode": "4810279009187"}	2026-07-02 00:02:56.908
f8266584-9337-4b09-bec9-8e8df7a4f598	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	665ed85f-481f-4375-b438-586951259c8d	\N	\N	\N	{"barcode": "4810279009187"}	2026-07-02 00:02:57.414
584e9170-25f5-452e-bf51-d5a738b9d4fe	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	665ed85f-481f-4375-b438-586951259c8d	\N	\N	\N	{"barcode": "4810279009187"}	2026-07-02 00:02:57.611
a9e5bc66-4b09-4db0-b529-68e989a4b88d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	665ed85f-481f-4375-b438-586951259c8d	\N	\N	\N	{"barcode": "4810279009187"}	2026-07-02 00:02:57.971
e0bc609a-024c-428c-9412-a2a67e6713af	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	665ed85f-481f-4375-b438-586951259c8d	\N	\N	\N	{"barcode": "4810279009187"}	2026-07-02 00:02:58.117
1e622ede-19eb-46b8-b346-050fb2237c28	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	665ed85f-481f-4375-b438-586951259c8d	\N	\N	\N	{"barcode": "4810279009187"}	2026-07-02 00:02:58.364
981a0931-0dda-4255-8b17-c0f6972598c1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:10:43.412
53ff5474-768e-4ef5-91cc-034dce511696	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:11:27.413
15c76fdc-b7a8-4027-8f3d-4a96a15756fd	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:11:28.915
57e9b5fc-c4e3-4dcd-9193-4b27fb6cd132	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:11:29.214
50102bda-40ce-4205-bc39-b0d44aee469e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:11:29.824
996a36f0-8fce-4f72-97ff-fd6786463be1	eb31d71a-6ede-496d-9851-542b42b8e2f9	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	login	user	67005460-527d-4723-915f-8ff20067e42d	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:12:26.722
030f75ce-3c40-4d57-b81c-63e253ac5b57	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:12:30.416
22b4a6b7-0d2e-451a-88d8-a639ec651b7c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_created	product	37e42e81-2b80-43b4-8ad4-9de1327c91e3	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:12:33.361
9295837a-200c-485d-8e51-70d0240a7f30	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_inventory_created	product	37e42e81-2b80-43b4-8ad4-9de1327c91e3	\N	\N	0.000000000000000000000000000000	{"cost": 15500, "icon": "drink", "name": "Redbull", "price": 22000, "barcode": "777123", "category": "Ichimliklar", "stock_after": 24}	2026-06-09 15:12:33.448
d44811a7-5bc0-4123-bcb6-9c6021bfdaec	eb31d71a-6ede-496d-9851-542b42b8e2f9	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	login	user	67005460-527d-4723-915f-8ff20067e42d	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:48:02.72
0c22e7e3-2bb6-4319-a4c6-2ed093244b56	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	tariff_updated	tariff	38401fb5-44df-4594-b645-6e94b746274f	\N	\N	\N	{}	2026-07-02 08:40:33.022
bcc80b75-f8e6-4cd3-94dd-f8e811daf0c7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	maintenance_closed	repair_request	3b2fbeef-7eda-4119-b98e-a350cf59b50d	7b32e26f-38b4-46db-a026-41b7b19ca136	\N	833.000000000000000000000000000000	{}	2026-07-05 16:42:13.388
0b64460f-2f56-4c56-bfbe-424031b6e0e1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	50c4f384-ddd8-4514-b73c-1aa531df554c	1b7395de-87f0-46f0-996e-6d62617e0922	50c4f384-ddd8-4514-b73c-1aa531df554c	40000.000000000000000000000000000000	{}	2026-07-01 18:34:18.009
0e5167bf-5c41-44fc-b73f-4125b499c6a1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	bb889a9a-f2a0-4c2f-84c8-d03a026f5f2c	\N	\N	\N	{"barcode": "4780102760328"}	2026-07-01 22:40:04.929
66bbc850-596c-4354-bda9-62ce9b41327d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	d37b6dc1-06ed-4d7c-b0a8-1ac2b3c755f3	\N	\N	\N	{}	2026-07-01 23:29:19.326
ab549565-f61e-4eb4-87f1-32e0b52d6319	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	d37b6dc1-06ed-4d7c-b0a8-1ac2b3c755f3	\N	\N	\N	{"cost": 0, "icon": "drink", "name": "Fuse tea Ananas", "price": 10000, "barcode": "4780069000864", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 23:29:19.51
a9fec0d0-e896-4c86-9215-b98988235a86	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	d37b6dc1-06ed-4d7c-b0a8-1ac2b3c755f3	\N	\N	\N	{"barcode": "4780069000864"}	2026-07-01 23:29:27.152
7bbd04b1-fd0d-46c4-8137-1fdb3103fb38	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	d37b6dc1-06ed-4d7c-b0a8-1ac2b3c755f3	\N	\N	\N	{"barcode": "4780069000864"}	2026-07-01 23:29:27.469
04499d80-a7b4-4a79-9b19-f29c47596d0b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	shift_closed	shift	cb40ae37-235a-4bca-9510-027675548a1e	\N	\N	355000.000000000000000000000000000000	{"bank": 0, "card": 75000, "cash": 280000, "balance": 0, "expenses": 0, "recipient": "Owner", "difference": 0, "cash_expenses": 0, "cash_withdrawn": 0, "remaining_cash": 1126000}	2026-07-02 06:26:39.595
a96b4fa5-81ce-4f16-8651-ab355d2c64c7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	tariff_updated	tariff	38401fb5-44df-4594-b645-6e94b746274f	\N	\N	\N	{}	2026-07-02 08:40:33.029
20910b50-335d-431b-bb81-28025bd343e9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	tariff_updated	tariff	38401fb5-44df-4594-b645-6e94b746274f	\N	\N	\N	{}	2026-07-02 08:40:33.911
b26a03e2-0c81-45d3-9384-c60a452ec383	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	af2d8df2-f42d-4f37-b43c-9e8a5ab99d9f	7b32e26f-38b4-46db-a026-41b7b19ca136	af2d8df2-f42d-4f37-b43c-9e8a5ab99d9f	0.000000000000000000000000000000	{}	2026-07-05 16:42:25.759
a423f8bc-b8d2-4a58-8d10-9e219f1597b1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-10 10:30:16.623
aaf7824e-801c-4de9-a020-a30d89a7389c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 10:43:33.812
93d7b8f5-2c3b-4f34-8e15-9c9e722d1cf4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 10:58:38.857
4b92198f-37bf-4b5b-a8fb-d92b8860a287	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	93a97756-772d-4e44-9d07-3dadeac19ddb	Main Admin	admin	login	user	93a97756-772d-4e44-9d07-3dadeac19ddb	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 11:06:35.815
cae04b91-9078-47e9-801e-8f3955afa686	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	93a97756-772d-4e44-9d07-3dadeac19ddb	Main Admin	admin	login	user	93a97756-772d-4e44-9d07-3dadeac19ddb	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 11:32:29.868
d88c9a22-b1d4-4b1e-91d4-8044e591a14a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	stop_session	session	59ce53ba-01a7-4b7d-8f9c-bd5c063e69fb	f7db86e9-4c80-4f1c-a1d4-6f78b93e5bba	59ce53ba-01a7-4b7d-8f9c-bd5c063e69fb	0.000000000000000000000000000000	{}	2026-06-10 12:01:27.377
7ef1f599-ce81-4065-b0bc-343680a04eb8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "bm-pc"}	2026-06-10 12:01:29.027
2ac0c7c1-7e25-4578-8fc1-b8f42a86e08e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	stop_session	session	546a3a1d-fad3-4aea-a8c4-b3b35caa713f	7560ac62-9494-4ba7-95c8-23d3e3313943	546a3a1d-fad3-4aea-a8c4-b3b35caa713f	0.000000000000000000000000000000	{}	2026-06-10 12:02:39.033
b3a5dc78-eb67-43f1-9ee4-32fb1d8fa78a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-10 12:02:41.072
af2d893c-7518-4281-aaaf-5531f6e0da3f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	8f5711c5-1246-409e-ada9-73c3c7a9256b	\N	\N	\N	{}	2026-07-01 18:45:32.558
b15db8c0-cd09-45c9-a0a1-850428670c8f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	6ad54080-650c-4612-8428-17d070f58cc3	\N	\N	\N	{"cost": 17000, "icon": "snack", "name": "Burger", "type": "adjustment", "price": 25000, "reason": "dashboard product update", "barcode": "4780001000035", "quantity": 11, "product_id": "8f5711c5-1246-409e-ada9-73c3c7a9256b", "after_quantity": 11, "before_quantity": 12}	2026-07-01 18:45:33.539
3c6d1a78-9303-462f-95b6-f16d85625a8c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	3e2c3880-6c39-4c2a-a3a1-010a186006ff	\N	\N	\N	{}	2026-07-01 22:40:20.862
e726c6f3-e9ed-41ce-be18-09a41755291a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	56f7545e-c38f-4bae-a5b2-68b9a0cc35b2	\N	\N	\N	{"cost": 0, "icon": "energy", "name": "Bfresh limon", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "4780072660161", "quantity": 10, "product_id": "3e2c3880-6c39-4c2a-a3a1-010a186006ff", "after_quantity": 10, "before_quantity": 10}	2026-07-01 22:40:21.943
0c335cb3-a59d-4458-ac28-c49e060ef57a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	53f9c27b-c18d-4e5c-9e9c-4e17e7544704	\N	\N	\N	{}	2026-07-01 23:30:27.351
4365ae8e-99e2-4f76-acda-a36287a35c6b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	53f9c27b-c18d-4e5c-9e9c-4e17e7544704	\N	\N	\N	{"cost": 0, "icon": "drink", "name": "Fuse tea Shaftoli", "price": 10000, "barcode": "4780069000819", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 23:30:27.455
014241fc-d841-4c53-a9cf-f8285d3b8031	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	53f9c27b-c18d-4e5c-9e9c-4e17e7544704	\N	\N	\N	{"barcode": "4780069000819"}	2026-07-01 23:30:36.554
f3bf30fc-90a0-45f7-9a26-b3a29cd6deee	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	53f9c27b-c18d-4e5c-9e9c-4e17e7544704	\N	\N	\N	{"barcode": "4780069000819"}	2026-07-01 23:30:37.093
b0663eae-ea4b-47c1-9f3f-5f61b3a8ab60	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	53f9c27b-c18d-4e5c-9e9c-4e17e7544704	\N	\N	\N	{"barcode": "4780069000819"}	2026-07-01 23:30:37.813
9aed1c34-6245-4037-a56e-e5129aff1f22	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	\N	{}	2026-07-02 07:09:08.379
e5586399-4137-4d33-9c94-6f18f9ced9a5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	tariff_updated	tariff	38401fb5-44df-4594-b645-6e94b746274f	\N	\N	\N	{}	2026-07-02 08:40:33.812
5238196f-c121-41d0-9430-b2160a8a2610	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	maintenance_closed	repair_request	8caed594-6236-4f65-bb65-92a14dc6ed8f	1b7395de-87f0-46f0-996e-6d62617e0922	\N	30000.000000000000000000000000000000	{}	2026-07-05 17:17:54.315
d41fa6ab-71f1-4279-99c1-1790baa1e19c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	stop_session	session	c870cff7-725e-4539-a88a-21b6d7e2fa35	7560ac62-9494-4ba7-95c8-23d3e3313943	c870cff7-725e-4539-a88a-21b6d7e2fa35	0.000000000000000000000000000000	{}	2026-06-10 13:34:03.656
ad776189-b474-4925-a64b-890c26831f08	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-10 13:34:09.715
692b3bac-3f4d-4492-9d18-9270f53bb5d2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	stop_session	session	496ea8d0-a461-4f46-bd60-a733bf741fa6	7560ac62-9494-4ba7-95c8-23d3e3313943	496ea8d0-a461-4f46-bd60-a733bf741fa6	0.000000000000000000000000000000	{}	2026-06-10 13:34:21.39
2263bee6-757d-4bd1-9758-c296666795e5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-10 13:34:25.211
1be28500-fab5-489f-8003-527b89654e2c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	stop_session	session	bba4b667-0750-42e4-bf8a-ac95b3455606	7560ac62-9494-4ba7-95c8-23d3e3313943	bba4b667-0750-42e4-bf8a-ac95b3455606	0.000000000000000000000000000000	{}	2026-06-10 13:35:01.142
aa995333-8b8b-4b36-9da8-a025bf89d1d0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-10 13:35:06.907
2a29c317-8a04-46da-8e74-7178fe11ee62	eb31d71a-6ede-496d-9851-542b42b8e2f9	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	login	user	67005460-527d-4723-915f-8ff20067e42d	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 13:48:19.959
c9c632df-2c85-48ab-8be0-1607f4c8a6ef	eb31d71a-6ede-496d-9851-542b42b8e2f9	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	shift_opened	shift	35318f99-a70c-42c7-93ee-92dea698622d	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 13:48:32.388
e6a017b1-aa96-4cd9-8800-45f50f300802	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 13:49:08.91
0f1823bb-d09f-403c-94f3-95a52c437292	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 13:49:10.156
2e5ad573-17a2-4c2c-aaaa-3c2b3d4a32b2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	dcbc8c33-bcaf-4b22-ab6d-0709abc8d360	7560ac62-9494-4ba7-95c8-23d3e3313943	dcbc8c33-bcaf-4b22-ab6d-0709abc8d360	0.000000000000000000000000000000	{"source": "system", "expired": true}	2026-06-10 13:52:54.571
9e2c90b0-e41d-4183-ba4a-ec4fb1100423	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	42547733-9ff0-425e-a640-9141e6334968	7560ac62-9494-4ba7-95c8-23d3e3313943	42547733-9ff0-425e-a640-9141e6334968	0.000000000000000000000000000000	{"source": "system", "expired": true}	2026-06-10 13:54:30.679
2bd81806-fede-46bf-a6f5-714da52e65f5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	d03667b8-463d-440f-b3a4-70b82ab4dc5f	f7db86e9-4c80-4f1c-a1d4-6f78b93e5bba	d03667b8-463d-440f-b3a4-70b82ab4dc5f	0.000000000000000000000000000000	{"source": "system", "expired": true}	2026-06-10 15:29:33.641
00902f40-04c1-49cd-9543-04b8f36cc77d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	8f5711c5-1246-409e-ada9-73c3c7a9256b	\N	\N	\N	{}	2026-07-01 18:46:17.831
c40330a2-a138-42e1-bb8c-116ae86e0076	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	6ad54080-650c-4612-8428-17d070f58cc3	\N	\N	\N	{"cost": 17000, "icon": "snack", "name": "Burger", "type": "adjustment", "price": 25000, "reason": "dashboard product update", "barcode": "0001BRG", "quantity": 11, "product_id": "8f5711c5-1246-409e-ada9-73c3c7a9256b", "after_quantity": 11, "before_quantity": 11}	2026-07-01 18:46:18.769
0731efe8-94c1-4ffa-98b5-549b9accf3c4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	60cb0922-1d71-4d03-ae81-1ebf4f506396	\N	\N	\N	{}	2026-07-01 22:41:07.099
baef7b29-83d7-43ae-8fb2-2df09a446f03	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	97ae7f2f-c33b-4027-9fc7-d29dbbee6c60	\N	\N	\N	{}	2026-07-01 23:31:11.672
eb2c3279-197e-4d42-8542-0011188d1532	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	97ae7f2f-c33b-4027-9fc7-d29dbbee6c60	\N	\N	\N	{"cost": 0, "icon": "drink", "name": "Lipton", "price": 10000, "barcode": "4780022620498", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 23:31:11.825
1deddaf4-f65a-44b3-b359-29f13db6a35a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	shift_opened	shift	1d0dea0e-a911-49de-a5bb-d67707597bf1	\N	\N	\N	{"shift_type": "Kunduzgi (10:00 - 19:00)", "starting_cash": 0}	2026-07-02 07:09:23.715
359617a6-2a7b-43bf-b6b0-ac45b1212537	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	tariff_updated	tariff	38401fb5-44df-4594-b645-6e94b746274f	\N	\N	\N	{}	2026-07-02 08:40:33.812
b2607d94-3b89-4015-9a46-ff5fc15ccb7a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	maintenance_closed	repair_request	7874570c-19eb-4b81-91ad-47e72dd3c929	f124efe3-f0cc-4116-8984-b2d1bae6885b	\N	30833.000000000000000000000000000000	{}	2026-07-05 17:18:28.055
fd7e790b-bdba-44a0-8916-2b1079a69346	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 09:56:14.712
c004ccf4-7cc5-412c-8507-d28b8cb3b7fa	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 10:04:12.332
405c81af-b465-46b5-81e8-85c92745cac4	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 11:04:35.76
a22f0c47-ce22-48dc-8546-e9f81e2dfa87	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 11:06:52.885
a742fff7-3b96-4d5f-9b93-81ccf7086b1b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 11:08:37.159
d3a792f2-0455-4a63-8f00-0e8f995838af	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 11:09:02.887
eca0b2f3-462d-4068-8dae-048c20bd8fff	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 11:09:28.294
d69db3f2-60a9-4e8b-a1d4-3ec9efb77f04	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 4, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 13, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-11 11:09:55.274
f4e22624-3dfc-4379-a493-1ec460357c65	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	d6397ff6-c9fd-4d19-a463-fe2b2d40f469	\N	\N	\N	{"barcode": "4780001000059"}	2026-07-01 18:50:06.645
273585dc-872b-4aef-983f-1851c61abda2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	d6397ff6-c9fd-4d19-a463-fe2b2d40f469	\N	\N	\N	{"barcode": "4780001000059"}	2026-07-01 18:50:14.6
03207c28-c08e-400d-895d-8d2a7fd38019	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	d6397ff6-c9fd-4d19-a463-fe2b2d40f469	\N	\N	\N	{"barcode": "4780001000059"}	2026-07-01 18:50:16.906
b7961003-46c8-4ce8-b804-5f758792dd2d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	d67b1954-9761-4dd4-a1ad-34bf55a8d770	\N	\N	\N	{}	2026-07-01 22:41:33.364
0c5fb3c9-ca76-4941-a39f-3ece46bd7459	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	8f4c4160-ef66-4034-bda3-9d4f8b30bfa1	\N	\N	\N	{"cost": 6500, "icon": "snack", "name": "Вакуум курт тош", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "4780102760335", "quantity": 10000, "product_id": "d67b1954-9761-4dd4-a1ad-34bf55a8d770", "after_quantity": 10000, "before_quantity": 10000}	2026-07-01 22:41:34.285
a9edc7fe-6cf5-4a52-97ef-9bdb63ef4a03	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	97ae7f2f-c33b-4027-9fc7-d29dbbee6c60	\N	\N	\N	{"barcode": "4780022620498"}	2026-07-01 23:31:24.062
01d20b9a-4ecc-43de-94c8-f297c337ab72	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	97ae7f2f-c33b-4027-9fc7-d29dbbee6c60	\N	\N	\N	{"barcode": "4780022620498"}	2026-07-01 23:31:26.677
134e2227-6b45-4e81-81fe-b7b731635e61	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	97ae7f2f-c33b-4027-9fc7-d29dbbee6c60	\N	\N	\N	{"barcode": "4780022620498"}	2026-07-01 23:31:27.499
58f3746a-476d-4480-9b36-29fa6ab67681	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	product_updated	product	c7a8dd61-af92-46e6-989c-10204958f5cb	\N	\N	\N	{}	2026-07-02 07:12:24.713
0fc73de4-b17e-4a38-9df1-b9c573c3c4ff	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	inventory_updated	inventory	de4563fa-bfe9-45ef-9a75-5867b17c6b57	\N	\N	\N	{"cost": 0, "icon": "drink", "name": "Ays tea", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "4780101732340", "quantity": 10, "product_id": "c7a8dd61-af92-46e6-989c-10204958f5cb", "after_quantity": 10, "before_quantity": 10}	2026-07-02 07:12:26.833
03a6a85c-5dc9-487a-b8bc-4bd2521dcaa6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	tariff_updated	tariff	38401fb5-44df-4594-b645-6e94b746274f	\N	\N	\N	{}	2026-07-02 08:40:47.61
2a5eeb2f-baca-46b2-a0c2-4b1ce53404c7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	payment_created	payment	bf77150f-4b97-463c-adca-cfdc221faa7f	\N	af2d8df2-f42d-4f37-b43c-9e8a5ab99d9f	50000.000000000000000000000000000000	{"method": "cash", "card_amount": 0, "cash_amount": 50000, "change_amount": 0, "balance_amount": 0, "received_amount": null}	2026-07-05 17:18:42.879
986e84e5-4b94-4d02-91c2-2b86023adf08	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	stop_session	session	0ce60b37-ec04-4e46-b763-4289ca6f721a	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	0ce60b37-ec04-4e46-b763-4289ca6f721a	0.000000000000000000000000000000	{}	2026-06-11 14:03:37.955
45565e40-333d-42f0-8527-5db3d525ec77	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 14:03:38.608
0e102707-1d5d-431b-bea2-ad6466483f6a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	stop_session	session	ac9dfcb3-a4ad-443a-84d7-493644c9fa93	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	ac9dfcb3-a4ad-443a-84d7-493644c9fa93	0.000000000000000000000000000000	{}	2026-06-11 14:04:24.522
5cf38d7c-62ff-4e6f-a638-995149eaa119	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 14:04:25.411
e4240c67-df53-4e5d-b6bc-f84925101667	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 14:05:15.993
e6910b55-d4b1-4854-99c7-d168d9631af7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	stop_session	session	4801c96e-5483-4c87-bbdb-2381b2720961	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	4801c96e-5483-4c87-bbdb-2381b2720961	0.000000000000000000000000000000	{}	2026-06-11 14:05:22.124
5e2f92ff-9b3c-4af6-9cc9-10dc719c3f10	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 14:05:24.253
75f73451-7e82-4385-8103-0a2ca548ece6	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 14:17:10.347
b85983c8-01f4-4c9c-8502-1017849a05e2	eb31d71a-6ede-496d-9851-542b42b8e2f9	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	login	user	67005460-527d-4723-915f-8ff20067e42d	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 14:21:41.808
f9f858db-0f3e-4f4e-b0bc-54f515583075	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 14:39:22.113
593386b7-30bb-4eaa-b524-3eeeed797a02	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	shift_opened	shift	115db3e8-ab49-4837-9243-4a8bffbc6b9d	\N	\N	0.000000000000000000000000000000	{"shift_type": "Kunduzgi (09:00 - 18:00)", "starting_cash": 200000}	2026-06-11 14:42:49.351
743bb2ad-f75f-4ebc-8988-f5d4ade14e57	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	shift_opened	shift	004710fa-fca5-45de-97fb-2c64b279b09c	\N	\N	0.000000000000000000000000000000	{"shift_type": "Kunduzgi (09:00 - 18:00)", "starting_cash": 20000}	2026-06-11 14:44:41.876
8011e3c4-5847-4d5d-946d-c0bb75e4a20e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	shift_opened	shift	84940a39-e0e1-4dca-a696-95402807dab6	\N	\N	0.000000000000000000000000000000	{"shift_type": "Kunduzgi (09:00 - 18:00)", "starting_cash": 10000}	2026-06-11 14:54:19.333
37e98e93-48ca-4335-81e4-1d29c34b6eff	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-11 15:14:22.687
9cf288f5-8950-4036-9c4a-fca842194b90	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-11 15:14:26.78
1060077a-d53d-4d34-bedb-9ab7d1b75ca1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_created	product	8c4dfff7-f020-47b8-b228-0c1432e6a96f	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 15:15:19.865
25a7dfc7-1336-4800-9187-14004db29d65	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_inventory_created	product	8c4dfff7-f020-47b8-b228-0c1432e6a96f	\N	\N	0.000000000000000000000000000000	{"cost": 6000, "icon": "snack", "name": "ABC", "price": 9000, "barcode": "4607065000868", "category": "Ichimliklar", "stock_after": 20}	2026-06-11 15:15:19.953
1378b1ae-f181-4184-ab70-41a5de9475d1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	shift_closed	shift	84940a39-e0e1-4dca-a696-95402807dab6	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 15:17:04.74
b3b74059-f10f-473f-8258-76c833015dc8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	70e7f8e9-aa5e-4611-be5a-0a2d1030e68b	\N	\N	\N	{}	2026-07-01 18:54:13.787
32624b3c-0b55-4f05-9a70-25fed3b79e65	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	851635d0-1c10-4a79-a443-82ea8f7a71c5	\N	\N	\N	{"cost": 6000, "icon": "snack", "name": "Coca-Cola 0.5", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "4780069000130", "quantity": 24, "product_id": "70e7f8e9-aa5e-4611-be5a-0a2d1030e68b", "after_quantity": 24, "before_quantity": 48}	2026-07-01 18:54:14.788
5127deec-56f2-4449-9312-b215053a680d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	70e7f8e9-aa5e-4611-be5a-0a2d1030e68b	\N	\N	\N	{"barcode": "4780069000130"}	2026-07-01 18:54:18.327
6eb57cf5-0740-4cc2-bafd-da33021c817e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	f540f44e-9244-4f00-8184-afcdd580cc5f	\N	\N	\N	{}	2026-07-01 22:41:48.164
7b65837a-0fe7-4314-bdfa-6d94825fa09e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	56587cf0-a18b-4a6f-946c-d6e4d48bad39	\N	\N	\N	{"cost": 0, "icon": "snack", "name": "Шурданак M", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "4780102760144", "quantity": 4, "product_id": "f540f44e-9244-4f00-8184-afcdd580cc5f", "after_quantity": 4, "before_quantity": 4}	2026-07-01 22:41:49.029
1c2ace92-d6ee-43b8-aa5e-f0153b521679	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	c7a8dd61-af92-46e6-989c-10204958f5cb	\N	\N	\N	{}	2026-07-01 23:31:48.974
f3bbb9b8-3619-46c4-81c6-c1dfe8df8403	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	c7a8dd61-af92-46e6-989c-10204958f5cb	\N	\N	\N	{"cost": 0, "icon": "drink", "name": "Ays tea", "price": 10000, "barcode": "4780101732340", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 23:31:49.133
ebb9f549-b769-440f-8507-de3df944df4f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	c7a8dd61-af92-46e6-989c-10204958f5cb	\N	\N	\N	{"barcode": "4780101732340"}	2026-07-01 23:31:55.572
284adeba-ce5f-4f5c-af32-9d4fbd0963c1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	c7a8dd61-af92-46e6-989c-10204958f5cb	\N	\N	\N	{"barcode": "4780101732340"}	2026-07-01 23:31:55.838
e45d1677-b242-4081-95bf-e9b5cff3120d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	c7a8dd61-af92-46e6-989c-10204958f5cb	\N	\N	\N	{"barcode": "4780101732340"}	2026-07-01 23:31:56.524
9e88b8f7-ac69-4ab5-a04e-0135821d4e65	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	c7a8dd61-af92-46e6-989c-10204958f5cb	\N	\N	\N	{"barcode": "4780101732340"}	2026-07-01 23:31:56.723
9a1dc7e0-101c-47c7-a93d-5d62d1e20a8f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-11 15:18:56.844
01a6886e-6329-430c-a7a4-fa09a4d063d6	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_deleted	product	5384e0c0-1630-48cb-99c4-da396559f5dc	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 15:19:46.591
57d9a6a7-5cd4-4a7f-805d-b52d6903b2fa	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_deleted	product	37e42e81-2b80-43b4-8ad4-9de1327c91e3	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 15:19:47.275
3acc8b35-f777-49d2-9b5d-b55f4dd4bdd8	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_deleted	product	8c4dfff7-f020-47b8-b228-0c1432e6a96f	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 15:19:53.716
fa2e000a-1d3e-4e24-8e4f-fabf10a18e84	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_created	product	9e5cd792-2919-407f-963d-1e088654f9e6	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 15:20:44.292
df73bb20-d733-483e-abad-03f7c3737593	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_inventory_created	product	9e5cd792-2919-407f-963d-1e088654f9e6	\N	\N	0.000000000000000000000000000000	{"cost": 10000, "icon": "candy", "name": "M&M's", "price": 15000, "barcode": "4607065000868", "category": "Snack", "stock_after": 7}	2026-06-11 15:20:44.38
288cb39c-ac33-4e31-8e2e-4cf4dea077c6	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_deleted	product	07fef28a-f6f4-42ba-a26c-f23f6176a9d3	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 15:20:50.298
a219509e-de67-4acb-abd4-ced615263910	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_deleted	product	1d3178da-38ca-4660-9f27-ec30dcd75239	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 15:20:51.115
f5e00f63-28cb-409f-8ee8-3a5b8fa18e66	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_deleted	product	393cd93f-4b0c-49a9-a040-2c9f5024179f	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 15:20:52.846
fc6bdd8e-b670-414d-84fe-af40f561025a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_deleted	product	7063cda0-36d5-49bc-8f5f-6c4c0c0594c4	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 15:20:53.639
88974418-8c01-4264-8182-303936544284	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_deleted	product	89f8f31b-c725-4d9b-9e7c-eb546be23570	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 15:20:54.903
49059e8a-7aac-4967-ad0f-b8ca34fe1969	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_deleted	product	f171db85-4db0-4b65-950e-53dc3852890c	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 15:20:55.961
07943c4a-739c-4b60-8725-79563b2ea54b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	9e5cd792-2919-407f-963d-1e088654f9e6	\N	\N	0.000000000000000000000000000000	{"barcode": "4607065000868"}	2026-06-11 15:21:10.003
ec79ffda-ec1c-4991-91d1-077363de6abe	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	9e5cd792-2919-407f-963d-1e088654f9e6	\N	\N	0.000000000000000000000000000000	{"barcode": "4607065000868"}	2026-06-11 15:21:14.086
7a120bd7-c0c6-426a-8814-e66d9a6d34b0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_created	product	7e30b780-f60c-424a-a184-4fef11a44306	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 15:22:40.868
8499d9f4-d65f-4e01-9f7c-de0a65e70c89	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_inventory_created	product	7e30b780-f60c-424a-a184-4fef11a44306	\N	\N	0.000000000000000000000000000000	{"cost": 8000, "icon": "bread", "name": "Qurt", "price": 10000, "barcode": "4780102760304", "category": "Snack", "stock_after": 16}	2026-06-11 15:22:40.953
05b748e5-55c5-454e-95ec-0e4eff29a4cb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	9e5cd792-2919-407f-963d-1e088654f9e6	\N	\N	0.000000000000000000000000000000	{"barcode": "4607065000868"}	2026-06-11 15:23:00.702
f195658a-e6f0-416b-bcff-79de479a5f53	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	7e30b780-f60c-424a-a184-4fef11a44306	\N	\N	0.000000000000000000000000000000	{"barcode": "4780102760304"}	2026-06-11 15:23:04.186
2c09ce97-5872-4275-8450-8f71ded4b20e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-11 15:25:13.288
465e21ef-a34e-4f0f-ae22-573d7a2885d6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-11 15:25:14.558
1209ccee-c47c-400a-a0d0-8378331b3acf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	c7a8dd61-af92-46e6-989c-10204958f5cb	\N	\N	\N	{"barcode": "4780101732340"}	2026-07-01 23:31:56.984
8b1a6ead-6156-4504-9e6a-67fa58e39578	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	tariff_updated	tariff	38401fb5-44df-4594-b645-6e94b746274f	\N	\N	\N	{}	2026-07-02 08:41:00.612
d42fe3b1-1673-4ce3-bc81-56e2b949bf6a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	c812bae3-196e-4130-a847-8284d058f11a	4fb435c0-0277-404e-be64-adbd714b9f46	c812bae3-196e-4130-a847-8284d058f11a	\N	{"source": "system", "expired": true}	2026-07-05 19:37:07.234
88c52499-4fbe-4ff6-a67b-e6dfd0d68f61	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	541f408d-e9b0-43eb-ae9c-22c0d0351143	9eae5376-edb1-4ebd-be59-1940bf83e7b6	541f408d-e9b0-43eb-ae9c-22c0d0351143	\N	{"source": "system", "expired": true}	2026-07-05 19:37:07.772
634a4377-0da4-48b6-9cf9-7b0428d89075	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	88317b37-2700-4234-9a86-81af041b63bf	36685d3d-ff4a-4c91-86a3-11962fa0a45d	88317b37-2700-4234-9a86-81af041b63bf	\N	{"source": "system", "expired": true}	2026-07-05 19:37:08.277
ccd7b46c-5f8a-4b16-9ebd-baac539fc254	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	b9f9dd7b-e7ef-4e8a-bc86-b4d098dfb6ad	7b32e26f-38b4-46db-a026-41b7b19ca136	b9f9dd7b-e7ef-4e8a-bc86-b4d098dfb6ad	\N	{"source": "system", "expired": true}	2026-07-05 19:37:08.784
253ef280-4fe6-40a1-9398-78459d3a9d42	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	23a26ba2-ffa9-4f5b-8d77-4b6f8531b1fb	f124efe3-f0cc-4116-8984-b2d1bae6885b	23a26ba2-ffa9-4f5b-8d77-4b6f8531b1fb	\N	{"source": "system", "expired": true}	2026-07-05 19:37:09.351
d08f7b94-1c42-45e4-b10a-735d06131357	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	7de98944-8531-4695-a872-8b7f5e480d88	1b7395de-87f0-46f0-996e-6d62617e0922	7de98944-8531-4695-a872-8b7f5e480d88	\N	{"source": "system", "expired": true}	2026-07-05 19:37:09.873
513b9f3d-c70f-40a6-8c80-cae4b1ae9ca9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	f540f44e-9244-4f00-8184-afcdd580cc5f	\N	\N	\N	{}	2026-07-01 18:55:51.652
931977cf-6ce2-4ac6-ad39-edeb5dec1717	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	56587cf0-a18b-4a6f-946c-d6e4d48bad39	\N	\N	\N	{"cost": 0, "icon": "snack", "name": "Шурданак M", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "4780102760144", "quantity": 5, "product_id": "f540f44e-9244-4f00-8184-afcdd580cc5f", "after_quantity": 5, "before_quantity": 5}	2026-07-01 18:55:52.646
3c550341-fd98-4e52-ada2-02e415edabb9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	bb889a9a-f2a0-4c2f-84c8-d03a026f5f2c	\N	\N	\N	{"barcode": "4780102760328"}	2026-07-01 22:42:32.473
fff4e556-a12e-4d3e-8dfb-b1a9ba53a003	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	c242a797-938f-4f49-9b4f-e2b8952a04a3	\N	\N	\N	{}	2026-07-01 23:32:30.182
46d147e1-c08e-4c07-b7ca-1b6f22aecfbc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	c242a797-938f-4f49-9b4f-e2b8952a04a3	\N	\N	\N	{"cost": 0, "icon": "drink", "name": "Sprite", "price": 10000, "barcode": "4780069000215", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 23:32:30.335
f88676fd-38ae-4ea1-998d-be4680dc46c8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	c242a797-938f-4f49-9b4f-e2b8952a04a3	\N	\N	\N	{"barcode": "4780069000215"}	2026-07-01 23:32:35.954
e7e66de0-6bd3-4bdf-8739-020906acd4b2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	c242a797-938f-4f49-9b4f-e2b8952a04a3	\N	\N	\N	{"barcode": "4780069000215"}	2026-07-01 23:32:36.431
f70aac29-0fb3-4217-a682-266098bd0c83	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	c242a797-938f-4f49-9b4f-e2b8952a04a3	\N	\N	\N	{"barcode": "4780069000215"}	2026-07-01 23:32:36.677
5b2bfc0f-2fa1-4c51-9cd4-9538d2cea641	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	c242a797-938f-4f49-9b4f-e2b8952a04a3	\N	\N	\N	{"barcode": "4780069000215"}	2026-07-01 23:32:37.282
a43c0919-8036-4f35-a880-573d7a993a26	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	c242a797-938f-4f49-9b4f-e2b8952a04a3	\N	\N	\N	{"barcode": "4780069000215"}	2026-07-01 23:32:37.586
d543a1c6-38ff-47d5-af89-a827aadad765	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	start_session	session	b692f45d-1902-4172-9a73-6ca58f9a5a39	2b3ec612-bcaf-462a-9d08-969347cf0151	b692f45d-1902-4172-9a73-6ca58f9a5a39	200000.000000000000000000000000000000	{}	2026-07-02 08:41:48.691
8b1757c8-f99f-4350-abae-89b47075821a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	6267a112-d5c1-4e3c-97df-42bc1da8d3e3	13f06790-c478-4e8e-8344-c1aa91b3e72f	6267a112-d5c1-4e3c-97df-42bc1da8d3e3	\N	{}	2026-07-05 21:59:35.138
263fb128-897b-4217-b309-1007daa02512	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_updated	product	9e5cd792-2919-407f-963d-1e088654f9e6	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 07:43:28.992
0b8bfa1e-bfa8-495e-974a-989fdbaaf194	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	inventory_updated	inventory	dcfe2b01-fb95-4521-b789-222057acf84c	\N	\N	0.000000000000000000000000000000	{"cost": 10000, "icon": "candy", "name": "M&M's", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "4607065000868", "quantity": 5, "product_id": "9e5cd792-2919-407f-963d-1e088654f9e6", "after_quantity": 5, "before_quantity": 0}	2026-06-12 07:43:30.982
2bb501af-48d0-42e1-9c14-9bcc56400988	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 07:53:53.062
7258627b-1d85-4ea7-a14b-c93ac5604c6e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	login	user	67005460-527d-4723-915f-8ff20067e42d	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 07:54:16.131
519e553d-068f-400d-bdf4-afeac0b89578	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	shift_opened	shift	816f18dc-3598-41e4-ac94-c0da90ecff6e	\N	\N	0.000000000000000000000000000000	{"shift_type": "Kunduzgi (09:00 - 18:00)", "starting_cash": 95000}	2026-06-12 07:55:01.988
37c42839-120d-4fa5-b5cf-29c8ebd4e5fd	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 07:56:50.521
66c29f00-132f-4d42-ba27-ba2f35013e5c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	login	user	67005460-527d-4723-915f-8ff20067e42d	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 08:46:46.416
9d4d69e4-8f35-4dad-ac6d-6035edf95e48	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	shift_opened	shift	0291fff4-2edb-4f1b-acd7-b1144ebeb11e	\N	\N	0.000000000000000000000000000000	{"shift_type": "Kunduzgi (09:00 - 18:00)", "starting_cash": 95000}	2026-06-12 08:48:01.65
4e164a6b-f37a-4747-bcb9-ded15f390f4e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	146fcbc5-9c48-4c10-a943-fd397bc1af49	Main Admin	admin	login	user	146fcbc5-9c48-4c10-a943-fd397bc1af49	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 09:34:30.895
35ceefa0-5949-4f75-be93-063bb65fc63b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 09:35:40.126
58112479-f52e-4170-82af-3cbe4c3f71f3	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 09:46:08.338
a11e919a-40a5-4b08-8fe5-0685a5327324	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	booking_cancelled	booking	7eb62747-2756-4c74-a168-0cb12797a699	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 09:46:30.24
1527c8fb-180e-4fcf-88ad-a27ddd1291a0	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 11:38:32.563
ad622b45-1b62-46ac-b986-2274a01bc6ab	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 11:44:54.569
a4441be9-4fb9-4790-89ad-1f117ad7617e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 11:45:53.726
d24912e7-2134-4e50-88bd-ed90ecc4d147	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	user_created	user	78319166-7e2e-4bec-a1f7-9c9103556f29	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 11:45:55.75
9973fb22-1b0e-4a74-8d2d-e166b20ea992	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_assignments_set	user	78319166-7e2e-4bec-a1f7-9c9103556f29	\N	\N	0.000000000000000000000000000000	{"count": 1}	2026-06-12 11:45:57.864
2d386a25-e45e-4185-9f67-0adff3fe72e2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	78319166-7e2e-4bec-a1f7-9c9103556f29	Test Admin	admin	login	user	78319166-7e2e-4bec-a1f7-9c9103556f29	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 11:45:58.431
94af6764-6400-47b2-be82-988d9aaec26f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	user_deleted	user	78319166-7e2e-4bec-a1f7-9c9103556f29	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 11:46:01.133
356ea0b2-07ad-404c-a476-eb9422c27879	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	146fcbc5-9c48-4c10-a943-fd397bc1af49	Main Admin	admin	login	user	146fcbc5-9c48-4c10-a943-fd397bc1af49	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:04:29.472
015c3bbb-5490-4aa3-9b99-f987af5a94cb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	f540f44e-9244-4f00-8184-afcdd580cc5f	\N	\N	\N	{"barcode": "4780102760144"}	2026-07-01 18:56:04.887
625507b5-9f89-4e02-9b58-2e97d3ba6b22	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	bb889a9a-f2a0-4c2f-84c8-d03a026f5f2c	\N	\N	\N	{"barcode": "4780102760328"}	2026-07-01 22:42:46.068
fe194275-bf76-4c68-bb4e-6e0796e012e0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a1d6a446-3e0c-4a20-951e-50c7b1b34fa4	\N	\N	\N	{"barcode": "4780102760304"}	2026-07-01 22:42:54.905
c19b6a38-d6e0-4d84-a0e5-d59927774836	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	578cd664-747b-4ea0-aa1e-fde12edec97b	\N	\N	\N	{}	2026-07-01 23:33:29.329
b9422795-a5d9-457a-a4ae-2040ba4d2626	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	578cd664-747b-4ea0-aa1e-fde12edec97b	\N	\N	\N	{"cost": 0, "icon": "drink", "name": "Fanta 0,5", "price": 10000, "barcode": "4780069000178", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 23:33:29.487
e275109c-49cd-46f8-99eb-b17b2d9824fe	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	578cd664-747b-4ea0-aa1e-fde12edec97b	\N	\N	\N	{"barcode": "4780069000178"}	2026-07-01 23:33:36.207
77f7cb5f-2686-47cc-9382-569d0dd2ccd3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	578cd664-747b-4ea0-aa1e-fde12edec97b	\N	\N	\N	{"barcode": "4780069000178"}	2026-07-01 23:33:36.525
8f5f90c3-decb-4b89-8684-0d3cd8657c13	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	578cd664-747b-4ea0-aa1e-fde12edec97b	\N	\N	\N	{"barcode": "4780069000178"}	2026-07-01 23:33:36.803
92106c75-18f4-4c3d-8bd9-f1d1c5616478	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	578cd664-747b-4ea0-aa1e-fde12edec97b	\N	\N	\N	{"barcode": "4780069000178"}	2026-07-01 23:33:37.605
88901f1c-afcf-43a2-bd67-3e7656a1aa82	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	578cd664-747b-4ea0-aa1e-fde12edec97b	\N	\N	\N	{"barcode": "4780069000178"}	2026-07-01 23:33:37.928
a8bfef1b-98c4-4cfb-a2ae-ad2ff40a8a5e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	578cd664-747b-4ea0-aa1e-fde12edec97b	\N	\N	\N	{"barcode": "4780069000178"}	2026-07-01 23:33:38.225
05fcf625-3eb3-43e1-8838-807adaf5bfaa	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	578cd664-747b-4ea0-aa1e-fde12edec97b	\N	\N	\N	{"barcode": "4780069000178"}	2026-07-01 23:33:38.416
fe954643-2ce9-4079-ac0e-a6a040fc46c1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	stop_session	session	b692f45d-1902-4172-9a73-6ca58f9a5a39	2b3ec612-bcaf-462a-9d08-969347cf0151	b692f45d-1902-4172-9a73-6ca58f9a5a39	\N	{}	2026-07-02 08:42:07.362
fa0bb140-f356-41f6-8ee4-5bb15a99aadf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	\N	{"rig_id": "Rig-1"}	2026-07-02 08:42:08.356
d3c036d6-6e50-41dd-b0bf-0333ba3cccfa	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	\N	{}	2026-07-07 15:08:05.754
981af8bb-fa1c-4c0d-8d51-c23324ef8d57	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	66c6f72a-2ef1-4ab9-b818-c7edd78457ad	\N	\N	\N	{}	2026-07-01 18:57:34.165
ae1f82c2-d7d6-4cc3-8776-0739694cc13d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	acfb40b5-6e27-4a1b-ba4c-aa032c69c4c7	\N	\N	\N	{}	2026-07-01 22:44:21.36
098ed7c2-6f3b-4aca-8a4e-d5d92fa4aac3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	acfb40b5-6e27-4a1b-ba4c-aa032c69c4c7	\N	\N	\N	{"cost": 15000, "icon": "energy", "name": "Redbull kichik", "price": 22000, "barcode": "90415258", "category": "Ichimliklar", "stock_after": 20}	2026-07-01 22:44:21.516
6bbf613f-b6ab-4f97-9348-cabeed74e987	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_stock_updated	product	acfb40b5-6e27-4a1b-ba4c-aa032c69c4c7	\N	\N	\N	{"cost": 15000, "icon": "energy", "name": "Redbull kichik", "price": 22000, "barcode": "90415258", "category": "Ichimliklar", "stock_after": 20, "stock_before": 20}	2026-07-01 22:44:22.489
efbf6d20-7966-4c54-a986-fcc82ada5160	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	acfb40b5-6e27-4a1b-ba4c-aa032c69c4c7	\N	\N	\N	{"barcode": "90415258"}	2026-07-01 22:44:28.06
3b4b960e-5eaa-42a1-9f6c-8e9938011900	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	acfb40b5-6e27-4a1b-ba4c-aa032c69c4c7	\N	\N	\N	{"barcode": "90415258"}	2026-07-01 22:44:28.817
864ae11e-5fac-4667-874c-890001383745	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	775d3fb8-0729-4175-8aab-091f396192c1	\N	\N	\N	{}	2026-07-01 23:34:22.978
a370e940-3af5-49a1-82d4-1aa3bffa358d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	775d3fb8-0729-4175-8aab-091f396192c1	\N	\N	\N	{"cost": 0, "icon": "drink", "name": "V Bez gaz 0.5", "price": 5000, "barcode": "4780136570016", "category": "Ichimliklar", "stock_after": 15}	2026-07-01 23:34:23.086
ca9c2821-3cc5-4019-8b02-d08a4993683d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	775d3fb8-0729-4175-8aab-091f396192c1	\N	\N	\N	{"barcode": "4780136570016"}	2026-07-01 23:34:30.375
5045d55d-e963-4188-8bac-7be9008582e3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	775d3fb8-0729-4175-8aab-091f396192c1	\N	\N	\N	{"barcode": "4780136570016"}	2026-07-01 23:34:30.776
e921c8c2-08d9-43fe-a028-5d99030e46c9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	775d3fb8-0729-4175-8aab-091f396192c1	\N	\N	\N	{"barcode": "4780136570016"}	2026-07-01 23:34:31.025
6b7b512d-26b3-402a-8509-5a583d0696b6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	775d3fb8-0729-4175-8aab-091f396192c1	\N	\N	\N	{"barcode": "4780136570016"}	2026-07-01 23:34:31.542
502d5ac2-ff31-4208-9aaa-e877be7329fd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	775d3fb8-0729-4175-8aab-091f396192c1	\N	\N	\N	{"barcode": "4780136570016"}	2026-07-01 23:34:31.911
0c06a2d0-af48-4654-82e9-a48d883dd55f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	775d3fb8-0729-4175-8aab-091f396192c1	\N	\N	\N	{"barcode": "4780136570016"}	2026-07-01 23:34:32.188
b94e428e-2511-4e0c-8056-1eade0bec3c1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	775d3fb8-0729-4175-8aab-091f396192c1	\N	\N	\N	{"barcode": "4780136570016"}	2026-07-01 23:34:32.4
e45207b8-3d9d-46c7-ab1f-6a8891e08441	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	775d3fb8-0729-4175-8aab-091f396192c1	\N	\N	\N	{"barcode": "4780136570016"}	2026-07-01 23:34:32.653
86b8a7a5-35a3-4b40-822e-e8b61a693482	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	775d3fb8-0729-4175-8aab-091f396192c1	\N	\N	\N	{"barcode": "4780136570016"}	2026-07-01 23:34:32.844
862cff1e-43e3-4d0f-aa09-f8a73491491d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	775d3fb8-0729-4175-8aab-091f396192c1	\N	\N	\N	{"barcode": "4780136570016"}	2026-07-01 23:34:33.018
47facf75-9068-4315-aa3f-c644fef60a02	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	start_session	session	f9349071-83ca-4400-bd6e-bad12c611cd0	2b3ec612-bcaf-462a-9d08-969347cf0151	f9349071-83ca-4400-bd6e-bad12c611cd0	200000.000000000000000000000000000000	{}	2026-07-02 08:42:40.583
b6160101-3c04-4f27-8652-f91af4a4e8d2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	f540f44e-9244-4f00-8184-afcdd580cc5f	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "Шурданак M", "price": 0, "barcode": "4780102760304460706500086862211340127124607065001445478010276011347801478010276013747801027601444780102760120027601994780102760137", "category": "Ichimliklar", "stock_after": 5}	2026-06-12 15:21:44.443
b0d64974-f41f-45f9-b960-5fcc55fcb4dc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	58ca5e9c-0755-4373-83be-6ec4dbd85ffe	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:22:39.007
433531fd-0833-4641-8f4a-4e4b12eb1310	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	5cd0fdb9-451d-4c5a-b32d-80585cf46eb9	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:25:44.437
21b3e03c-7b9e-4701-a41b-b9edbb28d148	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	stop_session	session	f9349071-83ca-4400-bd6e-bad12c611cd0	2b3ec612-bcaf-462a-9d08-969347cf0151	f9349071-83ca-4400-bd6e-bad12c611cd0	\N	{}	2026-07-02 08:42:49.294
32b2bc2c-7234-4058-a79d-c52eab67e66b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	\N	{"rig_id": "Rig-1"}	2026-07-02 08:42:51.281
2ccae91f-d071-471e-99bc-66ee45d4770d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	withdrawal_requested	cash_withdrawal	b417353d-1dd7-4966-bf1e-34af2c84f77c	\N	\N	10000.000000000000000000000000000000	{"initiator_role": "admin"}	2026-07-07 15:08:30.614
579b2df8-bc7f-439c-877c-4e1bf8f412b3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	cc59e684-4a6b-42cf-9a27-2d1f84755135	\N	\N	\N	{}	2026-07-01 18:58:03.617
33e8a9fc-e8d7-420e-b9ba-e98b1db12346	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	67def552-1383-4378-bb8f-17666e1ff39f	\N	\N	\N	{"cost": 6500, "icon": "cake", "name": "Snickers", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "4607065001445", "quantity": 15, "product_id": "cc59e684-4a6b-42cf-9a27-2d1f84755135", "after_quantity": 15, "before_quantity": 44}	2026-07-01 18:58:04.576
c7e9f321-87e5-4f94-be61-89bfa48afaf0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	cc59e684-4a6b-42cf-9a27-2d1f84755135	\N	\N	\N	{}	2026-07-01 18:58:13.324
47187cd2-00f1-4ec0-852b-bfaf13faef35	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	67def552-1383-4378-bb8f-17666e1ff39f	\N	\N	\N	{"cost": 6500, "icon": "candy", "name": "Snickers", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "4607065001445", "quantity": 15, "product_id": "cc59e684-4a6b-42cf-9a27-2d1f84755135", "after_quantity": 15, "before_quantity": 15}	2026-07-01 18:58:14.49
2e0882ca-c515-465f-a001-2f86cf606864	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	7d8f12ab-9034-45c3-8735-b0ee46ce172c	\N	\N	\N	{}	2026-07-01 22:46:03.011
d0d51676-e76b-42a9-8ec2-7411b02814f3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	7d8f12ab-9034-45c3-8735-b0ee46ce172c	\N	\N	\N	{"cost": 0, "icon": "snack", "name": "Fistashki kichik", "price": 15000, "barcode": "4780102760137", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 22:46:03.164
5ae2bded-b486-46a0-bbc6-d021c4540472	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	7d8f12ab-9034-45c3-8735-b0ee46ce172c	\N	\N	\N	{"barcode": "4780102760137"}	2026-07-01 22:46:12.127
e826bd8f-2e4a-4d0a-861f-f7797c6c88f1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	47b6ac8c-8343-4a42-9d96-cb8d2dc85e32	\N	\N	\N	{}	2026-07-01 23:34:58.426
f496a35c-77f5-41b4-8466-023aae211d10	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	47b6ac8c-8343-4a42-9d96-cb8d2dc85e32	\N	\N	\N	{"cost": 0, "icon": "drink", "name": "H Bez gaz", "price": 5000, "barcode": "4780012960153", "category": "Ichimliklar", "stock_after": 15}	2026-07-01 23:34:58.531
edd104cd-3e3d-45ad-bb26-14431f950c44	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	47b6ac8c-8343-4a42-9d96-cb8d2dc85e32	\N	\N	\N	{"barcode": "4780012960153"}	2026-07-01 23:35:04.636
5e7ad6ba-b871-483b-ad32-60c0a3f20c43	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	\N	{"rig_id": "Rig-1"}	2026-07-02 08:42:52.703
768eb028-fca1-42f7-a8b0-2ef33571a4ed	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	withdrawal_requested	cash_withdrawal	c8e84125-85c7-4ecf-876c-453889ba231e	\N	\N	10000.000000000000000000000000000000	{"initiator_role": "admin"}	2026-07-07 15:08:45.573
26c2b034-81ed-4109-b589-89c5b9d3f707	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	1b76fc7b-1e64-48bb-9a0e-b446a4a43e95	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:34:25.838
e82cde2a-c682-4e1e-b3e1-d3a7fa0963b5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	1b76fc7b-1e64-48bb-9a0e-b446a4a43e95	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "chicken", "name": "Grenki kichik", "price": 0, "barcode": "4780137640299", "category": "Ichimliklar", "stock_after": 11}	2026-06-12 15:34:25.932
6c5a3291-d1de-4a30-a41c-94327ea365f3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	a8d7a5f3-b978-4d4e-93e0-897fb590eaac	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:34:50.741
fa8884ff-ce7d-4b8b-9208-b791bc50b056	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	0cc1edd1-c65d-4332-9484-9555b5ea4b0e	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:35:43.437
c3cf368d-5c06-4b13-b46c-77a5f6f2e117	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	cc59e684-4a6b-42cf-9a27-2d1f84755135	\N	\N	\N	{"barcode": "4607065001445"}	2026-07-01 18:58:32.541
4b2b9db6-4ec8-4cdf-a782-1978ee3a0cb9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	24219e09-0e40-42ad-bada-6faf4a48aca5	\N	\N	\N	{}	2026-07-01 22:46:49.023
2fd9497d-4758-4a79-bdab-4dc688a89a29	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	24219e09-0e40-42ad-bada-6faf4a48aca5	\N	\N	\N	{"cost": 0, "icon": "snack", "name": "Mindal kichik", "price": 15000, "barcode": "4780102760120", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 22:46:49.175
9d686c22-ebc8-49ee-bd9b-e2e2335f47ca	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	24219e09-0e40-42ad-bada-6faf4a48aca5	\N	\N	\N	{"barcode": "4780102760120"}	2026-07-01 22:46:57.961
0f0671ee-9a74-4160-a1b4-a4d35b811423	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	47b6ac8c-8343-4a42-9d96-cb8d2dc85e32	\N	\N	\N	{"barcode": "4780012960153"}	2026-07-01 23:35:42.022
5d2330e6-1f54-4f53-9db3-331cf02fa9b8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	47b6ac8c-8343-4a42-9d96-cb8d2dc85e32	\N	\N	\N	{"barcode": "4780012960153"}	2026-07-01 23:35:43.045
ccb1225a-722c-4b92-bfce-0a4e480bfe9f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	\N	{}	2026-07-02 08:49:50.824
713606fe-b6b5-4370-b6ef-157fd79fc41f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	withdrawal_rejected	cash_withdrawal	c8e84125-85c7-4ecf-876c-453889ba231e	\N	\N	10000.000000000000000000000000000000	{}	2026-07-07 15:11:10.522
19558db1-f77a-48d7-90ae-6cfd9a0591e5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	withdrawal_rejected	cash_withdrawal	b417353d-1dd7-4966-bf1e-34af2c84f77c	\N	\N	10000.000000000000000000000000000000	{}	2026-07-07 15:11:15.383
4cd82218-59e4-4024-bcaf-a5793caf57a6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	d487c106-4b5e-4e84-9f9b-569f94896892	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "cookie", "name": "MEGA CHIPS", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "47801027603044607065000868622113401271246070650014454780102760113478014780102760137478010276014448102790004294780102760120027601994780102760137", "quantity": 12, "product_id": "58ca5e9c-0755-4373-83be-6ec4dbd85ffe", "after_quantity": 12, "before_quantity": 12}	2026-06-12 15:43:44.376
1a52ff41-6079-4521-9a19-96e5ac4175b5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	a61aac7a-fd11-4e7f-a448-6cdbd282f1d8	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:44:02.361
22204b23-2bb9-4549-a6fb-94e1e2eb4e82	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	e0d79f70-c7cb-4ae2-9e3b-09a3f991ff8f	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "Qurt Vakum", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "478010276030446070650008686221134012712460706500144547801027601134780102760199", "quantity": 2, "product_id": "a61aac7a-fd11-4e7f-a448-6cdbd282f1d8", "after_quantity": 2, "before_quantity": 2}	2026-06-12 15:44:03.663
cef61dc1-5bc1-4135-893c-65e197056891	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	sale_created	sale	1067e9c0-d8ce-4d5e-95df-bd6a3223bd71	\N	\N	35000.000000000000000000000000000000	{"items": [{"name": "Coca-Cola 0.5", "barcode": "4780069000130", "quantity": 1, "product_id": "70e7f8e9-aa5e-4611-be5a-0a2d1030e68b", "unit_price": 10000, "total_price": 10000}, {"name": "Шурданак M", "barcode": "4780102760144", "quantity": 1, "product_id": "f540f44e-9244-4f00-8184-afcdd580cc5f", "unit_price": 15000, "total_price": 15000}, {"name": "Snickers", "barcode": "4607065001445", "quantity": 1, "product_id": "cc59e684-4a6b-42cf-9a27-2d1f84755135", "unit_price": 10000, "total_price": 10000}], "profit": 22500, "discount": 0, "subtotal": 35000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-07-01 19:00:56.828
05925cfe-27a7-4ad2-a453-ae07745fb3a1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	payment_created	sale	1067e9c0-d8ce-4d5e-95df-bd6a3223bd71	\N	\N	35000.000000000000000000000000000000	{"items": [{"name": "Coca-Cola 0.5", "barcode": "4780069000130", "quantity": 1, "product_id": "70e7f8e9-aa5e-4611-be5a-0a2d1030e68b", "unit_price": 10000, "total_price": 10000}, {"name": "Шурданак M", "barcode": "4780102760144", "quantity": 1, "product_id": "f540f44e-9244-4f00-8184-afcdd580cc5f", "unit_price": 15000, "total_price": 15000}, {"name": "Snickers", "barcode": "4607065001445", "quantity": 1, "product_id": "cc59e684-4a6b-42cf-9a27-2d1f84755135", "unit_price": 10000, "total_price": 10000}], "method": "card", "payment_id": "13cf9eca-7033-47be-a8d5-6b7436ee400c", "card_amount": 35000, "cash_amount": 0, "customer_id": null, "balance_after": null, "change_amount": 0, "customer_type": "guest", "balance_amount": 0, "balance_before": null, "received_amount": null}	2026-07-01 19:00:58.587
29af7521-6f29-4cb1-8bd1-636ea07ae7e8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	bb986954-5cca-41bc-82aa-8821c8faa139	\N	\N	\N	{}	2026-07-01 22:47:40.508
016b9006-0e5e-41b8-abd7-45d4ed6b640e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	bb986954-5cca-41bc-82aa-8821c8faa139	\N	\N	\N	{"cost": 0, "icon": "snack", "name": "Keshyu kichik", "price": 15000, "barcode": "4780102760113", "category": "Ichimliklar", "stock_after": 10000}	2026-07-01 22:47:40.613
374d4e3f-b7ac-43ef-9593-c22d9a96a9b6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_stock_updated	product	bb986954-5cca-41bc-82aa-8821c8faa139	\N	\N	\N	{"cost": 0, "icon": "snack", "name": "Keshyu kichik", "price": 15000, "barcode": "4780102760113", "category": "Ichimliklar", "stock_after": 10000, "stock_before": 10000}	2026-07-01 22:47:41.329
6760c420-d838-4e8c-8dc3-5308c06f4e07	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	dd4c1fc7-15cd-4f0c-96af-c81faf8668e1	\N	\N	\N	{}	2026-07-01 23:37:26.013
6c1dea33-5263-4f4c-a5c7-c71e73203648	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	dd4c1fc7-15cd-4f0c-96af-c81faf8668e1	\N	\N	\N	{"cost": 0, "icon": "cookie", "name": "Flin katta Shashlik", "price": 15000, "barcode": "4780137640152", "category": "Snack", "stock_after": 10}	2026-07-01 23:37:26.164
4fbba0fc-ab97-4915-93be-06d51f0e8598	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	dd4c1fc7-15cd-4f0c-96af-c81faf8668e1	\N	\N	\N	{"barcode": "4780137640152"}	2026-07-01 23:37:31.719
f77569a3-4e71-4b31-8157-8935138112e8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	dd4c1fc7-15cd-4f0c-96af-c81faf8668e1	\N	\N	\N	{"barcode": "4780137640152"}	2026-07-01 23:37:32.686
97c57433-0056-4942-b0ec-9dda93471657	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	dd4c1fc7-15cd-4f0c-96af-c81faf8668e1	\N	\N	\N	{"barcode": "4780137640152"}	2026-07-01 23:37:33.329
75403623-a028-4f73-bf5c-1fca739a7230	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	tariff_updated	tariff	38401fb5-44df-4594-b645-6e94b746274f	\N	\N	\N	{}	2026-07-02 08:56:37.08
14d1284c-bcc4-47f8-aacf-9301543f3966	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	withdrawal_requested	cash_withdrawal	6f523c8d-31ba-4b73-9be0-9e550d845cc3	\N	\N	5000.000000000000000000000000000000	{"initiator_role": "admin"}	2026-07-07 15:11:34.878
e0742d93-f832-4e94-af10-0576968fa473	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{}	2026-07-01 19:02:55.314
3128cdeb-7055-4135-8359-cdeeda59b7ab	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	52b2295f-6ed6-4596-9f8c-49b96a78974c	\N	\N	\N	{"cost": 0, "icon": "bottle", "name": "18+", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "4780101734269", "quantity": 10, "product_id": "ba62679b-176a-473c-81b0-1f156361df92", "after_quantity": 10, "before_quantity": 10}	2026-07-01 19:02:56.217
154d8748-a052-455e-8d4c-db9c164309c9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{"barcode": "4780101734269"}	2026-07-01 19:02:59.363
94b06abb-5627-420c-9008-5a1c7ae974e2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	bb986954-5cca-41bc-82aa-8821c8faa139	\N	\N	\N	{"barcode": "4780102760113"}	2026-07-01 22:48:01.518
8c3f9e58-8ebb-40f3-a6e9-6f9e21569829	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	72daa972-3cc5-42ba-b7e0-2c06682f5137	\N	\N	\N	{}	2026-07-01 23:38:19.011
bb6ce06e-fd59-4273-8d7b-0890dad632c4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	72daa972-3cc5-42ba-b7e0-2c06682f5137	\N	\N	\N	{"cost": 0, "icon": "cookie", "name": "Flint kichik crab", "price": 10000, "barcode": "4780137640022", "category": "Snack", "stock_after": 10}	2026-07-01 23:38:19.31
ec92585a-be61-4a1a-8042-9de03bf3090e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	72daa972-3cc5-42ba-b7e0-2c06682f5137	\N	\N	\N	{"barcode": "4780137640022"}	2026-07-01 23:38:25.111
e09301ad-1d60-451b-b605-f7a37752b2be	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	72daa972-3cc5-42ba-b7e0-2c06682f5137	\N	\N	\N	{"barcode": "4780137640022"}	2026-07-01 23:38:25.76
f033befa-2ccb-4ec7-bfdc-ed3537dd049d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	72daa972-3cc5-42ba-b7e0-2c06682f5137	\N	\N	\N	{"barcode": "4780137640022"}	2026-07-01 23:38:27.353
27ce1278-50ec-4bea-a315-36364213b2e0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	\N	{}	2026-07-04 08:05:37.367
7ca3f02c-2c0a-4231-811f-999cd9da587b	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	\N	{}	2026-07-07 15:11:52.893
e5e82064-f419-4716-9bd6-dcdfebbaca72	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	2d69091a-3f30-419f-89c9-23ad0651fd41	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "M&Ms", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "47801027603044607065000868", "quantity": 7, "product_id": "a447b302-fcc0-4a85-833f-f86236329fe4", "after_quantity": 7, "before_quantity": 7}	2026-06-12 15:43:54.471
dda03fc0-caa6-4443-aee5-e169d15beb9f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	payment_created	payment	599d1728-0da1-478f-bc10-756aac0aa92c	\N	43832062-345c-40b1-bcb3-4d64d5b5f4ea	80000.000000000000000000000000000000	{"method": "cash", "card_amount": 0, "cash_amount": 80000, "change_amount": 0, "balance_amount": 0, "received_amount": null}	2026-07-01 19:45:17.207
874af2e4-b921-43b4-9abe-68fc2c5ddea8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	f540f44e-9244-4f00-8184-afcdd580cc5f	\N	\N	\N	{"barcode": "4780102760144"}	2026-07-01 22:48:13.06
b9a19290-ac79-489c-ba7a-0cfe428e9fec	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	f540f44e-9244-4f00-8184-afcdd580cc5f	\N	\N	\N	{"barcode": "4780102760144"}	2026-07-01 22:48:15.194
604bcec8-2554-4d8c-81c7-87abf3534ace	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	16070d60-617d-4fc2-9bbd-7177460cf31b	\N	\N	\N	{}	2026-07-01 23:39:45.62
65bf22b7-9d73-48a9-8ba5-d5e4e9ca8037	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	16070d60-617d-4fc2-9bbd-7177460cf31b	\N	\N	\N	{"cost": 0, "icon": "cookie", "name": "Lay's kichik 37gr (luk)", "price": 10000, "barcode": "4690388116101", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 23:39:45.737
0e3dec3a-1dbd-4405-8adc-8a1ae369f56b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	16070d60-617d-4fc2-9bbd-7177460cf31b	\N	\N	\N	{"barcode": "4690388116101"}	2026-07-01 23:39:53.676
e3db6cfa-84db-4f7d-ab50-8e1cc0f0b6fd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	16070d60-617d-4fc2-9bbd-7177460cf31b	\N	\N	\N	{"barcode": "4690388116101"}	2026-07-01 23:39:54.329
5a29d597-7d2a-4af4-a19f-814601416332	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	16070d60-617d-4fc2-9bbd-7177460cf31b	\N	\N	\N	{"barcode": "4690388116101"}	2026-07-01 23:39:54.733
186404c8-941c-4160-94af-40d0e2cfdcdd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	16070d60-617d-4fc2-9bbd-7177460cf31b	\N	\N	\N	{"barcode": "4690388116101"}	2026-07-01 23:39:55.261
16cf81e9-cdb6-4f52-a853-d8bebb63d6e9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	shift_closed	shift	1d0dea0e-a911-49de-a5bb-d67707597bf1	\N	\N	400000.000000000000000000000000000000	{"bank": 0, "card": 0, "cash": 400000, "balance": 0, "expenses": 0, "recipient": "Owner", "difference": 0, "cash_expenses": 0, "cash_withdrawn": 0, "remaining_cash": 400000}	2026-07-04 08:05:49.502
ba350260-2197-4e79-9c7f-6eb6a3b01f9c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	withdrawal_rejected	cash_withdrawal	6f523c8d-31ba-4b73-9be0-9e550d845cc3	\N	\N	5000.000000000000000000000000000000	{}	2026-07-07 15:25:46.865
2727ea4b-e998-4888-af24-7b25c61dd38c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-12 17:08:13.641
6807f93f-1111-46b7-aed6-9018f961f1df	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-12 17:08:19.851
bc22d196-1116-4288-b144-701b822f1237	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	booking_no_show	booking	3b9bcf86-c14f-4c42-a6cd-dc1b0510faff	\N	\N	0.000000000000000000000000000000	{}	2026-06-15 06:27:13.694
66a47916-95b2-45ad-bd1d-658d3dd56bf8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	booking_created	booking	f06d28a9-d098-4701-adcc-5c2a7514ce20	\N	\N	0.000000000000000000000000000000	{}	2026-06-15 06:41:01.93
3a13ba1e-58d9-4ec5-9a6f-1cb3a1317d99	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	booking_arrived	booking	f06d28a9-d098-4701-adcc-5c2a7514ce20	\N	\N	0.000000000000000000000000000000	{}	2026-06-15 06:42:23.191
38b0752b-638b-45e0-a432-f74ee4fa2afd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	booking_created	booking	6529a4ae-3ce9-4f8c-9ef1-458317f8c218	\N	\N	0.000000000000000000000000000000	{}	2026-06-15 07:14:58.809
b9ad581c-8258-4653-a02a-ddb7976e14d8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	3779e8f6-05ae-4efa-a13d-09f4bfbf2e26	1b7395de-87f0-46f0-996e-6d62617e0922	3779e8f6-05ae-4efa-a13d-09f4bfbf2e26	40000.000000000000000000000000000000	{}	2026-07-01 20:56:05.401
9132109b-cb36-43d8-87fa-fde2fd6f2168	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	cc59e684-4a6b-42cf-9a27-2d1f84755135	\N	\N	\N	{"barcode": "4607065001445"}	2026-07-01 22:50:08.858
55f173cd-4ea8-46ae-9876-26e447cde02a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	58dd5df1-c231-479a-afa9-014019c543ea	\N	\N	\N	{}	2026-07-01 23:40:46.337
43a63d97-897d-48a2-b6ac-7e3dc656e7bb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	58dd5df1-c231-479a-afa9-014019c543ea	\N	\N	\N	{"cost": 0, "icon": "cookie", "name": "Lay's kichik 37gr (smetana)", "price": 10000, "barcode": "4690388116125", "category": "Snack", "stock_after": 10}	2026-07-01 23:40:46.495
71bb6ff5-847e-4119-aa29-fc7c9df3c9f9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	shift_opened	shift	17d4da99-d22d-4f8c-bd87-88841a733ede	\N	\N	\N	{"shift_type": "Tungi (19:00 - 03:00)", "starting_cash": 130000}	2026-07-05 15:01:28.401
9fc74406-6ab8-4fab-aa75-88ec31798e84	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	\N	{}	2026-07-07 15:27:06.413
cb9c3ca9-2df2-4d47-bfe2-a53b8f36cde2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	shift_opened	shift	034a8729-759f-4de4-b3ee-4184463bc4d3	\N	\N	0.000000000000000000000000000000	{"shift_type": "Kunduzgi (09:00 - 18:00)", "starting_cash": 175000}	2026-06-17 11:12:47.345
294081b2-4b6d-4565-9a0f-f39154e6933a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	booking_no_show	booking	0ba35763-037c-4839-801f-244e0098abf1	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 11:15:52.66
43dbf08f-fd98-474c-a223-b6dd0e5b1e9e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	booking_no_show	booking	0ba35763-037c-4839-801f-244e0098abf1	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 11:16:48.418
185cce1d-893f-492b-8804-aa7e0794c04e	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 11:17:40.949
376128f8-7f33-4254-8a75-8f476d16e9d7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 11:18:31.521
34384ccd-aac9-492b-955d-991b562afdf9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 11:32:06.968
3dac8895-9dfb-4c5b-b261-585997ba3e17	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 11:48:12.12
b779436a-012a-441a-81cc-e4bb3dd7df36	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 12:02:23.811
14365269-e713-4793-bd8f-d9e8b246f40f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	shift_opened	shift	6826f136-3104-45ff-af2b-fe1485091dcd	\N	\N	0.000000000000000000000000000000	{"shift_type": "Kunduzgi (10:00 - 19:00)", "starting_cash": 175000}	2026-06-17 12:03:52.216
95606082-c548-4c48-9c39-f2d15bb07c8d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	2236605a-1f99-48c5-b5f0-e6c17db02d4b	f124efe3-f0cc-4116-8984-b2d1bae6885b	2236605a-1f99-48c5-b5f0-e6c17db02d4b	40000.000000000000000000000000000000	{}	2026-07-01 20:56:17.679
cae8e98e-2320-4c27-bd8b-4bec2f30bed5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	cc59e684-4a6b-42cf-9a27-2d1f84755135	\N	\N	\N	{"barcode": "4607065001445"}	2026-07-01 22:50:09.139
1629264e-46c2-42a6-a4d0-ec50dcf2e3c3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	cc59e684-4a6b-42cf-9a27-2d1f84755135	\N	\N	\N	{"barcode": "4607065001445"}	2026-07-01 22:50:10.205
1b4e3a42-f79c-45e4-b87d-53070e10c78a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	58dd5df1-c231-479a-afa9-014019c543ea	\N	\N	\N	{"barcode": "4690388116125"}	2026-07-01 23:40:57.777
03c7daac-e090-4b55-848d-183fe5ea8fa4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	58dd5df1-c231-479a-afa9-014019c543ea	\N	\N	\N	{"barcode": "4690388116125"}	2026-07-01 23:40:58.016
e62da4cd-e38b-4065-8ad0-d86794038d4c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	58dd5df1-c231-479a-afa9-014019c543ea	\N	\N	\N	{"barcode": "4690388116125"}	2026-07-01 23:40:58.289
03d0d978-fa25-4786-8b9f-61729f03e096	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	39ba6975-8c2e-46bb-8eab-3d96f7bc1afd	\N	\N	\N	{"barcode": "4780069000130"}	2026-07-05 15:13:37.316
0eefe909-c47b-43af-b481-09278904e338	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	booking_no_show	booking	4f43fec8-3895-43d0-8bb6-c13fc99560fd	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 17:15:07.818
7e082c0d-5c3f-4e4a-9fda-0b44ebd4d158	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	booking_no_show	booking	4f43fec8-3895-43d0-8bb6-c13fc99560fd	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 17:15:42.164
83383235-c383-4467-8e3e-55da4817125c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 17:18:20.386
e8ce5d4b-6b63-4490-a2bf-cc6e2634e753	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	customer_created	customer	89eee425-4536-4af8-830b-3372bd950d90	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 17:19:30.42
aedd4c29-345a-470b-8f72-8ff334fea947	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	stop_session	session	8bd255d0-1d69-4684-b1f8-328dd0167dfc	7560ac62-9494-4ba7-95c8-23d3e3313943	8bd255d0-1d69-4684-b1f8-328dd0167dfc	0.000000000000000000000000000000	{}	2026-06-17 17:29:47.384
fed4e64a-07ec-4dba-9c89-6272743b78a6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 17:29:47.751
bdf034e1-72e8-4f5e-b443-67aeb5bbba31	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	repair_requested	repair_request	df0e1840-6eb5-4c3e-a2c6-4f54482d67c7	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{}	2026-06-17 17:30:17.54
c4816a1a-6c58-4776-b737-1c9b0574d2e9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_notified	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 17:30:43.484
05c9c34a-3e85-4295-8f1e-a0602a2a3b55	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	repair_more_details	repair_request	df0e1840-6eb5-4c3e-a2c6-4f54482d67c7	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{}	2026-06-17 17:31:07.722
d00388df-3de5-41ef-ae35-010afeb5f7f0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	repair_requested	repair_request	f8217399-1a7a-4bf8-bdf5-8ef1ad155135	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{}	2026-06-17 17:31:28.785
af085a00-b13e-40b0-aa7d-c28d8f2d36c3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	repair_approved	repair_request	f8217399-1a7a-4bf8-bdf5-8ef1ad155135	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{}	2026-06-17 17:31:36.754
928f7481-dfaf-4f67-82cc-e9c819848756	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	repair_requested	repair_request	93b24c1d-037f-40b3-bb26-ed69e74e500e	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{}	2026-06-17 17:32:10.265
ae43d7bb-abfd-4886-bd21-bc07a502ee9f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	repair_approved	repair_request	93b24c1d-037f-40b3-bb26-ed69e74e500e	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{}	2026-06-17 17:32:21.137
2720f525-0554-46ec-a614-1f3d8bbc2bb0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 17:33:11.522
22e0efa2-e88d-41b8-8840-5d66a4ad56ec	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 17:33:51.984
f85544cc-5db0-40c2-a0c5-5764b37749df	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 17:33:56.911
a3f0a255-7a8f-4244-90fd-ffd0e8af2e8b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 17:33:59.107
a9d21e55-74f7-47be-b02d-fcf9789f1913	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 17:34:15.983
aaad4af1-5f3d-40de-bf98-56ec046156f8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 17:34:22.493
a91eee94-2f2f-4945-8fc0-b0df2f42da5e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 17:34:28.773
9ed91fb5-be4d-4ffc-8e45-879cded64ad5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 17:34:57.411
2ac356c9-24f0-477f-8cb9-c332acec7d03	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 18:10:12.327
f1f4ddfc-30da-4506-b008-89423403d92e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	39ba6975-8c2e-46bb-8eab-3d96f7bc1afd	\N	\N	\N	{"barcode": "4780069000130"}	2026-07-05 15:13:37.883
71c3c4d1-543b-4ac6-bb37-5b80788a8655	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	withdrawal_requested	cash_withdrawal	a0a40756-33fd-48f2-ad64-570a03f04935	\N	\N	5000.000000000000000000000000000000	{"purpose": "admin_debt", "deduction_type": "salary_advance", "initiator_role": "admin"}	2026-07-07 15:41:30.221
7d33acaa-7df1-47f8-915d-6feeaa874254	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{"barcode": "4780101734269"}	2026-07-01 22:20:11.422
e7158762-e7c8-4796-948e-a5e91d0e5ea6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a447b302-fcc0-4a85-833f-f86236329fe4	\N	\N	\N	{"barcode": "4607065000868"}	2026-07-01 22:50:30.008
ee62e4b8-09d7-400f-9dcc-e7fdddca6e00	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a447b302-fcc0-4a85-833f-f86236329fe4	\N	\N	\N	{"barcode": "4607065000868"}	2026-07-01 22:50:31.78
c06a80b0-c0ec-47bf-9198-6b32a5e86411	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a447b302-fcc0-4a85-833f-f86236329fe4	\N	\N	\N	{"barcode": "4607065000868"}	2026-07-01 22:50:32.774
408ada94-a1ed-495d-a3fd-d6caed88d88e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	339d63d6-9619-46b0-a3e1-98b7d9ce5fbb	\N	\N	\N	{}	2026-07-01 23:42:12.873
72e276a4-cb72-4dd0-8053-2f3eed3d60cf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	339d63d6-9619-46b0-a3e1-98b7d9ce5fbb	\N	\N	\N	{"cost": 0, "icon": "cookie", "name": "Lay's kichik 37gr (sirniy)", "price": 10000, "barcode": "4690388116163", "category": "Snack", "stock_after": 10}	2026-07-01 23:42:13.037
50d8a4aa-edda-4197-acff-be93a082d17c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	339d63d6-9619-46b0-a3e1-98b7d9ce5fbb	\N	\N	\N	{"barcode": "4690388116163"}	2026-07-01 23:42:22.84
206c9fe3-414e-4218-a253-41aa15fb1061	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	339d63d6-9619-46b0-a3e1-98b7d9ce5fbb	\N	\N	\N	{"barcode": "4690388116163"}	2026-07-01 23:42:23.631
5a82222d-5352-4ee8-9ae5-53f0939b8f82	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	339d63d6-9619-46b0-a3e1-98b7d9ce5fbb	\N	\N	\N	{"barcode": "4690388116163"}	2026-07-01 23:42:24.164
95493b76-4589-4e7e-81e0-cd3fef72ce34	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	sale_created	sale	844fee3c-29d4-4607-84dc-b274bdc610ad	\N	\N	20000.000000000000000000000000000000	{"items": [{"name": "Coca coal 0,5", "barcode": "4780069000130", "quantity": 2, "product_id": "39ba6975-8c2e-46bb-8eab-3d96f7bc1afd", "unit_price": 10000, "total_price": 20000}], "profit": 20000, "discount": 0, "subtotal": 20000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-07-05 15:14:29.969
952f1c6d-40b8-4470-8a1c-77a081af4ebe	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	payment_created	sale	844fee3c-29d4-4607-84dc-b274bdc610ad	\N	\N	20000.000000000000000000000000000000	{"items": [{"name": "Coca coal 0,5", "barcode": "4780069000130", "quantity": 2, "product_id": "39ba6975-8c2e-46bb-8eab-3d96f7bc1afd", "unit_price": 10000, "total_price": 20000}], "method": "cash", "payment_id": "d9605559-30e9-4348-b68e-83c3f300c42d", "card_amount": 0, "cash_amount": 20000, "customer_id": null, "balance_after": null, "change_amount": 0, "customer_type": "guest", "balance_amount": 0, "balance_before": null, "received_amount": 20000}	2026-07-05 15:14:31.245
df9d102f-8ced-44c8-9acb-3810e9f772ea	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	\N	{}	2026-07-07 15:42:02.51
f74457f8-3528-4e82-a796-616b799c327e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:06:24.225
70e34228-03cb-48a2-a2fd-0c54227810bb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_notified	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:06:30.984
ecc35cc6-a40e-41dc-bce8-e997453834ff	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:07:10.364
e3ee1873-c03c-4ecc-bf6b-7efae17fcc74	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:07:43.475
811ed90f-f726-43bb-bd5e-d26b3f3fa29e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:07:53.065
40397e4a-224c-4167-92ff-e2008d8895bf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	e59f9b81-a33d-4887-b2ac-254daf515c1b	\N	\N	\N	{}	2026-07-01 22:21:32.777
6f42d578-94fa-4c36-a9ae-fba1d47f1a57	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	e59f9b81-a33d-4887-b2ac-254daf515c1b	\N	\N	\N	{"cost": 0, "icon": "energy", "name": "Flash katta", "price": 18000, "barcode": "4780068020047", "category": "Ichimliklar", "stock_after": 0}	2026-07-01 22:21:32.937
00f26cc2-5544-4f9e-94b3-cc69ed5ebebe	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	eb6792f0-ef4b-4774-9002-cb219c7ac8d9	\N	\N	\N	{}	2026-07-01 22:52:55.536
d1c971df-b6af-47d0-b5f4-5b50cee3ab01	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	eb6792f0-ef4b-4774-9002-cb219c7ac8d9	\N	\N	\N	{"cost": 0, "icon": "energy", "name": "Bfresh Mango", "price": 15000, "barcode": "4780072660239", "category": "Ichimliklar", "stock_after": 10000}	2026-07-01 22:52:55.69
b5509e5c-6448-4c0e-b58b-7baa21e0536a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	eb6792f0-ef4b-4774-9002-cb219c7ac8d9	\N	\N	\N	{"barcode": "4780072660239"}	2026-07-01 22:53:04.349
be2e1dee-f3d4-426c-a1dc-671cf56dfe9f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	eb6792f0-ef4b-4774-9002-cb219c7ac8d9	\N	\N	\N	{"barcode": "4780072660239"}	2026-07-01 22:53:05.442
67368a76-b35d-4dc6-b048-51fc3688dff9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	8f2c46bd-aeaa-4e5e-8d16-8b8356a56116	\N	\N	\N	{}	2026-07-01 23:43:08.664
47b95b1d-3558-4994-808a-b9b15c7e48c3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	8f2c46bd-aeaa-4e5e-8d16-8b8356a56116	\N	\N	\N	{"cost": 0, "icon": "cookie", "name": "Lay's kichik 37gr (crab)", "price": 10000, "barcode": "4690388116187", "category": "Snack", "stock_after": 10}	2026-07-01 23:43:08.821
00679e65-8963-479d-a2fc-0becd72f9990	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	8f2c46bd-aeaa-4e5e-8d16-8b8356a56116	\N	\N	\N	{"barcode": "4690388116187"}	2026-07-01 23:43:12.575
5f2b7e47-b291-41f1-b0d3-90c5a1794285	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	8f2c46bd-aeaa-4e5e-8d16-8b8356a56116	\N	\N	\N	{"barcode": "4690388116187"}	2026-07-01 23:43:12.781
3190e643-09f2-44ef-95f7-3226d211f0e2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	8f2c46bd-aeaa-4e5e-8d16-8b8356a56116	\N	\N	\N	{"barcode": "4690388116187"}	2026-07-01 23:43:13.045
ba1c583a-3b0e-4f21-8738-3550a345c2e3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	8f2c46bd-aeaa-4e5e-8d16-8b8356a56116	\N	\N	\N	{"barcode": "4690388116187"}	2026-07-01 23:43:13.259
2f0eed67-96f1-4938-af35-f3e656fc7205	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{"barcode": "4780101734269"}	2026-07-05 15:17:00.054
3e8f85cf-2a45-4df1-b16d-0ff99ef63e62	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	717e503a-2141-4d77-9243-453133378a61	\N	\N	\N	{"barcode": "4780068020023"}	2026-07-05 15:17:08.165
2c85886d-83a6-4363-9442-791c9e5c03de	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	withdrawal_confirmed	cash_withdrawal	a0a40756-33fd-48f2-ad64-570a03f04935	\N	\N	5000.000000000000000000000000000000	{"purpose": "admin_debt", "expense_id": null}	2026-07-07 15:42:24.831
57b19257-0435-4bbe-a8a5-fbbfa5e1cf24	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-19 07:23:36.045
6d6ecfaf-6aca-47e1-a631-9a628ad135b7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-19 07:24:26.949
57975871-293c-4453-b7dc-853cdb806178	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-23 06:02:08.919
fbcc41de-b06a-4091-b62c-bf734396b56b	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	0.000000000000000000000000000000	{}	2026-06-23 06:19:54.446
45395496-96c2-4a71-9429-d52dc6386ffb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-24 12:54:35.308
ce5b99ee-4a08-4b35-8a52-025268de429c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-25 07:23:26.697
9d9ac4ad-ee2b-4a06-85d3-bf00f0b64b97	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	0.000000000000000000000000000000	{}	2026-06-25 07:27:50.627
f6123ef0-1076-408e-978d-d139d80c7159	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-25 07:45:36.878
1bebccfc-379b-4289-b0e4-506af50462d4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	maintenance_opened	repair_request	b2c67977-44b0-48d3-8e6e-c265124f2c6d	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{}	2026-06-25 07:45:54.634
beb10b25-5188-43be-b8c4-8dd3c137de14	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	maintenance_opened	repair_request	b68e1d79-d003-4044-9743-a270bf38eba1	7560ac62-9494-4ba7-95c8-23d3e3313943	7faf187d-c634-4661-834a-fac80405cf0d	0.000000000000000000000000000000	{"opened_during_session": true}	2026-06-25 08:41:50.018
b5bb376d-5bc5-4132-9e47-b63edb154143	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	0.000000000000000000000000000000	{}	2026-06-25 13:40:07.793
360d3777-693b-4120-b174-b2b9e3ebd953	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	stop_session	session	fa334467-2bf7-4dd3-914b-58b2a7b4c7a7	7560ac62-9494-4ba7-95c8-23d3e3313943	fa334467-2bf7-4dd3-914b-58b2a7b4c7a7	0.000000000000000000000000000000	{}	2026-06-25 14:02:56.611
250b9d78-f434-4f94-bb16-a65737638d14	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-25 14:02:57.353
f5658537-9286-44f8-98c2-0dabc027db5c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	login	user	67005460-527d-4723-915f-8ff20067e42d	\N	\N	0.000000000000000000000000000000	{}	2026-06-25 14:03:13.691
b9f19984-e3e5-4507-9d4c-3ce96cb53153	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	stop_session	session	966ef5a2-ac1b-4197-ba91-76a4d00b4d9a	7560ac62-9494-4ba7-95c8-23d3e3313943	966ef5a2-ac1b-4197-ba91-76a4d00b4d9a	0.000000000000000000000000000000	{}	2026-06-25 14:06:07.621
b2bbcbd7-bd8c-4638-89ee-689cd9889d76	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-25 14:06:07.858
ce0efe1b-72c5-404b-853d-d4dff35c0a40	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-25 14:06:54.645
bfd8806c-593b-415d-9b06-87738fe0e271	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	customer_created	customer	46952282-8dd4-4e18-8254-4634637ebd1f	\N	\N	0.000000000000000000000000000000	{}	2026-06-25 14:11:00.455
568f6a41-fe79-4f53-b7f0-b36b9c6f8116	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-25 14:28:15.07
ddbdd95a-1b89-4925-b4c0-99bc122dd0d2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	e59f9b81-a33d-4887-b2ac-254daf515c1b	\N	\N	\N	{}	2026-07-01 22:22:25.616
133edf78-78ed-4a5d-8407-f01f12463428	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	9bacc2a0-4749-4cbf-9a5c-720ea3c4cc08	\N	\N	\N	{"cost": 0, "icon": "energy", "name": "Flash katta", "type": "adjustment", "price": 18000, "reason": "dashboard product update", "barcode": "4780068020047", "quantity": 10, "product_id": "e59f9b81-a33d-4887-b2ac-254daf515c1b", "after_quantity": 10, "before_quantity": 0}	2026-07-01 22:22:26.873
55f34888-92a7-4f8a-be8f-a45ac0b579cc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	e59f9b81-a33d-4887-b2ac-254daf515c1b	\N	\N	\N	{"barcode": "4780068020047"}	2026-07-01 22:22:31.78
b6cd7f27-b065-4f29-912e-6f9b7858a88d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	41a3b5bf-e4cb-42d4-b061-0558d3ddc93d	\N	\N	\N	{}	2026-07-01 22:54:06.7
4bb4446a-2285-4315-bf52-100b5935a434	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	41a3b5bf-e4cb-42d4-b061-0558d3ddc93d	\N	\N	\N	{"cost": 0, "icon": "energy", "name": "Bfresh Klubnika", "price": 15000, "barcode": "4780072660178", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 22:54:06.854
93e09124-9238-4f13-86d7-7d4662875771	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	41a3b5bf-e4cb-42d4-b061-0558d3ddc93d	\N	\N	\N	{"barcode": "4780072660178"}	2026-07-01 22:54:14.116
483c04a9-a9d9-40fd-b2c3-84ced954a628	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	41a3b5bf-e4cb-42d4-b061-0558d3ddc93d	\N	\N	\N	{"barcode": "4780072660178"}	2026-07-01 22:54:16.361
be514a42-1792-49db-9cde-19336f9146b3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	41a3b5bf-e4cb-42d4-b061-0558d3ddc93d	\N	\N	\N	{"barcode": "4780072660178"}	2026-07-01 22:54:21.295
2be6aba6-be31-4ba2-8754-a501e384435b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	41a3b5bf-e4cb-42d4-b061-0558d3ddc93d	\N	\N	\N	{"barcode": "4780072660178"}	2026-07-01 22:54:22.102
acab1548-e623-4193-8567-e543eb286c1a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	41a3b5bf-e4cb-42d4-b061-0558d3ddc93d	\N	\N	\N	{"barcode": "4780072660178"}	2026-07-01 22:54:22.792
31a16af3-533a-47b8-9ea6-165e3d5b88f1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	41a3b5bf-e4cb-42d4-b061-0558d3ddc93d	\N	\N	\N	{"barcode": "4780072660178"}	2026-07-01 22:54:23.497
4dd4fe7e-7a33-4284-9bd0-ec9777331ddb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	41a3b5bf-e4cb-42d4-b061-0558d3ddc93d	\N	\N	\N	{"barcode": "4780072660178"}	2026-07-01 22:54:23.811
50422aed-5cf6-4a5a-afc1-44d56c9844de	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	41a3b5bf-e4cb-42d4-b061-0558d3ddc93d	\N	\N	\N	{"barcode": "4780072660178"}	2026-07-01 22:54:24.767
33d5044e-4b7c-49a2-b118-2b0253942b9b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	41a3b5bf-e4cb-42d4-b061-0558d3ddc93d	\N	\N	\N	{"barcode": "4780072660178"}	2026-07-01 22:54:25.066
31d0b64f-2dbd-47a6-8bf8-7b6f8e3edc21	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	41a3b5bf-e4cb-42d4-b061-0558d3ddc93d	\N	\N	\N	{"barcode": "4780072660178"}	2026-07-01 22:54:25.801
b964cf62-25ba-4415-9eb0-ee9d30aac7c9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	a8e0178e-a428-4b02-939c-784ef65743db	\N	\N	\N	{}	2026-07-01 23:44:48.76
da077478-3c67-407c-9ba3-7c5a2fd59180	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	a8e0178e-a428-4b02-939c-784ef65743db	\N	\N	\N	{"cost": 0, "icon": "cookie", "name": "Flint kichik (kolbasniy)", "price": 10000, "barcode": "4780137640053", "category": "Snack", "stock_after": 10}	2026-07-01 23:44:48.924
822a0b3c-13bd-48e2-b8f7-9f799c234b15	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a8e0178e-a428-4b02-939c-784ef65743db	\N	\N	\N	{"barcode": "4780137640053"}	2026-07-01 23:44:56.343
e3a8e07c-5b30-4875-b3bb-a98afc6975e9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a8e0178e-a428-4b02-939c-784ef65743db	\N	\N	\N	{"barcode": "4780137640053"}	2026-07-01 23:44:56.9
5e30131f-9e9e-4969-b240-65312bbd219a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a8e0178e-a428-4b02-939c-784ef65743db	\N	\N	\N	{"barcode": "4780137640053"}	2026-07-01 23:44:57.686
d3b5e0ff-9b71-4e43-9c03-e971e7c70404	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	sale_created	sale	8f19acc8-5bd5-4a3d-a926-62d3a0f3b1ac	\N	\N	30000.000000000000000000000000000000	{"items": [{"name": "18+", "barcode": "4780101734269", "quantity": 1, "product_id": "ba62679b-176a-473c-81b0-1f156361df92", "unit_price": 15000, "total_price": 15000}, {"name": "Flash kichik", "barcode": "4780068020023", "quantity": 1, "product_id": "717e503a-2141-4d77-9243-453133378a61", "unit_price": 15000, "total_price": 15000}], "profit": 30000, "discount": 0, "subtotal": 30000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-07-05 15:18:08.011
4befe4a7-3df8-403b-84f9-d857a271e40e	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	\N	{}	2026-07-08 06:21:21.452
b9a4b307-848d-40cf-81e3-186fa83ad226	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 15:07:20.826
c91bf8c3-7743-446b-8372-e86e63941a46	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 15:08:31.156
8ca68667-385c-4ac4-8da0-e1c68bc06bf9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-25 15:10:46.056
55d5864f-d4e9-49ea-9d25-a8e41ee9e3bf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	maintenance_opened	repair_request	72e385b1-aae9-4187-b996-cfe7023c6c02	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{}	2026-06-25 15:11:04.29
ee647e7d-ff4f-4052-b809-43e7450f4214	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-25 15:12:09.51
99e3ed18-3094-445f-acc4-62537caeedc2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	maintenance_opened	repair_request	868785e8-765e-419e-a2d7-a12d61d3d373	c2a40555-3e9a-4a41-aa26-858577f1676f	\N	0.000000000000000000000000000000	{}	2026-06-25 15:12:18.798
678b4c1e-1272-446f-8679-f215aa50e7a9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	0ad39109-12db-422a-b7fd-b232f8ce8645	c2a40555-3e9a-4a41-aa26-858577f1676f	0ad39109-12db-422a-b7fd-b232f8ce8645	0.000000000000000000000000000000	{}	2026-06-25 15:13:48.449
5637ff65-350c-444c-925d-1aa46a1d9000	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-25 15:13:49.271
2822484c-b102-4d05-b61e-cce4fa448769	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	maintenance_opened	repair_request	e1340b0a-56c8-4b9b-a716-08a3773612f7	c2a40555-3e9a-4a41-aa26-858577f1676f	\N	0.000000000000000000000000000000	{}	2026-06-25 15:14:06.461
2617bdb9-ceaf-4110-875c-6c6a5e27d5ce	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	17a9ea03-8a9f-4f3f-be42-923625bd5bda	7560ac62-9494-4ba7-95c8-23d3e3313943	17a9ea03-8a9f-4f3f-be42-923625bd5bda	0.000000000000000000000000000000	{}	2026-06-25 15:27:15.413
58ec5f1f-2d8c-492d-b90c-82388abf278f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-25 15:52:46.807
c9eeb30b-9fd4-4df1-9824-71dec02dbb48	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	3e2c3880-6c39-4c2a-a3a1-010a186006ff	\N	\N	\N	{}	2026-07-01 22:24:35.787
ce6ac484-55d4-4716-90c5-c3364a2a3db5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	3e2c3880-6c39-4c2a-a3a1-010a186006ff	\N	\N	\N	{"cost": 0, "icon": "energy", "name": "Bfresh limon", "price": 15000, "barcode": "4780072660161", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 22:24:35.95
303291b9-7a19-46fb-b932-6f073dbad4b4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	38cf6445-2d6f-4ec1-9d1e-d30976aa503b	\N	\N	\N	{}	2026-07-01 22:57:55.257
e78dd882-fc17-4973-8aec-2b3bc24fab3f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	38cf6445-2d6f-4ec1-9d1e-d30976aa503b	\N	\N	\N	{"cost": 0, "icon": "energy", "name": "Moxito Katta", "price": 18000, "barcode": "4600068058058", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 22:57:55.426
fded2873-8dfc-4657-919c-77f304f1b7f2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_stock_updated	product	38cf6445-2d6f-4ec1-9d1e-d30976aa503b	\N	\N	\N	{"cost": 0, "icon": "energy", "name": "Moxito Katta", "price": 18000, "barcode": "4600068058058", "category": "Ichimliklar", "stock_after": 10, "stock_before": 10}	2026-07-01 22:57:56.263
2b7a1aab-b8e5-47c8-aaae-aa935bde0b87	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	30c68431-762c-4116-a9c2-8870ab5d3eed	\N	\N	\N	{}	2026-07-01 23:46:37.187
a144e4b1-465f-4d49-a163-1ef2597acf2e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	30c68431-762c-4116-a9c2-8870ab5d3eed	\N	\N	\N	{"cost": 0, "icon": "chicken", "name": "Flint kichik (kolbasniy grill)", "price": 10000, "barcode": "4870254130763", "category": "Snack", "stock_after": 10}	2026-07-01 23:46:37.293
86c8995e-b12d-432b-ad1c-c21dbd040cc1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	30c68431-762c-4116-a9c2-8870ab5d3eed	\N	\N	\N	{"barcode": "4870254130763"}	2026-07-01 23:46:41.591
028c726d-4294-4984-91cd-7e09298cc232	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	30c68431-762c-4116-a9c2-8870ab5d3eed	\N	\N	\N	{"barcode": "4870254130763"}	2026-07-01 23:46:42.205
bf27fbb0-4c15-4150-ac5a-b06f760736b4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	30c68431-762c-4116-a9c2-8870ab5d3eed	\N	\N	\N	{"barcode": "4870254130763"}	2026-07-01 23:46:42.625
551299b9-eec4-490c-942d-34b703c7d71b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	30c68431-762c-4116-a9c2-8870ab5d3eed	\N	\N	\N	{"barcode": "4870254130763"}	2026-07-01 23:46:44.276
516f3b3a-17df-4940-b907-ab4addb845c4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	payment_created	sale	8f19acc8-5bd5-4a3d-a926-62d3a0f3b1ac	\N	\N	30000.000000000000000000000000000000	{"items": [{"name": "18+", "barcode": "4780101734269", "quantity": 1, "product_id": "ba62679b-176a-473c-81b0-1f156361df92", "unit_price": 15000, "total_price": 15000}, {"name": "Flash kichik", "barcode": "4780068020023", "quantity": 1, "product_id": "717e503a-2141-4d77-9243-453133378a61", "unit_price": 15000, "total_price": 15000}], "method": "card", "payment_id": "af925c20-c782-4c96-9ab2-ee7924b8e7b9", "card_amount": 30000, "cash_amount": 0, "customer_id": null, "balance_after": null, "change_amount": 0, "customer_type": "guest", "balance_amount": 0, "balance_before": null, "received_amount": null}	2026-07-05 15:18:09.472
71fff218-386e-44ae-9c53-f982e60a4f57	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 22, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 23, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 21, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 16:04:08.469
624ad081-26f3-4c9b-89c5-d56072e7fb3d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	3e2c3880-6c39-4c2a-a3a1-010a186006ff	\N	\N	\N	{"barcode": "4780072660161"}	2026-07-01 22:24:57.026
2174afc7-b8e9-4210-b877-8c33a8018c8f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	3e2c3880-6c39-4c2a-a3a1-010a186006ff	\N	\N	\N	{"barcode": "4780072660161"}	2026-07-01 22:24:59.685
cada3cb7-ce39-4634-9766-1b9137213baf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	3e2c3880-6c39-4c2a-a3a1-010a186006ff	\N	\N	\N	{"barcode": "4780072660161"}	2026-07-01 22:25:01.667
740eebb0-7c3e-412b-8aee-e424256bc06d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	3e2c3880-6c39-4c2a-a3a1-010a186006ff	\N	\N	\N	{"barcode": "4780072660161"}	2026-07-01 22:25:02.748
1e180ec4-8c07-40fd-94ab-38ef61d83a52	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	3e2c3880-6c39-4c2a-a3a1-010a186006ff	\N	\N	\N	{"barcode": "4780072660161"}	2026-07-01 22:25:03.507
f8308aeb-de80-488e-80ed-fecf28a4e3e6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	3e2c3880-6c39-4c2a-a3a1-010a186006ff	\N	\N	\N	{"barcode": "4780072660161"}	2026-07-01 22:25:11.586
64aef801-082f-48b1-976a-887ff6b9bb22	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	38cf6445-2d6f-4ec1-9d1e-d30976aa503b	\N	\N	\N	{"barcode": "4600068058058"}	2026-07-01 22:58:45.365
05ee42c8-0f02-476d-84cb-4166be3a32ef	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	38cf6445-2d6f-4ec1-9d1e-d30976aa503b	\N	\N	\N	{"barcode": "4600068058058"}	2026-07-01 22:58:47.35
50b6d70e-6c3c-4e27-90ee-721e2d792959	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	38cf6445-2d6f-4ec1-9d1e-d30976aa503b	\N	\N	\N	{"barcode": "4600068058058"}	2026-07-01 22:58:48.34
eb2fdc48-0af6-4976-80c0-a42e7eaf8da8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	32576e86-47cb-4355-b6e9-6c6bb1e683f7	\N	\N	\N	{}	2026-07-01 23:47:59.333
6c46b643-bd1e-4697-b3b5-c4d1b96383ee	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	32576e86-47cb-4355-b6e9-6c6bb1e683f7	\N	\N	\N	{"cost": 0, "icon": "pizza", "name": "Lay's Katta 70gr (sirniy)", "price": 20000, "barcode": "4690388121044", "category": "Snack", "stock_after": 10}	2026-07-01 23:47:59.489
4c68094a-4d5e-47c4-b572-0fdf67d3e7e9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	32576e86-47cb-4355-b6e9-6c6bb1e683f7	\N	\N	\N	{"barcode": "4690388121044"}	2026-07-01 23:48:05.138
5c71a73b-0788-4bf9-bb3b-630fc164cd55	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	32576e86-47cb-4355-b6e9-6c6bb1e683f7	\N	\N	\N	{"barcode": "4690388121044"}	2026-07-01 23:48:05.42
87b7bf58-9f01-4d88-9f1c-748a70e29ef1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	32576e86-47cb-4355-b6e9-6c6bb1e683f7	\N	\N	\N	{"barcode": "4690388121044"}	2026-07-01 23:48:05.663
24cbb026-1dae-41e0-9941-257686f8a912	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	2a86cce4-e6d1-4cf1-adb9-b746eb0495ed	1b7395de-87f0-46f0-996e-6d62617e0922	2a86cce4-e6d1-4cf1-adb9-b746eb0495ed	50000.000000000000000000000000000000	{}	2026-07-05 15:18:38.072
d395fdea-534b-4b6b-87d5-f6669bbfd348	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	c1becbf1-7f0a-4be9-8063-8f91857b1057	f124efe3-f0cc-4116-8984-b2d1bae6885b	c1becbf1-7f0a-4be9-8063-8f91857b1057	50000.000000000000000000000000000000	{}	2026-07-05 15:18:47.485
98ffcc95-d58a-4f8c-9e34-2410bf7ed31b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:09.899
23f0883f-2ab5-4725-ae2d-98f3b30eeee7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:16.592
e663949c-09d8-46e4-8252-d9ef8760572c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:20.992
4cf580e4-5ac7-4057-ad9f-83af6bcbc810	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:21.291
af35b9fb-da13-49d8-922d-1e89fa9ee82b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:24.412
0826bf72-9294-40f5-8994-ed1fd97ff238	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:24.811
c3b9ddaa-7910-457e-a76b-6a906838c337	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:24.811
cd41ab92-b0b3-4c77-acc4-6254ad70e179	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:25.695
626c64dc-bca0-42a2-9bee-1d8ad744d805	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:28.795
523646e2-6e2c-40f4-8b5f-91a3e0141054	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:29.793
504116a9-ebe5-47d1-975c-de8250edcec1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:30.797
6103d9a8-ed7f-4ccb-a487-cf8d6e808a0c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:32.102
40993b5e-59f6-426c-8d85-bdc6afc65fc5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:34.694
accd6b16-ac5e-4280-9e7f-d138a67fa9b0	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:37.496
a7d35196-bb7b-4b92-9f22-ee56e68512e1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:37.593
7c74875f-6890-4a9d-afff-20f3e7e49262	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:38.093
1581c7af-8343-46a9-8598-7a4a68b3596b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	d6397ff6-c9fd-4d19-a463-fe2b2d40f469	\N	\N	\N	{}	2026-07-01 22:26:25.916
85931d3d-3b7e-47df-a959-a6469bdb0aac	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	39ba6975-8c2e-46bb-8eab-3d96f7bc1afd	\N	\N	\N	{}	2026-07-01 23:05:21.3
ae735d23-2956-422d-bf55-66de259319d4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	39ba6975-8c2e-46bb-8eab-3d96f7bc1afd	\N	\N	\N	{"cost": 0, "icon": "snack", "name": "Coca coal 0,5", "price": 10000, "barcode": "4780069000130", "category": "Ichimliklar", "stock_after": 20}	2026-07-01 23:05:21.46
65f6e063-e746-471f-aa5a-7f705b9b20bb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_stock_updated	product	39ba6975-8c2e-46bb-8eab-3d96f7bc1afd	\N	\N	\N	{"cost": 0, "icon": "snack", "name": "Coca coal 0,5", "price": 10000, "barcode": "4780069000130", "category": "Ichimliklar", "stock_after": 20, "stock_before": 20}	2026-07-01 23:05:22.058
39efcb4b-ec11-4f9f-914e-40681a29cebe	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	39ba6975-8c2e-46bb-8eab-3d96f7bc1afd	\N	\N	\N	{"barcode": "4780069000130"}	2026-07-01 23:05:27.687
45b4443b-40d8-4c22-b30a-8f7fc031d8fe	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	39ba6975-8c2e-46bb-8eab-3d96f7bc1afd	\N	\N	\N	{"barcode": "4780069000130"}	2026-07-01 23:05:29.129
c9abe4fe-452d-40e8-871f-ac3458ec941f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	39ba6975-8c2e-46bb-8eab-3d96f7bc1afd	\N	\N	\N	{"barcode": "4780069000130"}	2026-07-01 23:05:29.785
ac85911f-f855-4f3f-881d-94c72e3e4b24	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	39ba6975-8c2e-46bb-8eab-3d96f7bc1afd	\N	\N	\N	{"barcode": "4780069000130"}	2026-07-01 23:05:30.345
adcb02ad-c4db-4a2c-9252-6fb9ece8c3d0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	7a691efc-030a-49c6-9620-4fea2843cd22	\N	\N	\N	{}	2026-07-01 23:49:21.255
03e62d6c-4b55-4591-a127-6c4311cbdacc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	7a691efc-030a-49c6-9620-4fea2843cd22	\N	\N	\N	{"cost": 0, "icon": "chicken", "name": "Flint katta (Salyami)", "price": 15000, "barcode": "4780137640213", "category": "Snack", "stock_after": 10}	2026-07-01 23:49:21.413
f865b3a8-2dfc-4c09-a2ae-c01a7fbad3f7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	7a691efc-030a-49c6-9620-4fea2843cd22	\N	\N	\N	{"barcode": "4780137640213"}	2026-07-01 23:49:30.487
38e643b9-fd50-4a52-92f3-ab814d372ae0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	7a691efc-030a-49c6-9620-4fea2843cd22	\N	\N	\N	{"barcode": "4780137640213"}	2026-07-01 23:49:32.002
d9c348ef-2eb6-4e09-9ed2-b952f209d81e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	7a691efc-030a-49c6-9620-4fea2843cd22	\N	\N	\N	{"barcode": "4780137640213"}	2026-07-01 23:49:32.825
fc9c910e-8337-41a6-8610-e8a776627e63	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	7a691efc-030a-49c6-9620-4fea2843cd22	\N	\N	\N	{"barcode": "4780137640213"}	2026-07-01 23:49:33.36
244d6772-e19d-4d99-b76d-85d1173cda41	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	7a691efc-030a-49c6-9620-4fea2843cd22	\N	\N	\N	{"barcode": "4780137640213"}	2026-07-01 23:49:33.767
3b7116c9-5eff-4f31-bc67-7c93bf347b2c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	7a691efc-030a-49c6-9620-4fea2843cd22	\N	\N	\N	{"barcode": "4780137640213"}	2026-07-01 23:49:34.14
f3556e15-4e8b-493e-8d32-08ff46331865	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	7a691efc-030a-49c6-9620-4fea2843cd22	\N	\N	\N	{"barcode": "4780137640213"}	2026-07-01 23:49:34.537
de8daab9-ad67-4208-839a-7d2805c8e616	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	7a691efc-030a-49c6-9620-4fea2843cd22	\N	\N	\N	{"barcode": "4780137640213"}	2026-07-01 23:49:34.953
b8aedeaa-4a74-4f7c-80f8-f6df0734e75a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	d7c24a68-c2d4-4fa4-96ca-bcb48930cc7c	7b32e26f-38b4-46db-a026-41b7b19ca136	d7c24a68-c2d4-4fa4-96ca-bcb48930cc7c	50000.000000000000000000000000000000	{}	2026-07-05 15:19:07.657
855e2560-5c90-4ac9-9735-f7e9775e378b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	e7cca17f-9833-4f59-ac2e-e936bfc14119	36685d3d-ff4a-4c91-86a3-11962fa0a45d	e7cca17f-9833-4f59-ac2e-e936bfc14119	50000.000000000000000000000000000000	{}	2026-07-05 15:19:15.299
56d92c57-e1bd-42d2-b33c-da079fa3b428	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	stop_session	session	f9454b78-d27a-433c-84f2-454769698f50	3387c3f8-0bdc-4392-9a99-21f01f32793e	f9454b78-d27a-433c-84f2-454769698f50	0.000000000000000000000000000000	{}	2026-06-26 08:55:12.823
bfab1577-d8a2-48dc-bfcf-972aed8c034f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "vip-1"}	2026-06-26 08:55:13.372
1d34a335-3d9d-428a-9894-5283ac63dbb0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	70e7f8e9-aa5e-4611-be5a-0a2d1030e68b	\N	\N	\N	{}	2026-07-01 22:26:42.141
a354c8aa-4baf-47cc-af33-ca1e943245e2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	d3bd89f7-6c3a-495d-b236-ed0dc5bb65d4	\N	\N	\N	{}	2026-07-01 22:26:45.797
4ef635c7-7780-4419-846b-718384660a28	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	ce629280-202d-4251-81a4-c6771a15fa00	\N	\N	\N	{}	2026-07-01 23:05:58.345
0b7e90f5-9ba0-47b3-ae89-d3b1e8a31c4c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	ce629280-202d-4251-81a4-c6771a15fa00	\N	\N	\N	{"cost": 0, "icon": "energy", "name": "Saber", "price": 15000, "barcode": "4780072660215", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 23:05:58.505
2bf0046d-e0e8-44a5-b3fa-0c6d885a9a42	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_stock_updated	product	ce629280-202d-4251-81a4-c6771a15fa00	\N	\N	\N	{"cost": 0, "icon": "energy", "name": "Saber", "price": 15000, "barcode": "4780072660215", "category": "Ichimliklar", "stock_after": 10, "stock_before": 10}	2026-07-01 23:05:58.886
08de3ab9-53e9-4b3d-b435-320f3487274d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_stock_updated	product	ce629280-202d-4251-81a4-c6771a15fa00	\N	\N	\N	{"cost": 0, "icon": "energy", "name": "Saber", "price": 15000, "barcode": "4780072660215", "category": "Ichimliklar", "stock_after": 10, "stock_before": 10}	2026-07-01 23:05:59.149
c977f0a7-e589-4cfb-aded-ebdc0a891231	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ce629280-202d-4251-81a4-c6771a15fa00	\N	\N	\N	{"barcode": "4780072660215"}	2026-07-01 23:06:05.721
5004b8ff-f389-42ad-acc6-023379f91250	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ce629280-202d-4251-81a4-c6771a15fa00	\N	\N	\N	{"barcode": "4780072660215"}	2026-07-01 23:06:06.52
07dbeb1c-8e09-438a-aca0-6a2cc2f40ba5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ce629280-202d-4251-81a4-c6771a15fa00	\N	\N	\N	{"barcode": "4780072660215"}	2026-07-01 23:06:07.148
fd208a3c-400d-46c0-96b5-3e1cf964ef7b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ce629280-202d-4251-81a4-c6771a15fa00	\N	\N	\N	{"barcode": "4780072660215"}	2026-07-01 23:06:07.65
27a47aa7-ba36-46df-8a1b-fd9dc62b190b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	1c521c54-f6c8-4967-8d4b-b4e2b7bcdd73	\N	\N	\N	{}	2026-07-01 23:50:34.203
41dc2cc0-90b4-470f-8f03-89dcb8954606	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	1c521c54-f6c8-4967-8d4b-b4e2b7bcdd73	\N	\N	\N	{"cost": 0, "icon": "cookie", "name": "Grenki kichik (go'shtli)", "price": 10000, "barcode": "4780137640237", "category": "Snack", "stock_after": 10}	2026-07-01 23:50:34.357
2361d0ab-cb28-41f6-aa78-5df3c2ea74b8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	booking_created	booking	bbf3f811-9fd9-4dbc-8064-a902125944e4	\N	\N	\N	{}	2026-07-05 15:27:37.952
8a099a49-3e71-4f41-9e2f-9b6bbca7bdf9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	f9010df5-ed1a-4f02-868d-eb730eb868b8	\N	\N	\N	{}	2026-07-01 22:26:57.922
1e723d8a-c89a-4eac-9455-65a9b4a70a5a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	a438fe77-74a0-4a86-87c5-6de222ea6373	\N	\N	\N	{}	2026-07-01 22:27:07.371
d556308c-10fe-4343-a155-ad54af61f36f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	2d7ca282-2a5a-4033-ad5d-f8b52652e595	\N	\N	\N	{}	2026-07-01 22:27:11.628
3a58a663-926c-4c9c-b718-6b1ae8dad57e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	0298f745-84fd-44b7-b8f5-301f70a5d8a8	\N	\N	\N	{}	2026-07-01 22:27:15.231
e3bf218b-e2cd-4491-bc8c-0e77514f75e5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	e0fbe6c5-a1d3-421f-8d11-6b1fa67199c8	\N	\N	\N	{}	2026-07-01 22:27:21.325
bad0ae37-a0ea-40cf-a4f7-54039335cca0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	1b76fc7b-1e64-48bb-9a0e-b446a4a43e95	\N	\N	\N	{}	2026-07-01 22:27:24.536
befdbff8-9ce6-4206-80b8-136ef3db02d2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	717e503a-2141-4d77-9243-453133378a61	\N	\N	\N	{}	2026-07-01 23:13:32.614
53320f2d-6fdd-4c8c-a4f4-22272e947d70	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	717e503a-2141-4d77-9243-453133378a61	\N	\N	\N	{"cost": 0, "icon": "energy", "name": "Flash kichik", "price": 15000, "barcode": "4780068020023", "category": "Ichimliklar", "stock_after": 10}	2026-07-01 23:13:32.784
6b95d72c-81aa-4cf5-8b70-d9225f619561	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	1c521c54-f6c8-4967-8d4b-b4e2b7bcdd73	\N	\N	\N	{"barcode": "4780137640237"}	2026-07-01 23:50:48.36
f2a26804-fbe4-4fa9-94b7-e4d297a37fee	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	1c521c54-f6c8-4967-8d4b-b4e2b7bcdd73	\N	\N	\N	{"barcode": "4780137640237"}	2026-07-01 23:50:48.563
fb34eda5-9b33-40c9-9cb6-f6b992d08ed2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	1c521c54-f6c8-4967-8d4b-b4e2b7bcdd73	\N	\N	\N	{"barcode": "4780137640237"}	2026-07-01 23:50:48.961
c2c07b57-5684-49b4-a88c-6b4aab440ae0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	booking_no_show	booking	bbf3f811-9fd9-4dbc-8064-a902125944e4	\N	\N	\N	{}	2026-07-05 15:52:25.217
f59da535-5eec-4652-96d0-445ce5c2c748	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	a8d7a5f3-b978-4d4e-93e0-897fb590eaac	\N	\N	\N	{}	2026-07-01 22:27:36.539
e47e17e8-ae42-4f40-a23b-460107d8ed8b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	5b988a52-4c33-487c-afb5-6cbea9b943e8	\N	\N	\N	{}	2026-07-01 22:27:40.113
107ee96a-a8d7-40ed-ad13-95ba191111b1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	5cd0fdb9-451d-4c5a-b32d-80585cf46eb9	\N	\N	\N	{}	2026-07-01 22:27:46.698
7bb86283-62c1-4f6b-ba00-f8d7a6adb276	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	717e503a-2141-4d77-9243-453133378a61	\N	\N	\N	{"barcode": "4780068020023"}	2026-07-01 23:13:46.943
c6bd2c6a-823f-4b1d-83fe-32d1cdcfe498	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	717e503a-2141-4d77-9243-453133378a61	\N	\N	\N	{"barcode": "4780068020023"}	2026-07-01 23:13:47.181
3ad57dbd-c944-4a7b-aa03-49b2c7c17671	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	717e503a-2141-4d77-9243-453133378a61	\N	\N	\N	{"barcode": "4780068020023"}	2026-07-01 23:13:50.665
0c9aaf8d-d84f-4083-beef-a591510c8c58	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	e59f9b81-a33d-4887-b2ac-254daf515c1b	\N	\N	\N	{"barcode": "4780068020047"}	2026-07-01 23:14:00.584
1dc163c2-7788-4ecd-b5eb-1cfeb4de81af	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	e59f9b81-a33d-4887-b2ac-254daf515c1b	\N	\N	\N	{"barcode": "4780068020047"}	2026-07-01 23:14:09.466
d3803f88-0e4d-4dd1-a490-3ef5805757cc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	1c521c54-f6c8-4967-8d4b-b4e2b7bcdd73	\N	\N	\N	{"barcode": "4780137640237"}	2026-07-01 23:50:48.559
616ccc05-2112-4bba-b182-040a189de5dc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	541f408d-e9b0-43eb-ae9c-22c0d0351143	9eae5376-edb1-4ebd-be59-1940bf83e7b6	541f408d-e9b0-43eb-ae9c-22c0d0351143	100000.000000000000000000000000000000	{}	2026-07-05 15:56:07.834
c4339ecb-3771-420f-81b2-97f689d496fd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	f540f44e-9244-4f00-8184-afcdd580cc5f	\N	\N	\N	{"barcode": "4780102760144"}	2026-07-01 22:28:24.411
c12f885a-d0e3-4019-811c-4437555136a8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	9062379f-fbce-4452-aec1-42465710a42c	\N	\N	\N	{}	2026-07-01 23:15:22.514
d1416b5b-f757-4a21-aa37-edf3c162f2ec	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	9062379f-fbce-4452-aec1-42465710a42c	\N	\N	\N	{"cost": 0, "icon": "snack", "name": "Sushki kichik", "price": 12000, "barcode": "4780035860010", "category": "Snack", "stock_after": 0}	2026-07-01 23:15:22.669
fb200361-cebc-4b66-b954-95ee4ca8006a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	7a691efc-030a-49c6-9620-4fea2843cd22	\N	\N	\N	{}	2026-07-01 23:51:28.233
c42393c9-84e6-4829-be3c-728727a326f8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	5d53a966-06e7-4eab-b72f-0de5f14cff83	\N	\N	\N	{"cost": 0, "icon": "chicken", "name": "Grenki katta (Salyami)", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "4780137640213", "quantity": 10, "product_id": "7a691efc-030a-49c6-9620-4fea2843cd22", "after_quantity": 10, "before_quantity": 10}	2026-07-01 23:51:29.123
83d99c97-73e5-4c6e-a04e-db6c634107f0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	7a691efc-030a-49c6-9620-4fea2843cd22	\N	\N	\N	{"barcode": "4780137640213"}	2026-07-01 23:51:32.985
ee8c4b1e-ffaf-4960-92d1-8cfd13826bdb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	7a691efc-030a-49c6-9620-4fea2843cd22	\N	\N	\N	{"barcode": "4780137640213"}	2026-07-01 23:51:33.961
5dd4ad9b-957b-42a3-9375-c1c0a24fb2bf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	8fb0363b-1732-4709-9d78-833e5a634d70	13f06790-c478-4e8e-8344-c1aa91b3e72f	8fb0363b-1732-4709-9d78-833e5a634d70	100000.000000000000000000000000000000	{}	2026-07-05 15:56:27.495
21a0d475-be29-475f-8e9b-5e5ac0cb77fb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	0cc1edd1-c65d-4332-9484-9555b5ea4b0e	\N	\N	\N	{}	2026-07-01 22:28:52.348
a81e021c-70d3-491f-9fce-04d4a1068d83	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	f3759cbd-9e91-441f-ae59-9845e2e864d4	\N	\N	\N	{}	2026-07-01 22:28:59.735
45286c67-abbb-4640-a1cf-b72b436d731d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	58ca5e9c-0755-4373-83be-6ec4dbd85ffe	\N	\N	\N	{}	2026-07-01 22:29:07.383
f0cac7a7-c192-48c3-a8eb-498772499486	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	a2103180-05cc-42f0-9b18-d4f459709873	\N	\N	\N	{}	2026-07-01 22:29:16.419
f43d0162-6d65-456b-a279-18014583d51a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a447b302-fcc0-4a85-833f-f86236329fe4	\N	\N	\N	{"barcode": "4607065000868"}	2026-07-01 22:29:24.911
cc9bc185-9bdf-47e7-aedf-c29aaf4fb9c6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	9062379f-fbce-4452-aec1-42465710a42c	\N	\N	\N	{}	2026-07-01 23:15:57.847
45cc0431-7c25-4fe4-ab7b-973b6dae5db6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	916f6b69-1cc2-40d0-82d9-7d5288f95ac0	\N	\N	\N	{"cost": 0, "icon": "snack", "name": "Sushki kichik", "type": "adjustment", "price": 12000, "reason": "dashboard product update", "barcode": "4780035860010", "quantity": 5, "product_id": "9062379f-fbce-4452-aec1-42465710a42c", "after_quantity": 5, "before_quantity": 0}	2026-07-01 23:15:58.764
b719e9e9-5c28-458f-8fdc-c1b690c2d1a8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	9062379f-fbce-4452-aec1-42465710a42c	\N	\N	\N	{"barcode": "4780035860010"}	2026-07-01 23:16:06.022
720732ed-9130-4738-972e-ba2bd63e262e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	9062379f-fbce-4452-aec1-42465710a42c	\N	\N	\N	{"barcode": "4780035860010"}	2026-07-01 23:16:06.828
7a4ea5d4-9d34-49e6-ba13-4d0f07aaa163	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	9062379f-fbce-4452-aec1-42465710a42c	\N	\N	\N	{"barcode": "4780035860010"}	2026-07-01 23:16:07.529
5cc106d2-2af3-48d6-8886-6977f850724f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	9062379f-fbce-4452-aec1-42465710a42c	\N	\N	\N	{"barcode": "4780035860010"}	2026-07-01 23:16:08.42
08172e29-60c0-4ac8-9bdb-1ef276403857	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	9062379f-fbce-4452-aec1-42465710a42c	\N	\N	\N	{"barcode": "4780035860010"}	2026-07-01 23:16:09.232
04266c5a-0e63-4281-9085-227070f3e5a6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	30e4ca1e-89e8-414f-a5e4-6f41802d4855	\N	\N	\N	{}	2026-07-01 23:52:08.481
6845ddd7-fc0b-4125-bda6-bb553c171886	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	30e4ca1e-89e8-414f-a5e4-6f41802d4855	\N	\N	\N	{"cost": 0, "icon": "cookie", "name": "Grenki kichik (tomatnniy)", "price": 10000, "barcode": "4870254130466", "category": "Snack", "stock_after": 10}	2026-07-01 23:52:08.636
c2beb792-750c-452a-9f5a-e216720ee5de	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	30e4ca1e-89e8-414f-a5e4-6f41802d4855	\N	\N	\N	{"barcode": "4870254130466"}	2026-07-01 23:52:13.521
42d3c165-a021-4e73-a478-e81893ec50dc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	30e4ca1e-89e8-414f-a5e4-6f41802d4855	\N	\N	\N	{"barcode": "4870254130466"}	2026-07-01 23:52:23.228
4264bd7c-6c03-4624-9187-9816caf7b3f3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	30e4ca1e-89e8-414f-a5e4-6f41802d4855	\N	\N	\N	{"barcode": "4870254130466"}	2026-07-01 23:52:23.804
5a7aaff1-b2a3-42a4-819d-89a58b719e17	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	97a5ac70-0187-49dd-a127-ac16bcd9369e	Samarqand Admin	admin	login	user	97a5ac70-0187-49dd-a127-ac16bcd9369e	\N	\N	0.000000000000000000000000000000	{"seeded": true}	2026-06-08 13:00:41.554
682fcc33-6bcc-4f4e-82a3-1db12a3111b1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:40:05.635
04b51fa6-4eb7-4f6a-87f9-28ca674ec0c4	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:41:57.438
5321e2a6-860e-4ead-a0fb-62a4d25ec1c5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:04.036
2b780792-e88d-4050-bedc-15684b5d1bbc	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:04.734
eea57a7e-7393-483f-99a9-5b27e143095b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:04.734
bd101d89-db1c-44f5-96d7-287dccd63da7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:05.435
e331b32d-2a35-49ea-8200-df64fa239f12	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:10.134
5f3cd122-2cf1-4832-9c6a-14eea3b4d91a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:10.836
6aa179f9-c4ef-400d-8ffb-a7ad20a5e43e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:11.734
9040390a-7811-49da-8cfa-59a97d195f70	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:12.737
fe765c9e-87aa-4cdb-88c8-749bfe465f17	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:15.232
3f5fb400-0028-414a-ab13-9cf43f3c684e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:16.734
c0e24201-cb13-4489-a334-e20a65e31fa6	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:18.235
ed3db98c-cdd7-4328-ab90-2e301d04a70f	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:20.336
1cfd01f5-8b52-4900-8166-ddd8ff3fec79	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:21.738
d2c8eaa6-3112-455c-a068-5d60b308d60e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:23.032
0d6dd8b9-7b83-455d-9fd9-d49d2c9942a1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:25.035
07f88db9-d4b4-46a3-9d15-28224e2091a9	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:26.341
fcf09b9e-0467-478f-a187-1ef70b81d240	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:27.838
1d97601f-c27e-4595-bd7f-9aa766597f91	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:28.432
bf08f0ae-ad1b-4520-a41c-f275d55bc219	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:29.348
9fb29b6f-5186-4921-9959-c4c4d6cdbfeb	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:42:49.444
69b92f24-f718-4f6f-b707-cb87b5ee4057	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:43:17.144
a5d7d341-41bb-4a3c-9c81-c9183d998499	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:43:36.334
4b7356e5-5286-4427-a66b-361d97a8e868	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 15:43:57.139
417c7dca-6b57-4880-8f5f-053cf367e0ab	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-08 16:12:18.915
c6d9f27b-e8f8-4c3a-b654-091427e30614	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:09.592
3a92e2b5-df62-43a4-ad41-474efe96c4d4	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:09.794
b65edaa7-c5ad-4348-af66-136f3f95ee44	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	30e4ca1e-89e8-414f-a5e4-6f41802d4855	\N	\N	\N	{"barcode": "4870254130466"}	2026-07-01 23:52:24.324
ebdcbc12-deab-4abe-9023-cd0ecc2bceeb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	30e4ca1e-89e8-414f-a5e4-6f41802d4855	\N	\N	\N	{"barcode": "4870254130466"}	2026-07-01 23:52:30.686
3ced4ad3-2a99-4f68-af91-e17930a160a0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	c812bae3-196e-4130-a847-8284d058f11a	4fb435c0-0277-404e-be64-adbd714b9f46	c812bae3-196e-4130-a847-8284d058f11a	100000.000000000000000000000000000000	{}	2026-07-05 16:02:42.044
7d7b404b-bbe6-4a21-8d2d-67a32e6f49a2	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:39.592
e09da8c3-c714-4860-8a8b-13a2c86ddb7c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:16:40.693
b8bafedb-0fb0-4b04-a8f9-c82be995a4b3	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:24:41.703
f791513d-5137-4b76-a329-40b0c0923da4	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:18.492
4de7428d-487d-47fe-a617-5ff009d9c13c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:20.29
3cc1aa45-133a-461e-9461-c063e28c0f62	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:20.597
9efde2bf-8bfc-413a-9e86-1e9026162bcc	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:22.295
91c15110-6b20-4872-a2c1-0888bbfe4e3a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:25.111
af8a4631-c02a-4d60-951c-af6558590672	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:26.393
d32bcd5b-7e8f-4314-964b-17f63b4b5c95	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:26.693
8fd05963-d2e0-485c-819f-e7f8ea80faf1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:29.89
2a3c9ff1-5dad-48df-b01a-66c6fdd6d0aa	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:31.891
9ba6f7cd-5328-492e-ad97-f70a7bb33e36	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:32.294
11baad25-96b8-4b8c-af5f-87ca95d6c0b1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:34.59
57c39af2-7263-4694-bde4-378254411914	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:35.19
f2ae0359-04e3-4007-853f-f67fc424f5c6	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:38.291
b1621cac-a7aa-47c6-9750-57457a29df75	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:38.491
7caf6bba-6ef2-46f7-b2fc-7b834932e206	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:40.39
4ecbc6ca-6b5c-46a7-8d62-d7316c895b0a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:40.991
37c4b026-36a9-4354-9cae-b6487b1129a8	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:43.492
88395b81-8dfb-420d-b94c-e89e7805922a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:45.898
8cc2de66-ad71-4490-abc7-c91a06cf6fa2	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:46.194
ce2e6b87-ad89-4b34-b09a-7832711d5f38	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:48.293
66e55437-e347-43cc-b917-65b854b677ae	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:50.692
0b35c99d-da1c-4d9c-9784-fd0deae66553	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:52.195
6af78a0d-bc37-4502-bc53-177004cd218d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:52.594
45aa4cd5-db49-4506-bb45-c1842dfd5da3	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:53.499
96a5561a-c34c-45fa-9a4f-d022c299274a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:54
5f350c31-7140-445d-8264-566189c8ef77	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:33:57.405
ee773cf2-9849-4176-b1af-2e32d64c80b7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:43:18.508
897a9654-2501-41a7-bb9d-bccbf0d6a614	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:45:46.837
9df54827-4913-4c9b-8a1d-9e717c82f3a7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:45:46.86
1344fc99-06ca-4956-808f-e01c91b8ea46	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:45:46.928
4e7927c2-3f73-4351-8485-b59985086498	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:45:46.938
f04a6418-86c4-4e82-879c-b56da0a6e72a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:45:47.003
b4f80fe9-357c-4893-85ab-7a1d629c17a0	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:45:47.03
bf3a892f-9210-44b4-b01a-adb17337d534	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:45:49.703
4e1df02e-c2ac-480f-b866-449c585bbff9	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:45:55.955
2d68773c-759f-4e1a-a5a2-18de0b473af1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 06:52:54.606
8e9fed2e-ffac-46c6-a06a-06caa5764983	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:04:32.492
fa658999-84a2-4caa-9185-5bdd2d79f320	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:16:41.6
699788e1-e2ec-4baa-b345-81914ae70981	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:28:49.6
cc898a2e-cd70-4000-b88b-b5888f6f8955	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:35:15.705
101a84f5-6aba-4e9a-b438-6ce0472475d6	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:39:19.605
0c7baf24-d0f0-433b-a14b-f6e74498a65d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:49:51.393
f94bc91b-c856-4bbe-96d1-cc14ce6dedc6	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:49:52.595
eed36b9f-b50b-4d21-b0a0-c9a6ce7d4fd1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:49:53.491
27930a10-e1e3-450d-bd75-2ce43f6f23a0	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:49:53.494
207d49ee-6833-4f85-a79d-e944e5eed320	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:49:57.892
681f36cf-df63-4412-bf78-5de49e1173e9	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:49:58.594
a7e7bc74-3bbd-4afa-bfd5-570fdd44f4e3	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:49:59.292
1b9ae085-2adc-4140-bd42-b280d73d4dca	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:50:01.593
9c9dd26c-627a-4177-9a47-eb5072624e6d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:50:03.491
4838cd48-5759-43a1-a5a0-a391e7a864d5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:50:04.192
310f0910-41a9-4fab-bfb0-b25e211030b8	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:50:05.991
6b54ab65-59b9-4570-9760-8f8cbba0a4d5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:50:08.193
8f8e3bd5-4de4-4433-b986-dae893e3e3dd	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:50:09.493
83855743-79ff-4e88-a7c3-217eadcfca62	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:50:10.794
b469bb61-f68f-4af4-ac6c-71495415f424	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:50:10.893
1b7fa986-1995-4345-bf67-17046f1ae7d7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:50:11.503
55391a7c-7f87-4437-9d67-11c033d08da6	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 07:50:19.7
b81a6706-667e-48a5-b246-14c907de79da	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:12.502
d0596d9c-9a93-4940-8e30-7f099f42d1e2	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:20.898
454cad6b-4c48-4ad3-9b78-a9a14d28285d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:21.097
45c06713-db01-4d7b-a783-10c62f9cc815	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:21.796
9e2e2fc3-84d3-482b-936d-d52cabe209a8	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:23.297
2d22d44b-4549-4596-9a27-5f15f55009d2	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:26.798
953e7db5-6900-4b56-93dc-e8837044edcc	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:27.602
36940f2c-fa75-4cc5-b87f-2acf40688072	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:29.097
a39d3d66-044d-41a5-8616-b163e7b2522e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:29.502
5397a737-99f4-4a28-9c7d-37d1a0189a6a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:34.495
cb08af50-0ba5-4ac6-b4ce-c1dc5bf1356d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:35.495
22fb0c7a-42d0-48db-aee8-5a77cd7fdd6c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:35.695
18d14107-dda1-4e66-adc9-65ae319b6f33	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:36.098
94c0ebdc-0b59-4c16-b335-11faff6b54ef	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 09:53:40.8
da2d76f9-2954-4e1f-8eb6-ba7ac274123d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:10:37.844
de4ec1e9-0b2a-447e-9275-774e2eb40c5b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:10:38.936
1ea760b1-464c-4ed1-b838-0c27da2518e1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:10:40.636
7515520c-cd19-44d8-8e95-d1889f587ccc	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:10:40.938
2a846b87-508e-436a-a506-3b777b387493	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:10:43.937
63f47e2e-9090-4079-88f3-719e0583d657	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:10:46.139
8b1977a1-bd0e-4d40-9568-5e1f58649df3	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:10:46.139
d8fa2925-e62c-438c-b0a5-142fe5b6b6f3	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:10:47.642
99294919-fc58-4975-8b7a-57a1721934ee	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:10:50.238
fef9542d-87a2-4305-98ea-701385a5ac8c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:10:51.739
1df0e791-1c1e-4ce5-93fe-2ac41089cee9	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:10:53.041
399e98f4-b74d-4546-acac-537e1f93396e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:10:55.441
699f603a-d82a-4e1c-9117-c39353e303fa	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:10:57.239
ceab9a27-87f9-45fe-be2e-9f3699032a21	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:10:58.24
e320722d-8f67-47e9-8ad5-35cddd75e5a7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:10:58.741
426177d9-0dba-49fd-bdce-1e4a8a7b7f2f	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:11:00.337
67b5dadc-a826-4996-a3e1-190382b7d9c5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:11:04.336
40383bec-8ec4-4801-8661-d5d5a4c1786e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:11:04.836
555c6a2b-00a4-47de-a51a-c92d8ce68a20	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:11:05.74
d1ac1d8f-38a6-473e-9a18-d9847802441c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:11:05.936
35a3cd29-4180-4e21-aa75-3a7a60d2e7e4	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:11:09.238
46807b9e-384b-4914-8912-297cbb3af570	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:11:10.039
d5c572cf-5a9e-4bd1-ab6e-40da7088282b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 11:11:10.144
92c99fc4-4011-4d5f-8756-15e76b3c3691	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 13:02:54.557
3a40d01c-7fd4-485e-8463-e01a97e38d3b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 13:02:56.861
0af44d75-df0a-46f1-8fba-d59530c10768	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 13:02:56.862
1b802f39-5939-454d-bfdd-878a7f23461c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 13:02:56.856
cf1a9d67-b9da-498c-99f9-e7c3c18aee05	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 13:03:00.854
0f3dcb47-fb9d-4695-8952-bf71ebe985ee	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 13:03:01.353
25fa61b1-3299-4fd0-91c8-50ea794e0e84	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 13:03:01.357
589275a3-9df9-4dc1-bf63-a334e7bfba20	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 13:03:01.563
ae2af088-cf7d-4364-9fbf-5dada65b06a8	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:35.338
c738e163-7403-4863-ae4b-72d8300afe3e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:36.94
71343e00-aaab-4632-81dd-ee517e07a06b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:37.241
ea571645-d860-4a03-bad8-fb544d759362	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:38.738
712cdcf1-2c01-46b5-b7ab-f1d31c9531a5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:43.242
b015fca5-0ef2-4824-8452-ef6c8e6ecf1e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:43.641
f2b6f763-0e26-4673-9f1c-a25b2b43ac3b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:44.141
f2d71e8d-6080-4190-87e8-52bbd5afe817	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:45.343
f1470831-8973-4b7c-ac9e-a6e4a5e331a5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:48.042
43d0d8f8-fca3-4593-96ac-e114708dbd2a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:48.847
9a659084-7599-49d4-a0c0-6ed9e0fa0d15	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:51.043
bd51bcfd-811d-4625-8a6d-10f28b9d878a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:53.446
c4a6fb7d-c7c9-4795-a94e-395d7e6b92ee	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:54.511
167f8d43-2a8e-453d-a6b6-8938c143af07	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:54.741
a77b8d1a-e890-428a-ad55-25074f005ce5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:57.243
ab552170-1102-4d5f-8800-07e8728c77aa	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:48:58.741
fefb8a91-3b23-4d84-adf5-fc183153638c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:00.442
e1dc9529-a46d-4e39-b51a-e3a3aee232ab	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:01.842
32a0b28c-b114-4226-b4a7-0199958b3fa1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:04.044
9d0efcea-d469-4627-8c0c-a69be7834fe7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:05.544
6c91e680-6b3a-4672-837a-4bf59762bed7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:06.042
138a6f83-8948-4dd9-b2c8-f1aa70039d21	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:07.744
318b8d89-365a-4df0-93a1-9bf3907d7145	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:10.541
6a3e7741-e6c2-4c18-8456-feda7f7acf72	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:11.344
3edf499e-7c66-4be0-ac11-cf4c5ab031a7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:13.346
f2c61959-8c8c-4f96-b425-f1c349caa808	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:14.645
40120344-cdbd-47c0-9012-4cd465463d5e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:17.143
119b5523-f0b8-490b-91df-de58f0545c6e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:18.738
768c7068-fd1c-49fc-b8b5-6e97af5e95f3	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:19.938
c42dd0d1-bef4-4520-9df3-b9fffc61227e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_created	product	5384e0c0-1630-48cb-99c4-da396559f5dc	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:49:46.793
77f334e1-9db3-40ed-b890-368a557fb3da	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_inventory_created	product	5384e0c0-1630-48cb-99c4-da396559f5dc	\N	\N	0.000000000000000000000000000000	{"cost": 8000, "icon": "coffee", "name": "Flash", "price": 10000, "barcode": "1234", "category": "Ichimliklar", "stock_after": 10}	2026-06-09 14:49:46.891
73983143-071a-4668-9061-bafb7da80d2c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	5384e0c0-1630-48cb-99c4-da396559f5dc	\N	\N	0.000000000000000000000000000000	{"barcode": "1234"}	2026-06-09 14:50:25.01
ec8fcede-428d-4a47-9d89-5156e72ad8de	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	5384e0c0-1630-48cb-99c4-da396559f5dc	\N	\N	0.000000000000000000000000000000	{"barcode": "1234"}	2026-06-09 14:50:28.598
b00650ba-fabd-4411-991b-8a0c45daebb1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:54:55.468
7a4cf30f-cf5f-415e-956f-135d838ae349	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:54:55.539
99044463-ccbd-4a39-b93f-8082c79fc13f	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:54:56.144
c154e84b-bc27-47b9-8829-6592a0c018e5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:54:56.345
20b53043-9b43-463c-892f-0022f253010d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:01.746
2136cf27-d2df-4671-8f5d-b65f6425e871	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:02.843
1321c210-3c9f-40a0-81bc-36096904e9c0	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:04.544
a9f2ebd3-7458-4f1f-930e-65993fb48152	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:06.74
4faf13aa-7b53-40c7-b4d8-0f1e3291ff94	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:08.339
e0c4865e-93c8-41f5-9413-4a8c1375e39f	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:08.439
1aed623b-3097-4b7a-aa1b-f33cae2bd8e5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:10.041
3aa29022-17a3-42c5-8eb5-32b87b4e1b58	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:12.743
00a3b5b1-7f87-442d-a759-f17fed186ebd	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:13.643
dbd6e2ae-9c91-4287-9e08-b8497b48ef98	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:14.01
a0c6e44f-5444-423c-b59a-1c1b2ac653df	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:14.742
58d4ec9b-25b8-4ce5-a8a8-4bc580c95c5e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:20.868
e32adb6d-318b-4e44-8030-39d1292c0b78	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:23.514
35bc0b06-7761-496d-ba02-300c1840f121	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:24.111
d85fbb49-17bb-4af3-9e99-dea15ee16c2d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:26.012
84eb3e13-17e6-406e-821b-443e672bcfc2	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:26.113
6d45cefd-fb5f-471e-88fc-f7c388aa79a0	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:55:27.211
ec335333-cba3-48cd-8fd8-638198304985	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:56:27.02
a7bc186e-41fc-4816-b078-6135119318d0	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 14:56:36.02
0aec5b8a-c5f2-42bd-83b5-ef67a7450aeb	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:05:05.427
34911d10-f56a-4c27-895a-d74fbc1985e9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	tariff_created	tariff	35ef29bf-4253-4f09-87f9-d6e50b60b3b1	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:06:04.824
2d81a5ec-b322-4129-9cb7-540d39eb979d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:06:16.117
54a33a4e-0993-4886-a0e3-0d59cef39ee9	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:06:17.518
fa2d6ffa-17e5-41c3-9341-8bd3ca02901f	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:06:18.025
40f76700-4e75-43e7-83a8-152ebb198d52	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:10:36.319
caf230ec-1acb-47f4-9611-aa0251ff60b5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:10:36.812
165a10d1-5223-4099-a72b-242609d652dc	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:10:38.313
0132bd95-2da9-40a3-bcb5-4a77c79da563	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:10:40.216
1ca30498-5e7a-4085-b90a-c08966fdda2d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:10:43.314
a4b2061a-e842-46d0-9235-94b0781bb934	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:10:43.317
1fabd3d8-3e3f-450a-819e-3e5d8b24cd60	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	37e42e81-2b80-43b4-8ad4-9de1327c91e3	\N	\N	0.000000000000000000000000000000	{"barcode": "777123"}	2026-06-09 15:12:52.666
8b1a51bc-4c25-413b-9fc3-7d4d9d82b1fb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	37e42e81-2b80-43b4-8ad4-9de1327c91e3	\N	\N	0.000000000000000000000000000000	{"barcode": "777123"}	2026-06-09 15:13:01.151
36815326-9bb7-4872-8cc7-7953156c9e4f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	5384e0c0-1630-48cb-99c4-da396559f5dc	\N	\N	0.000000000000000000000000000000	{"barcode": "1234"}	2026-06-09 15:13:08.719
426ebdba-9a00-4f77-bdf1-0a5fceb61b57	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-09 15:54:34.533
e7e4af85-ad3e-493f-afa0-244dfb0f06b3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "bm-pc"}	2026-06-09 15:56:41.321
7990611f-d3df-4990-bf2f-a150c7a2c607	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "bm-pc"}	2026-06-09 15:56:50.034
0512f432-aae7-483c-b69a-f2bb4c7cfe2e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-09 15:56:52.846
ef9c65a4-ea24-4e63-a560-7ea11ee91a3e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 09:07:05.014
c033290b-78c3-4d68-924a-c4f38a8914f4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 09:11:36.324
4acd8cb7-0e31-4643-8a5e-ac7631826e64	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 09:11:37.029
6e10dab6-debb-4fe8-aae6-e1bd5a68e912	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 09:34:54.134
0acc1291-0594-43cc-8f0b-3967a72d1f6d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 22, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 23, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 21, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-10 09:41:17.871
59e5369c-d5d6-4511-8300-ca83777874d4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 22, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 23, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 21, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-10 09:41:44.393
46a8b55c-319e-457f-8903-29acfd269383	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 4, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-10 09:42:05.874
0902212a-7125-4674-a5dc-c39c38e76844	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	00000000-0000-0000-0000-000000000001	Super Admin	super_admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 4, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-10 09:43:08.116
3b407aec-f0a5-4cce-b9e7-7c278a300379	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 10:09:11.258
9559c4b1-bc4d-4e90-8d34-df0619c2f1e7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 10:09:55.985
fbfb9384-8412-4b39-8a2f-a07c6521b3a3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	repair_requested	repair_request	ec15df27-d1e6-40b2-bed2-44d546e01f37	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{}	2026-06-10 10:10:15.803
a8e65f60-ef89-4379-89ec-79b844ec9171	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 10:28:31.504
6c19bb27-2444-4516-8e52-3f6a51282b4f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "bm-pc"}	2026-06-10 10:28:50.058
5e43b84e-5ad9-4a91-8de0-a6b008b9b7c3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "bm-pc"}	2026-06-10 10:29:16.225
fb6a703e-6a6f-43b6-a58c-bef46d545dbf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 4, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 12, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-10 12:01:54.944
147fb16f-9310-4e04-bde1-6b2b60e38986	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 12:05:58.509
7caf2733-22d5-4136-beb6-ab8136c29c3c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-10 12:07:54.149
c6a67eac-682e-480d-8486-8f316fc42f84	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	stop_session	session	51c5f428-20a4-4beb-9eaf-c23c2764bfc0	7560ac62-9494-4ba7-95c8-23d3e3313943	51c5f428-20a4-4beb-9eaf-c23c2764bfc0	0.000000000000000000000000000000	{}	2026-06-10 12:08:54.732
a995645d-c1ee-4a34-995d-2a000b9942bd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-10 12:09:01.029
c877fa29-15ac-41a6-bdc1-171d3b02c663	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 4, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 13, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-10 12:09:48.472
11d68e7a-3314-4588-93c0-8ef401194a3a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	01b08c39-3500-42bf-a9a4-2aaad0d7746a	b967ae2c-2207-4d47-b41a-5e27192e0bad	01b08c39-3500-42bf-a9a4-2aaad0d7746a	0.000000000000000000000000000000	{"source": "system", "expired": true}	2026-06-10 12:14:26.866
0ca7fd40-4b99-4de9-a0d0-911364d188d8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	stop_session	session	c398e987-9ba8-4d72-8411-695adc0a2ba1	7560ac62-9494-4ba7-95c8-23d3e3313943	c398e987-9ba8-4d72-8411-695adc0a2ba1	0.000000000000000000000000000000	{}	2026-06-10 12:14:35.668
383c7948-bdd8-423a-b276-4bc3cb7760aa	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-10 12:14:39.83
974ad535-8f91-40a6-a438-54ca7f12e33d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 12:30:16.843
1b738183-30b8-41d8-892f-7bf40499dc0f	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 12:49:16.254
c7a75fa0-3c89-4b16-915e-ed5687416dd3	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 12:49:18.862
c3881599-72d6-4a9f-97aa-37c6abe8c323	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 12:49:36.558
f925afa6-9fca-4a55-b765-09ad8285efe7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 12:49:53.171
ed6fe853-25a9-4cdc-ac63-0d539bb56c32	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 12:49:54.548
1de652a1-47c4-4d81-a2f1-66072bb47ddb	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 12:50:54.954
720561a1-0b71-4464-9849-7356f8db8245	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 12:51:24.91
7471dd5e-ba0b-48a5-9bc8-a5b746da9ef2	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 12:59:31.058
6d5d68ff-4dca-4eb0-b923-58f933b92eb6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	a392e31b-b4a1-4bcb-baf0-2ca47938b28e	f7db86e9-4c80-4f1c-a1d4-6f78b93e5bba	a392e31b-b4a1-4bcb-baf0-2ca47938b28e	0.000000000000000000000000000000	{"source": "system", "expired": true}	2026-06-10 13:00:58.979
661ef0b4-cae3-4cd9-81dc-14e74f216ce9	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 13:02:32.161
5b9603b6-d43a-4ac9-81d4-cffd0f6cf204	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	repair_rejected	repair_request	ec15df27-d1e6-40b2-bed2-44d546e01f37	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{}	2026-06-10 13:04:16.336
855cbb52-3e12-46d6-a6c1-a1de9e71fc4e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	37a131d1-32c6-4920-92aa-00757cda5cc4	7560ac62-9494-4ba7-95c8-23d3e3313943	37a131d1-32c6-4920-92aa-00757cda5cc4	0.000000000000000000000000000000	{"source": "system", "expired": true}	2026-06-10 13:07:41.061
8101a3df-eb3c-446e-8a27-149344c71076	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-10 13:22:45.553
42bca49d-459a-4925-99b2-04e2ac1122ba	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	stop_session	session	cbfed0de-a203-4389-9f03-6e96ff91c076	f7db86e9-4c80-4f1c-a1d4-6f78b93e5bba	cbfed0de-a203-4389-9f03-6e96ff91c076	0.000000000000000000000000000000	{}	2026-06-10 13:22:59.666
024dfdce-3f18-4cc0-84ec-0d9d879a20e9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "bm-pc"}	2026-06-10 13:23:00.099
d748ebbb-efdf-4c47-83d4-27e2f95adc8e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	stop_session	session	53a72eb1-efbf-4a78-9492-230d6b090cc8	f7db86e9-4c80-4f1c-a1d4-6f78b93e5bba	53a72eb1-efbf-4a78-9492-230d6b090cc8	0.000000000000000000000000000000	{}	2026-06-10 13:23:38.956
d2cdcece-9ca0-4e88-90cb-7a85c706ce7f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "bm-pc"}	2026-06-10 13:33:39.997
db3a022d-c042-49e7-806e-e544fd51c11c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "bm-pc"}	2026-06-10 13:33:56.528
d6e9ff1e-09c6-41d4-bb69-7c46f9322e87	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 06:05:02.312
c1bce2a3-258f-4fcf-a97f-c8fe2a50c0ff	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 06:05:02.312
1951ed19-36e1-443d-bb10-b75d01b72ea1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 06:05:03.417
02edbf1b-1547-4d33-a3a1-efd551fc2ee7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	79d4dedf-2e79-4ca4-9652-fcccc0fb7360	f7db86e9-4c80-4f1c-a1d4-6f78b93e5bba	79d4dedf-2e79-4ca4-9652-fcccc0fb7360	0.000000000000000000000000000000	{"source": "system", "expired": true}	2026-06-11 06:26:57.283
31912e8e-610a-415b-a7f2-12c994e5bb89	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	775a6012-ad03-483d-af09-8b6301a43e19	f7db86e9-4c80-4f1c-a1d4-6f78b93e5bba	775a6012-ad03-483d-af09-8b6301a43e19	0.000000000000000000000000000000	{"source": "system", "expired": true}	2026-06-11 08:08:37.056
f3874e36-7f6f-4839-852a-7f55706a76c3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 08:24:07.397
f4150c30-96f5-4f3c-9861-3f6cc8c847b1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	stop_session	session	073da523-a917-4cd7-a916-93600ec68496	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	073da523-a917-4cd7-a916-93600ec68496	0.000000000000000000000000000000	{}	2026-06-11 08:26:47.902
fd9276e0-62e8-460a-a775-41d2e7fa11c1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 08:26:48.214
ac37dede-9668-4c64-b63b-adabd11d228d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 08:26:54.557
5726b061-ba6e-4734-ae17-8ab8994efa62	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 08:27:05.919
b2c566f6-764a-46c6-9fb7-b930e24e7017	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	repair_requested	repair_request	7d131cb8-1347-4f49-8aef-84301fa73189	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	\N	0.000000000000000000000000000000	{}	2026-06-11 08:27:09.646
1a1dc70d-85ec-44d0-a6c0-97b1a74ea1d5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	repair_approved	repair_request	7d131cb8-1347-4f49-8aef-84301fa73189	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	\N	0.000000000000000000000000000000	{}	2026-06-11 08:27:18.619
194884d1-8a74-4a55-85d7-6f1b41832444	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 08:30:37.492
e538611d-e843-4a53-8002-1e9f1b4b68cd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	stop_session	session	7d950085-cf0b-4903-aac5-7957f3c31ee9	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	7d950085-cf0b-4903-aac5-7957f3c31ee9	0.000000000000000000000000000000	{}	2026-06-11 08:32:05.997
5476e199-0a11-4d0a-a56b-7e1103a08e09	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 08:32:06.559
52d4cb91-5a1e-4b94-9aa7-6991dd9f3ad9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	stop_session	session	2defbf2c-a9a1-4f87-b140-8c12e302dbd9	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	2defbf2c-a9a1-4f87-b140-8c12e302dbd9	0.000000000000000000000000000000	{}	2026-06-11 08:40:35.059
5870b656-f861-494e-b93d-624e1ed60d37	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 08:40:39.028
10291c7f-af8a-464c-a778-9a8cff8fd75a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	a11348d6-77ae-4efd-911a-4a034d1b4dd3	f7db86e9-4c80-4f1c-a1d4-6f78b93e5bba	a11348d6-77ae-4efd-911a-4a034d1b4dd3	0.000000000000000000000000000000	{"source": "system", "expired": true}	2026-06-11 09:12:21.485
52da915e-2b3e-46f3-8abe-c8160b44f1f5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 09:49:45.377
b7a7676a-eb5d-40e7-b45e-919bf61defc5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	stop_session	session	583a599a-bf4c-4b7f-ad77-afe2d4e5c11e	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	583a599a-bf4c-4b7f-ad77-afe2d4e5c11e	0.000000000000000000000000000000	{}	2026-06-11 09:55:58.804
222feb0c-3c4e-4d70-b80d-b1394730c751	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 09:55:59.474
22f4cd09-2269-4bcb-8bc5-e5cbaf32bfa6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 4, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 13, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-11 11:10:07.923
625c2142-760d-43b9-b31a-98091a393581	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_updated	product	393cd93f-4b0c-49a9-a040-2c9f5024179f	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 11:10:25.753
e43e7833-d599-4c74-8923-4c4fe13a7b95	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	stop_session	session	45fc6af3-d031-4a83-b26d-fe648fcd5866	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	45fc6af3-d031-4a83-b26d-fe648fcd5866	0.000000000000000000000000000000	{}	2026-06-11 11:12:33.433
abef6b03-fc0a-4c2e-b9e6-69588494ffbf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 11:12:34.012
ed2453a7-8b06-4926-bac3-0a0961c84db7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	stop_session	session	2d57f8b4-2881-4d16-9f71-0a2d0f28dc57	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	2d57f8b4-2881-4d16-9f71-0a2d0f28dc57	0.000000000000000000000000000000	{}	2026-06-11 11:13:24.151
f1bd55c4-86bd-4c0f-a25e-fd1b838ccb42	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 11:13:26.479
d8ed7b55-f7d0-499b-af28-7f8b1000af3b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_assignments_set	user	063e3970-29db-42d8-b006-6fb0034be600	\N	\N	0.000000000000000000000000000000	{"count": 1}	2026-06-12 12:48:17.285
9f363dbe-b523-4499-9019-5608a285d77b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	092bfdad-ecc4-425e-bdc1-36e41c6149e0	M2M A	admin	login	user	092bfdad-ecc4-425e-bdc1-36e41c6149e0	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:48:18.124
34833005-373b-4689-a5d7-f70c4e629b6d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	063e3970-29db-42d8-b006-6fb0034be600	M2M B	admin	login	user	063e3970-29db-42d8-b006-6fb0034be600	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:48:20.243
a1f1bbb1-973b-4a01-8dc8-46f737f4ca45	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 4, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 13, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-11 11:15:51.158
883bfcac-7407-422e-a997-3f63820a1b09	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 4, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 13, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-11 11:15:52.838
5007a002-29de-4ee4-a69e-848ec39ab427	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_updated	product	393cd93f-4b0c-49a9-a040-2c9f5024179f	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 11:16:19.885
db86d822-382c-4bdb-be24-d81c53384185	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	inventory_updated	inventory	557df262-d94b-4f61-8efd-c95a9bd22d8d	\N	\N	0.000000000000000000000000000000	{"cost": 10000, "icon": "snack", "name": "Energy Drink", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "4780001000042", "quantity": 22, "product_id": "393cd93f-4b0c-49a9-a040-2c9f5024179f", "after_quantity": 22, "before_quantity": 25}	2026-06-11 11:16:21.731
6cd5a54f-247a-44b8-9f80-16d17ed2fc05	09b2a6f7-90c0-4d54-a054-a5282277dda2	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	tariff_updated	tariff	a4c8df89-badf-46d4-b70d-264984ac6f01	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 11:26:46.226
a132e8f3-65a0-4866-81b1-f7f9d8a5dd4a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 11:27:14.242
e17545b8-cea5-4f41-aa2d-3f697d26f54b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	tariff_updated	tariff	67cf0bc6-1a18-48ee-83fd-1c04f6187d03	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 11:38:37.113
02b8da9c-f0cf-4ebe-915c-fced0c640606	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	stop_session	session	55b75e04-d245-4f57-8d49-d88571fa80f0	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	55b75e04-d245-4f57-8d49-d88571fa80f0	0.000000000000000000000000000000	{}	2026-06-11 11:38:51.271
90caf7ba-c129-4cd9-8ab8-6ce82412548d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 11:38:51.673
b4d18d86-6353-41a3-80e2-488d7ac71b8e	09b2a6f7-90c0-4d54-a054-a5282277dda2	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	tariff_updated	tariff	0eaca459-3ddd-42bf-8818-773ff20cdbfe	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 11:40:08.615
f95b889a-1c48-4f94-b382-b62716d0e23c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 4, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 13, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-11 11:41:21.737
cbb386a6-a638-4ce4-ae16-8c1203de1cd9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 13:40:36.293
65144cb2-cea9-4b99-8043-7a95792e5522	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	8c4dfff7-f020-47b8-b228-0c1432e6a96f	\N	\N	0.000000000000000000000000000000	{"barcode": "4607065000868"}	2026-06-11 15:15:33.05
6e2369fe-faf8-4abc-8189-48fb2ce4ffd1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	8c4dfff7-f020-47b8-b228-0c1432e6a96f	\N	\N	0.000000000000000000000000000000	{"barcode": "4607065000868"}	2026-06-11 15:15:35.479
8d317a31-7439-48de-888b-d60b312d8ebd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	shift_opened	shift	d336434e-f58f-45fc-9b6c-02d41a673fad	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 15:17:12.553
99b69fe2-3f71-457c-91bb-b1753f685551	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	stop_session	session	fbd53f56-e892-4243-8740-44dd4cdc76ef	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	fbd53f56-e892-4243-8740-44dd4cdc76ef	0.000000000000000000000000000000	{}	2026-06-11 15:18:28.314
f0cb2350-5f49-4b24-a02d-a24165e33130	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-11 15:18:28.732
2bc8a66d-5943-4f13-a11e-1e081155499a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-11 15:18:38.663
6df259fb-9e4b-4133-842e-f45da537b3fc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-11 15:18:44.828
236799a2-3e1a-4d24-a9fd-3a201a9141f0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-11 15:18:55.232
5bb156c3-4711-4416-bee2-23a428588828	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	booking_created	booking	7eb62747-2756-4c74-a168-0cb12797a699	\N	\N	0.000000000000000000000000000000	{}	2026-06-11 15:30:45.003
18bbfa3e-720e-42ea-977c-14400332d345	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 07:08:58.848
bc017054-491c-42cc-bc20-7d2c7c2aba4a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	shift_opened	shift	2d73dce6-93d1-4255-9db5-578889ef9a70	\N	\N	0.000000000000000000000000000000	{"shift_type": "Kunduzgi (09:00 - 18:00)", "starting_cash": 200000}	2026-06-12 07:09:46.577
cb6c2ca8-00aa-4966-9ce7-38c4d94a1e93	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	shift_opened	shift	fa1772cc-fde3-4d4e-a506-674fd018a35a	\N	\N	0.000000000000000000000000000000	{"shift_type": "Kunduzgi (09:00 - 18:00)", "starting_cash": 100000}	2026-06-12 07:35:42.67
3c9931db-360b-479e-85b4-b8f34fb0b68d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:10:04.252
599d1de3-8cad-4578-a3f0-390e638ad7d4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	146fcbc5-9c48-4c10-a943-fd397bc1af49	Main Admin	admin	login	user	146fcbc5-9c48-4c10-a943-fd397bc1af49	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:10:04.855
67c465eb-0b07-40d8-8efa-b7f37d9da0ac	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	93a97756-772d-4e44-9d07-3dadeac19ddb	Main Admin	admin	login	user	93a97756-772d-4e44-9d07-3dadeac19ddb	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:10:05.476
d643f30e-1f2a-4a14-a4f7-c59c324e7ddb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	146fcbc5-9c48-4c10-a943-fd397bc1af49	Main Admin	admin	login	user	146fcbc5-9c48-4c10-a943-fd397bc1af49	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:17:28.947
ee6862c0-9d1f-4096-a7c2-57921cf289a6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	146fcbc5-9c48-4c10-a943-fd397bc1af49	Main Admin	admin	login	user	146fcbc5-9c48-4c10-a943-fd397bc1af49	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:17:30.233
84ec2919-06d1-469f-a869-0bf719fb48c2	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:24:01.303
171138b9-fbbd-4676-ac14-17414c54ce6c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:32:26.249
4b9e974f-8a4c-4d85-b6a3-7863328ed0eb	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_assignments_set	user	67005460-527d-4723-915f-8ff20067e42d	\N	\N	0.000000000000000000000000000000	{"count": 2}	2026-06-12 12:32:57.257
c3be4288-479c-4374-b670-f622dd2ae735	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_assignments_set	user	3b87f36b-3c07-4ac8-8686-3e76ce91f43f	\N	\N	0.000000000000000000000000000000	{"count": 2}	2026-06-12 12:33:05.302
cab178b6-2dfc-409b-8fcf-46cda57faaef	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_assignments_set	user	67005460-527d-4723-915f-8ff20067e42d	\N	\N	0.000000000000000000000000000000	{"count": 2}	2026-06-12 12:34:25.788
388eca6d-e242-4b25-a15f-8bd4278536fb	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:39:27.893
df180eb3-590d-4ab0-9b3d-19fb9966f341	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:48:10.288
5a7ee29c-56f2-47fd-b313-6022c73756f4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	user_created	user	092bfdad-ecc4-425e-bdc1-36e41c6149e0	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:48:12.81
a5dc939a-9c1e-4f01-8fc2-cb6b634fd66b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	user_created	user	063e3970-29db-42d8-b006-6fb0034be600	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:48:13.754
c0d65ffc-ec29-4ba9-9a2e-def0aae0b3d5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_assignments_set	user	092bfdad-ecc4-425e-bdc1-36e41c6149e0	\N	\N	0.000000000000000000000000000000	{"count": 1}	2026-06-12 12:48:16.156
03a3e07f-0767-44dc-8158-7381f207cf07	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	user_deleted	user	092bfdad-ecc4-425e-bdc1-36e41c6149e0	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:48:22.541
eabd0061-c5d4-4a98-a2a9-46ba9f8c6568	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	user_deleted	user	063e3970-29db-42d8-b006-6fb0034be600	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:48:23.367
41650b9e-385e-45cb-9d45-fa7a23ac9fb9	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:49:34.722
43cca3ab-35e3-4f14-9709-0742b11ae7fc	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 12:50:52.654
68576806-3da8-4986-917a-9d04bae31088	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	login	user	67005460-527d-4723-915f-8ff20067e42d	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:12:30.297
14726617-4be0-4614-8409-c1ba140d6d68	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	9e5cd792-2919-407f-963d-1e088654f9e6	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:13:12.512
46a5080b-2d1d-4fe5-aca9-9bc70851fb20	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	7e30b780-f60c-424a-a184-4fef11a44306	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:13:12.81
45468983-c0df-45c1-b355-1eb534270c26	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	a1d6a446-3e0c-4a20-951e-50c7b1b34fa4	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:14:20.539
d56d123b-9304-4948-87ae-dbab67a0669b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	a1d6a446-3e0c-4a20-951e-50c7b1b34fa4	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "Пластик курт", "price": 0, "barcode": "4780102760304", "category": "Snack", "stock_after": 14}	2026-06-12 15:14:20.621
0f91eb18-d2df-4932-9326-c618e2e071b3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	a447b302-fcc0-4a85-833f-f86236329fe4	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:14:58.089
9374f764-b8d9-487b-935d-a2f0c659e9ba	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	a447b302-fcc0-4a85-833f-f86236329fe4	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "M&Ms", "price": 0, "barcode": "47801027603044607065000868", "category": "Snack", "stock_after": 7}	2026-06-12 15:14:58.183
4ff5a678-f6c2-4ce8-8d3d-616aa73df69d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	978ee6cc-d260-4018-8723-8adff4d4aaf8	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:15:39.239
adbbf918-6bf1-458f-9bea-91bc1943aae7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	978ee6cc-d260-4018-8723-8adff4d4aaf8	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "TWIX", "price": 0, "barcode": "478010276030446070650008686221134012712", "category": "Ichimliklar", "stock_after": 10}	2026-06-12 15:15:39.326
3a50a82a-7baf-419d-947e-e078c8e874ac	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	66c6f72a-2ef1-4ab9-b818-c7edd78457ad	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:16:22.754
209d8449-2ad9-4a26-8bcd-6088c52500b2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	66c6f72a-2ef1-4ab9-b818-c7edd78457ad	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "SNIKERS", "price": 0, "barcode": "4780102760304460706500086862211340127124607065001445", "category": "Ichimliklar", "stock_after": 17}	2026-06-12 15:16:22.841
ae148a3b-83e4-494b-a389-5a0f5fe51a4d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	5b988a52-4c33-487c-afb5-6cbea9b943e8	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:17:02.712
47e1b287-8168-4c3e-8d54-d46958cabe9c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	5b988a52-4c33-487c-afb5-6cbea9b943e8	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "Keshu M", "price": 0, "barcode": "47801027603044607065000868622113401271246070650014454780102760113", "category": "Ichimliklar", "stock_after": 1}	2026-06-12 15:17:02.808
186f6866-e46f-4e1e-ace8-dc62542b6d74	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_stock_updated	product	5b988a52-4c33-487c-afb5-6cbea9b943e8	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "Keshu M", "price": 0, "barcode": "47801027603044607065000868622113401271246070650014454780102760113", "category": "Ichimliklar", "stock_after": 1, "stock_before": 1}	2026-06-12 15:17:03.012
8628dc8c-dd38-4e70-bf33-89db96aad870	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	a61aac7a-fd11-4e7f-a448-6cdbd282f1d8	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:17:44.384
6b63b9ee-0d9c-4911-bc6f-f860be29d3db	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	a61aac7a-fd11-4e7f-a448-6cdbd282f1d8	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "Qurt Vakum", "price": 0, "barcode": "478010276030446070650008686221134012712460706500144547801027601134780102760199", "category": "Ichimliklar", "stock_after": 2}	2026-06-12 15:17:44.441
f3f385b8-cde0-4ff5-b33f-06d039242dc3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	a2103180-05cc-42f0-9b18-d4f459709873	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:19:08.898
bea04021-0db5-48c2-bb98-9ec007018603	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	a2103180-05cc-42f0-9b18-d4f459709873	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "Mindal M", "price": 0, "barcode": "4780102760304460706500086862211340127124607065001445478010276011347801478010276012002760199", "category": "Ichimliklar", "stock_after": 10}	2026-06-12 15:19:08.984
33f22cd7-0e53-4868-b3f6-a51e6c732b89	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	b41da9a9-0616-40f1-8cb3-e839597219c3	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:19:47.589
9933b076-546b-48d8-969a-e079ae8d731e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	b41da9a9-0616-40f1-8cb3-e839597219c3	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bread", "name": "Фисташки М", "price": 0, "barcode": "47801027603044607065000868622113401271246070650014454780102760113478014780102760120027601994780102760137", "category": "Ichimliklar", "stock_after": 0}	2026-06-12 15:19:47.648
ddca1b83-01b2-4896-bd35-97683247ad43	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	b41da9a9-0616-40f1-8cb3-e839597219c3	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:20:04.459
81ac149f-1bb7-4145-b870-f01d981ff667	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	66a5b903-2d53-4886-ade1-6238c28969e6	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:21:05.983
591c040d-a1fa-4673-8089-c4e83d363802	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	66a5b903-2d53-4886-ade1-6238c28969e6	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bread", "name": "Фисташки М", "price": 0, "barcode": "478010276030446070650008686221134012712460706500144547801027601134780147801027601374780102760120027601994780102760137", "category": "Ichimliklar", "stock_after": 12}	2026-06-12 15:21:06.067
a4ec6862-5bb1-4dc0-8607-c2c85f5e149a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	f540f44e-9244-4f00-8184-afcdd580cc5f	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:21:44.325
aa614cf1-7781-4b36-8c44-d05ae449bbc6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	58ca5e9c-0755-4373-83be-6ec4dbd85ffe	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "cookie", "name": "MEGA CHIPS", "price": 0, "barcode": "47801027603044607065000868622113401271246070650014454780102760113478014780102760137478010276014448102790004294780102760120027601994780102760137", "category": "Ichimliklar", "stock_after": 12}	2026-06-12 15:22:39.066
6fd3b4bb-31d2-4983-8f6c-be9c37725d49	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	5cd0fdb9-451d-4c5a-b32d-80585cf46eb9	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bread", "name": "Lays 37г", "price": 0, "barcode": "478010276030446070650008686221134012712460706500144547801027601134780146903881161634780102760137478010276014448102790004294780102760120027601994780102760137", "category": "Ichimliklar", "stock_after": 10}	2026-06-12 15:25:44.525
d6c62dd2-bde2-4ef5-9387-03926507cacc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	f3759cbd-9e91-441f-ae59-9845e2e864d4	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:26:11.454
904981a6-62d4-41e6-8b6a-5e9d23d66262	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	01a5dabe-de4e-47e1-bbc9-0d60af135a4b	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "Мохито", "price": 0, "barcode": "478013764029947801376402134780072660161478006802002347801017342694600068058058", "category": "Ichimliklar", "stock_after": 3}	2026-06-12 15:37:53.496
4b6e2e7c-6559-4836-a657-3fce77b98476	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	f3759cbd-9e91-441f-ae59-9845e2e864d4	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "Lays 70г", "price": 0, "barcode": "4780102760304460706500086862211340127124607065001445478010276011347801469038811616347801027601374780102760144481027900469038812104404294780102760120027601994780102760137", "category": "Ichimliklar", "stock_after": 1}	2026-06-12 15:26:11.545
764a6d6f-a3aa-4c30-8df7-aa43b0266fe6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	2d7ca282-2a5a-4033-ad5d-f8b52652e595	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:27:26.586
71689a17-2cf5-46cf-ba6d-9fbc084ba412	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	2d7ca282-2a5a-4033-ad5d-f8b52652e595	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "fish", "name": "Flint Kishik", "price": 0, "barcode": "47801027603044607065000868622113401271246070650014454780102760113478014690388116163478010276013747801027601444810279004690388121044042947801027601200276019947801027604780137640053137", "category": "Ichimliklar", "stock_after": 13}	2026-06-12 15:27:26.674
4f91857f-fe06-4301-922d-f055d768e998	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	0298f745-84fd-44b7-b8f5-301f70a5d8a8	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:28:11.553
b35f1003-f24c-4879-a81e-bb32a1efffa8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	0298f745-84fd-44b7-b8f5-301f70a5d8a8	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bread", "name": "Flint Mega Pachka", "price": 0, "barcode": "478010276030446070650008686221134012712460706500144547801027601134780146903881161634780102760137478010276014448102790046903881210440429478010276012002760199478010276047801376400534780137640152137", "category": "Ichimliklar", "stock_after": 2}	2026-06-12 15:28:11.643
504fcff9-576e-4471-9b90-5b940b3532d9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	2d7ca282-2a5a-4033-ad5d-f8b52652e595	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:28:55.532
0ebeec25-f2a6-4920-bd8d-54ee995fec78	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	95899c6e-5a44-4fe4-9505-8b9acbb76eb2	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "fish", "name": "Flint Kishik", "type": "adjustment", "price": 0, "reason": "dashboard product update", "barcode": "47801027603044607065000868622113401271246070650014454780102760113478014690388116163478010276013747801027601444810279004690388121044042947801027601200276019947801027604780137640053137", "quantity": 16, "product_id": "2d7ca282-2a5a-4033-ad5d-f8b52652e595", "after_quantity": 16, "before_quantity": 13}	2026-06-12 15:28:56.875
08944446-1831-45ac-8be5-1b5242e3ad30	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	f9010df5-ed1a-4f02-868d-eb730eb868b8	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:29:35.598
5054d0fa-e677-46d8-bfce-2a6922d7ab81	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	f9010df5-ed1a-4f02-868d-eb730eb868b8	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "water", "name": "ERMAK сушкв", "price": 0, "barcode": "4780102760304460706500086862211340127124607065001445478010276011347801469038811616347801027601374780102760144481027900469038812104404294780102760120027601994780102760478013764005347801376401524780035860010137", "category": "Ichimliklar", "stock_after": 3}	2026-06-12 15:29:35.655
5a23fa97-d3ff-4555-8c04-edcfcdfe6833	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	a2103180-05cc-42f0-9b18-d4f459709873	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:31:16.209
61db0d07-c24a-4480-adc8-1ca44ebeacdb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	af004244-77d0-400a-acb5-e953a394ebdc	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "Mindal M", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "4780102760304460706500086862211340127124607065001445478010276011347801478010276012002760199", "quantity": 10, "product_id": "a2103180-05cc-42f0-9b18-d4f459709873", "after_quantity": 10, "before_quantity": 10}	2026-06-12 15:31:17.978
fdd9808b-771f-4aea-8c64-edc9f1ab9075	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	5b988a52-4c33-487c-afb5-6cbea9b943e8	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:31:28.582
63b2190c-270a-4b7b-b6f6-4eb6e1333f93	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	303053f2-bc30-47b1-8462-515786f65b9a	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "Keshu M", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "47801027603044607065000868622113401271246070650014454780102760113", "quantity": 1, "product_id": "5b988a52-4c33-487c-afb5-6cbea9b943e8", "after_quantity": 1, "before_quantity": 1}	2026-06-12 15:31:30.078
35ad7c49-54de-4fc4-a7b3-0c209e3fb1ef	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	56adf74c-2335-45ce-bd45-8998b6047bdb	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "B fresh", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "478013764029947801376402134780072660161", "quantity": 23, "product_id": "0cc1edd1-c65d-4332-9484-9555b5ea4b0e", "after_quantity": 23, "before_quantity": 23}	2026-06-12 15:42:09.44
e975b61c-4d6a-442c-85b0-e0c0b4edf366	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	shift_opened	shift	6c475e03-e99b-4279-b329-6e2f9e069357	\N	\N	0.000000000000000000000000000000	{"shift_type": "Kunduzgi (09:00 - 18:00)", "starting_cash": 95000}	2026-06-12 17:01:15.019
4a611bfe-9b51-4480-b781-491b3b4144ac	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	a8d7a5f3-b978-4d4e-93e0-897fb590eaac	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "burger", "name": "Grenki Kotta", "price": 0, "barcode": "47801376402994780137640213", "category": "Ichimliklar", "stock_after": 2}	2026-06-12 15:34:50.835
f944996a-9fb8-4c9f-a74e-1da0351ed79a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	0cc1edd1-c65d-4332-9484-9555b5ea4b0e	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "B fresh", "price": 0, "barcode": "478013764029947801376402134780072660161", "category": "Ichimliklar", "stock_after": 11}	2026-06-12 15:35:43.527
c3bbfa25-fa6e-4dcd-8064-ca79620512d1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	0cc1edd1-c65d-4332-9484-9555b5ea4b0e	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:36:06.262
4cd0a1b0-f443-4417-b65e-abd22f34c8ea	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	56adf74c-2335-45ce-bd45-8998b6047bdb	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "B fresh", "type": "adjustment", "price": 0, "reason": "dashboard product update", "barcode": "478013764029947801376402134780072660161", "quantity": 23, "product_id": "0cc1edd1-c65d-4332-9484-9555b5ea4b0e", "after_quantity": 23, "before_quantity": 11}	2026-06-12 15:36:08.324
01db31ba-994e-4f57-9cef-6079c4363604	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	a438fe77-74a0-4a86-87c5-6de222ea6373	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:36:46.393
c2b814b3-d9b5-42dd-a2d1-2ae4549cd0d3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	a438fe77-74a0-4a86-87c5-6de222ea6373	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "Flash Kichik", "price": 0, "barcode": "4780137640299478013764021347800726601614780068020023", "category": "Ichimliklar", "stock_after": 10}	2026-06-12 15:36:46.48
c00af79a-11db-4b1e-b60d-c0eabf8310a8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:37:12.921
5b11b167-f0f3-40a2-8e15-3534f3126a1c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "18+", "price": 0, "barcode": "47801376402994780137640213478007266016147800680200234780101734269", "category": "Ichimliklar", "stock_after": 10}	2026-06-12 15:37:13.21
766102eb-76c1-486a-8e0f-169e998ce76a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	01a5dabe-de4e-47e1-bbc9-0d60af135a4b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:37:53.409
17412aaf-21d4-43e1-a5c3-35ebe56e1689	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	e0fbe6c5-a1d3-421f-8d11-6b1fa67199c8	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:38:51.137
708f413f-f5dc-4646-a88d-1a4ce36b51a4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	e0fbe6c5-a1d3-421f-8d11-6b1fa67199c8	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "Fuse tea", "price": 0, "barcode": "4780137640299478013764021347800726601614780068020023478010173426946000680580584780069000826", "category": "Ichimliklar", "stock_after": 20}	2026-06-12 15:38:51.195
52602733-4517-470b-bb2f-63038491e430	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	7dcb603c-2183-4ecc-a20b-6f22115197b2	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:40:00.695
e32ab73f-8202-4141-8bea-aa17cd51ec44	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	7dcb603c-2183-4ecc-a20b-6f22115197b2	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "Аис Теа", "price": 0, "barcode": "47801376402994780137640213478007266016147800680200234780101734269460006805805847800690008264780101732340", "category": "Ichimliklar", "stock_after": 19}	2026-06-12 15:40:00.752
00bff5e7-f742-4bcd-9b97-effeba1f17d4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	9b8b5049-1d95-491c-baf4-0b4adceb8f52	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:40:20.276
e36fc437-29bd-4091-a7da-4bc11f7565f3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	9b8b5049-1d95-491c-baf4-0b4adceb8f52	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "БезГаз", "price": 0, "barcode": "478013764029947801376402134780072660161478006802002347801017342694600068058058478006900082647801017323404780136570016", "category": "Ichimliklar", "stock_after": 29}	2026-06-12 15:40:20.354
9da71a31-5e5a-4082-a334-7b700dc055bf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	f888b38b-0201-484c-8aef-d3bcb8854950	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:41:28.544
abd577d3-e253-4a3f-99a6-b0f3554e489b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	f888b38b-0201-484c-8aef-d3bcb8854950	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "RedBull", "price": 0, "barcode": "47801376402994780137640213478007266016147800680200234780101734269460006805805847800690008264780101732340478013657001690415258", "category": "Ichimliklar", "stock_after": 13}	2026-06-12 15:41:28.6
dfd555d7-d6f2-4a07-80e9-ad1ca0014a90	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:42:00.356
476bc8b3-4edc-43eb-9136-3b405c8c8f05	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	52b2295f-6ed6-4596-9f8c-49b96a78974c	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "18+", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "47801376402994780137640213478007266016147800680200234780101734269", "quantity": 10, "product_id": "ba62679b-176a-473c-81b0-1f156361df92", "after_quantity": 10, "before_quantity": 10}	2026-06-12 15:42:02.02
779407cd-e5d5-4599-8b82-2acafc8bbe6d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	0cc1edd1-c65d-4332-9484-9555b5ea4b0e	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:42:07.795
deabdd21-ed24-440b-bb9c-673988a21294	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	0cc1edd1-c65d-4332-9484-9555b5ea4b0e	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:42:14.81
c7593eea-434b-490f-b557-5a80d4fe1198	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	a447b302-fcc0-4a85-833f-f86236329fe4	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:43:52.715
ff53e104-daff-4232-8df2-364fe5ea57aa	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	56adf74c-2335-45ce-bd45-8998b6047bdb	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "B fresh", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "478013764029947801376402134780072660161", "quantity": 23, "product_id": "0cc1edd1-c65d-4332-9484-9555b5ea4b0e", "after_quantity": 23, "before_quantity": 23}	2026-06-12 15:42:16.458
6aa29379-e041-4c6d-a25f-fa6e64d4f05a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	f9010df5-ed1a-4f02-868d-eb730eb868b8	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:42:20.344
bc86dc4e-5a3a-48f9-b6fa-0b1abcb20539	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	db3a1ced-e9e7-4d6c-9594-4eb67646f760	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "water", "name": "ERMAK сушкв", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "4780102760304460706500086862211340127124607065001445478010276011347801469038811616347801027601374780102760144481027900469038812104404294780102760120027601994780102760478013764005347801376401524780035860010137", "quantity": 3, "product_id": "f9010df5-ed1a-4f02-868d-eb730eb868b8", "after_quantity": 3, "before_quantity": 3}	2026-06-12 15:42:21.978
9a761fd1-97b5-4f1c-a5be-fc361b811149	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	a438fe77-74a0-4a86-87c5-6de222ea6373	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:42:32.198
0d4f7c3e-2b7a-44eb-b03f-cbb104b9faa7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	95a5bc7a-1d16-4b20-a054-bfa1f94a152a	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "Flash Kichik", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "4780137640299478013764021347800726601614780068020023", "quantity": 10, "product_id": "a438fe77-74a0-4a86-87c5-6de222ea6373", "after_quantity": 10, "before_quantity": 10}	2026-06-12 15:42:33.838
7254fc51-26a0-4d30-9685-e0d27028d53d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	2d7ca282-2a5a-4033-ad5d-f8b52652e595	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:42:40.85
93ab2af1-3eb9-4d07-92ee-a589d751a879	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	95899c6e-5a44-4fe4-9505-8b9acbb76eb2	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "fish", "name": "Flint Kishik", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "47801027603044607065000868622113401271246070650014454780102760113478014690388116163478010276013747801027601444810279004690388121044042947801027601200276019947801027604780137640053137", "quantity": 16, "product_id": "2d7ca282-2a5a-4033-ad5d-f8b52652e595", "after_quantity": 16, "before_quantity": 16}	2026-06-12 15:42:42.048
08bfc823-f9a4-4b39-a64e-168ab7e66045	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	0298f745-84fd-44b7-b8f5-301f70a5d8a8	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:42:48.071
b7edbb14-ea8c-4932-80ae-ca7c4a9aa561	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	e6bbc208-0c3b-4988-aef4-d2c5334c0dad	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bread", "name": "Flint Mega Pachka", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "478010276030446070650008686221134012712460706500144547801027601134780146903881161634780102760137478010276014448102790046903881210440429478010276012002760199478010276047801376400534780137640152137", "quantity": 2, "product_id": "0298f745-84fd-44b7-b8f5-301f70a5d8a8", "after_quantity": 2, "before_quantity": 2}	2026-06-12 15:42:49.739
713fc36e-fa26-4739-89f5-834d79a7a3ec	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	0298f745-84fd-44b7-b8f5-301f70a5d8a8	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:42:54.322
6bb9f946-a25a-4846-9b44-a18346223a6c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	e6bbc208-0c3b-4988-aef4-d2c5334c0dad	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bread", "name": "Flint Mega Pachka", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "478010276030446070650008686221134012712460706500144547801027601134780146903881161634780102760137478010276014448102790046903881210440429478010276012002760199478010276047801376400534780137640152137", "quantity": 2, "product_id": "0298f745-84fd-44b7-b8f5-301f70a5d8a8", "after_quantity": 2, "before_quantity": 2}	2026-06-12 15:42:55.667
21eac3ff-640d-4472-a6e8-278daaa4c83c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	e0fbe6c5-a1d3-421f-8d11-6b1fa67199c8	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:43:00.984
7a4b2ce5-8fe4-45b0-b69a-c8093d6ab0aa	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	6dab4514-e438-4af1-81ca-f7419daf63f5	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "Fuse tea", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "4780137640299478013764021347800726601614780068020023478010173426946000680580584780069000826", "quantity": 20, "product_id": "e0fbe6c5-a1d3-421f-8d11-6b1fa67199c8", "after_quantity": 20, "before_quantity": 20}	2026-06-12 15:43:02.672
12738f57-64d8-4d44-8d5e-0e8f9d311dec	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	1b76fc7b-1e64-48bb-9a0e-b446a4a43e95	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:43:07.43
a6358eaa-da6a-4a40-8696-30d197486495	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	1374ed76-97b3-4946-9d8c-cdf823b5b7dc	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "chicken", "name": "Grenki kichik", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "4780137640299", "quantity": 11, "product_id": "1b76fc7b-1e64-48bb-9a0e-b446a4a43e95", "after_quantity": 11, "before_quantity": 11}	2026-06-12 15:43:09.147
3b60c6b1-b2d5-49b2-86cb-0f544680f09f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	a8d7a5f3-b978-4d4e-93e0-897fb590eaac	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:43:14.99
0d9cf415-a39a-4669-b0da-df07c9e5d3d9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	f55548ba-fd3d-4c92-9487-5ef8f2b3292f	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "burger", "name": "Grenki Kotta", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "47801376402994780137640213", "quantity": 2, "product_id": "a8d7a5f3-b978-4d4e-93e0-897fb590eaac", "after_quantity": 2, "before_quantity": 2}	2026-06-12 15:43:16.005
3080a99f-6513-4b1c-84c3-5cdec47b6a7b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	5cd0fdb9-451d-4c5a-b32d-80585cf46eb9	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:43:25.21
cd970f21-c9c8-4a7f-a213-9c3b8db50857	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	201a1105-8861-4f5c-8154-82fb789d9abd	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bread", "name": "Lays 37г", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "478010276030446070650008686221134012712460706500144547801027601134780146903881161634780102760137478010276014448102790004294780102760120027601994780102760137", "quantity": 10, "product_id": "5cd0fdb9-451d-4c5a-b32d-80585cf46eb9", "after_quantity": 10, "before_quantity": 10}	2026-06-12 15:43:26.619
8c708c77-94d1-403a-856a-0daaa03688f8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	f3759cbd-9e91-441f-ae59-9845e2e864d4	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:43:33.938
965898d5-d162-4d53-b21e-f3af919397c7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	fbc097d3-dd90-4988-b1e1-3899d0e275b1	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "Lays 70г", "type": "adjustment", "price": 20000, "reason": "dashboard product update", "barcode": "4780102760304460706500086862211340127124607065001445478010276011347801469038811616347801027601374780102760144481027900469038812104404294780102760120027601994780102760137", "quantity": 1, "product_id": "f3759cbd-9e91-441f-ae59-9845e2e864d4", "after_quantity": 1, "before_quantity": 1}	2026-06-12 15:43:35.824
599ed98d-882c-416a-bf8c-5f9f00a0e2aa	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	58ca5e9c-0755-4373-83be-6ec4dbd85ffe	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:43:43.065
ef243360-e23b-4f7d-92f4-c521a4242824	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	f888b38b-0201-484c-8aef-d3bcb8854950	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:44:14.716
ba299a55-216a-4ceb-825b-8200db3dbee7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	171bae16-10b0-47c1-96ca-083eb65895c8	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "RedBull", "type": "adjustment", "price": 22000, "reason": "dashboard product update", "barcode": "47801376402994780137640213478007266016147800680200234780101734269460006805805847800690008264780101732340478013657001690415258", "quantity": 13, "product_id": "f888b38b-0201-484c-8aef-d3bcb8854950", "after_quantity": 13, "before_quantity": 13}	2026-06-12 15:44:16.035
90c80628-ccb7-42ec-bf0e-88ce18e1c655	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	66c6f72a-2ef1-4ab9-b818-c7edd78457ad	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:44:22.849
84495db3-93c7-4526-b497-3ab2d7f30847	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	cce94104-537c-4f42-9074-0261cfda4716	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "SNIKERS", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "4780102760304460706500086862211340127124607065001445", "quantity": 17, "product_id": "66c6f72a-2ef1-4ab9-b818-c7edd78457ad", "after_quantity": 17, "before_quantity": 17}	2026-06-12 15:44:24.229
833be219-de7c-43dc-8a35-ad02c14da9f8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	978ee6cc-d260-4018-8723-8adff4d4aaf8	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:44:34.584
86e84ba5-c1b8-4032-b73f-12711a684a67	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	dfc84ba0-14ee-4b1a-b1a8-8bf4df2bb05a	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "TWIX", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "478010276030446070650008686221134012712", "quantity": 10, "product_id": "978ee6cc-d260-4018-8723-8adff4d4aaf8", "after_quantity": 10, "before_quantity": 10}	2026-06-12 15:44:36.214
a6910115-9792-41c9-a9de-48f2f1dd52b3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	7dcb603c-2183-4ecc-a20b-6f22115197b2	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:44:43.368
f4c2e27a-5188-4310-80c7-6c4b801123b8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	3347c334-68e7-4094-a5bf-791251fe73ca	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "Аис Теа", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "47801376402994780137640213478007266016147800680200234780101734269460006805805847800690008264780101732340", "quantity": 19, "product_id": "7dcb603c-2183-4ecc-a20b-6f22115197b2", "after_quantity": 19, "before_quantity": 19}	2026-06-12 15:44:44.858
b64bb2c6-96c6-4421-b523-b3f68be0bcb3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	9b8b5049-1d95-491c-baf4-0b4adceb8f52	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:44:53.977
9b4910cc-58b2-4968-a96f-16e4fd243e2b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	41dac303-275f-45e1-96f9-614bbb5648b4	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "БезГаз", "type": "adjustment", "price": 5000, "reason": "dashboard product update", "barcode": "478013764029947801376402134780072660161478006802002347801017342694600068058058478006900082647801017323404780136570016", "quantity": 29, "product_id": "9b8b5049-1d95-491c-baf4-0b4adceb8f52", "after_quantity": 29, "before_quantity": 29}	2026-06-12 15:44:55.832
5276bd2c-ead3-4d2b-87a7-d23af62d7f5c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	f540f44e-9244-4f00-8184-afcdd580cc5f	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:44:59.933
51389151-3280-49a7-af9d-046984c707d6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	56587cf0-a18b-4a6f-946c-d6e4d48bad39	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "Шурданак M", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "4780102760304460706500086862211340127124607065001445478010276011347801478010276013747801027601444780102760120027601994780102760137", "quantity": 5, "product_id": "f540f44e-9244-4f00-8184-afcdd580cc5f", "after_quantity": 5, "before_quantity": 5}	2026-06-12 15:45:00.969
d30844b2-8296-4941-82f0-af5ed409e6db	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	01a5dabe-de4e-47e1-bbc9-0d60af135a4b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:45:05.98
8ff568e7-2fc1-4a93-a0e6-8c3a8c709abf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	d7e29204-ab72-43ea-afc2-868bceb65cbe	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "Мохито", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "478013764029947801376402134780072660161478006802002347801017342694600068058058", "quantity": 3, "product_id": "01a5dabe-de4e-47e1-bbc9-0d60af135a4b", "after_quantity": 3, "before_quantity": 3}	2026-06-12 15:45:07.711
ec5aca7a-abef-427c-838e-212d5e5e1f86	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	a1d6a446-3e0c-4a20-951e-50c7b1b34fa4	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:45:11.68
90d7e05e-b0bf-4e06-bf2b-35771bdb5ab3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	34505e30-2706-4782-91a5-e9fb5fc9e7a6	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "Пластик курт", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "4780102760304", "quantity": 14, "product_id": "a1d6a446-3e0c-4a20-951e-50c7b1b34fa4", "after_quantity": 14, "before_quantity": 14}	2026-06-12 15:45:15.292
2d750045-405e-4508-a145-301781512ca3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	01a5dabe-de4e-47e1-bbc9-0d60af135a4b	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:45:17.495
a9572679-79b5-4182-aff3-45b903e65902	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	d7e29204-ab72-43ea-afc2-868bceb65cbe	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bottle", "name": "Мохито", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "478013764029947801376402134780072660161478006802002347801017342694600068058058", "quantity": 3, "product_id": "01a5dabe-de4e-47e1-bbc9-0d60af135a4b", "after_quantity": 3, "before_quantity": 3}	2026-06-12 15:45:19.43
42239895-9f60-4bc0-b386-cea25cc72bca	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	66a5b903-2d53-4886-ade1-6238c28969e6	\N	\N	0.000000000000000000000000000000	{}	2026-06-12 15:45:25.637
68507f0a-694d-4876-ab2f-51478ff56061	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	84e45ffb-80d7-4179-83df-b923e418d801	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "bread", "name": "Фисташки М", "type": "adjustment", "price": 10000, "reason": "dashboard product update", "barcode": "478010276030446070650008686221134012712460706500144547801027601134780147801027601374780102760120027601994780102760137", "quantity": 12, "product_id": "66a5b903-2d53-4886-ade1-6238c28969e6", "after_quantity": 12, "before_quantity": 12}	2026-06-12 15:45:27.325
9377c0b9-76ac-4077-87fd-415bc4bf72fc	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-15 08:51:03.991
113ab284-3009-44ae-9a20-a2232035a5ac	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-15 08:57:15.455
44beac6a-e5b3-4ac1-8b53-9062e4c7ab1c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-15 09:08:35.884
d6d8cfa4-e2f7-421a-982c-d3e2a293d0b8	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-15 12:05:47.71
805e46fc-7c47-454e-9e24-57cbd67afa91	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-15 12:06:45.283
ed41487d-5ab2-4097-8c2a-d4c2e48ad935	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-15 12:18:46.506
b96d9192-84d1-4813-9424-02af06293667	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	8a4de02e-ed8b-436f-a29b-1486396453aa	7560ac62-9494-4ba7-95c8-23d3e3313943	8a4de02e-ed8b-436f-a29b-1486396453aa	0.000000000000000000000000000000	{}	2026-06-15 12:22:28.02
7a589494-1bc6-42de-95b4-abbc2bd0d17e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-15 12:22:28.425
126d55bb-f35f-4e4b-bb24-4848b63585e6	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-15 12:47:26.139
3851b422-6fd8-4de1-8054-99f16d1e196f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	booking_no_show	booking	6529a4ae-3ce9-4f8c-9ef1-458317f8c218	\N	\N	0.000000000000000000000000000000	{}	2026-06-15 13:02:49.402
62726067-afec-4420-878e-5dd75b7821ad	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-16 08:04:55.68
6922e5bc-10cf-49bf-8cca-0000e8e1874f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-16 08:05:00.15
b8be99b4-7c81-4f77-86df-67f83056465d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-16 09:00:36.873
8f85fca9-92dc-41fc-bd36-a3fb3dbb7cce	\N	2ab18278-557a-416c-a142-aae3cf6ea6d8	Developer	dev	login	user	2ab18278-557a-416c-a142-aae3cf6ea6d8	\N	\N	0.000000000000000000000000000000	{}	2026-06-16 10:57:39.582
9123af0a-fd94-4724-85ae-6b7927aa3860	\N	2ab18278-557a-416c-a142-aae3cf6ea6d8	Developer	dev	login	user	2ab18278-557a-416c-a142-aae3cf6ea6d8	\N	\N	0.000000000000000000000000000000	{}	2026-06-16 10:57:46.987
a73e1c78-afb7-4ea9-b444-5405f5c9c88b	\N	2ab18278-557a-416c-a142-aae3cf6ea6d8	Developer	dev	login	user	2ab18278-557a-416c-a142-aae3cf6ea6d8	\N	\N	0.000000000000000000000000000000	{}	2026-06-16 11:04:50.674
465484b4-43be-4cd8-9c11-725b745dffc3	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	0.000000000000000000000000000000	{}	2026-06-16 12:01:08.422
b0074211-80a9-41cf-8914-32044904a767	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-16 13:03:21.732
5a6acd9c-c226-4b68-96a2-ef452d26f889	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 06:40:12.972
57e17612-b9ae-4cd5-87fa-56bdc3a60381	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	booking_cancelled	booking	3b9bcf86-c14f-4c42-a6cd-dc1b0510faff	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 07:06:41.997
7017490c-343d-4b4c-8d67-049e95a6d4f7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	tariff_created	tariff	7ec67be7-9e4a-4ac0-ba71-e21996cdafd5	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 07:24:48.562
0999fbd8-1334-4f77-b3de-2e5c76d5bbee	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	tariff_deleted	tariff	7ec67be7-9e4a-4ac0-ba71-e21996cdafd5	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 07:24:56.511
2a680a57-04ef-4a68-90fa-fdd55b7fe02f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	customer_created	customer	ced4930c-9a08-4434-a233-43d08364a850	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 07:59:16.666
1ce4c242-bf7c-4062-8824-d2a85ba73589	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	booking_created	booking	0ba35763-037c-4839-801f-244e0098abf1	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 07:59:39.472
c7e04e65-572f-4701-b92e-128128a6e6dc	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 09:37:54.523
7f02fae4-fe1c-4602-b0db-96cbaae1edc7	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 10:59:13.509
5935203f-4e77-4d1f-b155-34ccb5c17671	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 10:59:58.617
f5cbe7db-d940-4a4b-afae-812001fb0f58	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 11:01:08.466
e45aad3d-6e05-4c8d-9811-814cb8d6df37	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 11:01:10.822
f87584be-02de-4d2e-a37c-a37575eabe20	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 11:02:51.213
81b15f4a-f84b-4c59-8014-4c4b6db3c8b0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-01"}	2026-06-25 16:00:26.826
0a548e4f-4469-45e3-8131-343698effa24	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	shift_opened	shift	09d7b689-5ba5-47c4-84e2-1ec1787f38cb	\N	\N	0.000000000000000000000000000000	{"shift_type": "Kunduzgi (09:00 - 18:00)", "starting_cash": 175000}	2026-06-17 11:03:42.216
e369b379-f135-4478-8bec-8ea786f9781b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 11:06:07.421
83059c29-0417-4012-b010-5fe6c4728c80	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	shift_opened	shift	99c1f6bf-889f-4188-bc53-d17d3a4c7a60	\N	\N	0.000000000000000000000000000000	{"shift_type": "Kunduzgi (09:00 - 18:00)", "starting_cash": 175000}	2026-06-17 11:06:57.27
521785a2-481c-4bf0-a5ba-062d0785fbe3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 18:10:37.823
14b0c979-e83e-4a72-adfa-12f1d80196d9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:02:54.805
9db7b44c-f082-46df-85a6-ba93e0955c5c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 12:21:05.424
3caa4c61-b3cd-44ad-b58b-8179e376e7bf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	login	user	67005460-527d-4723-915f-8ff20067e42d	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 16:08:33.224
c0bbe293-367d-473b-9358-7b1d41158f41	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 16:17:32.471
6b78205a-9d53-42c6-8abd-879c277a8e9d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 16:17:34.998
3f885af4-fe71-4f8d-a9ac-83a13b3ac62d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 16:17:36.024
85e40658-0d10-4163-8ff6-8c89584b0ba3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 16:17:36.803
910fdf81-1c4e-405a-8676-01b88d3746bc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 16:17:37.631
b3756e49-8579-4b26-8a0e-317e0d709ea9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 16:17:39.514
dfe4cd2f-6a6a-4c90-8bcf-37e596cc3af8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 16:17:41.303
3937279e-5459-48ad-b6fa-9928dd2affdb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	password_changed	user	67005460-527d-4723-915f-8ff20067e42d	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 16:18:13.068
364a5c17-7ad5-4a77-94cf-ef870a1950c5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	customer_created	customer	58dceacf-f773-4e62-bd9e-7748904919fa	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 16:56:28.038
5d6430e5-96d5-4df1-8527-7e4ecfd8d896	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	booking_created	booking	5373adad-8144-4c59-ac74-079e6edf410a	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 16:56:37.478
66671464-1e3a-4bea-8f83-f5fdbba468a3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	booking_arrived	booking	5373adad-8144-4c59-ac74-079e6edf410a	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 16:57:30.834
76b214a1-ebf6-4e2e-957c-cd0926012f46	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	customer_created	customer	ccdf825e-dcde-4fca-aac0-f4c571cc7b27	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 16:58:21.193
7dd64bc4-0a33-467d-8a35-a8cc3058f8be	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	booking_cancelled	booking	5373adad-8144-4c59-ac74-079e6edf410a	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 16:59:10.843
7602db99-5c07-406f-9d24-d00b6520a86a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	booking_created	booking	4f43fec8-3895-43d0-8bb6-c13fc99560fd	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 16:59:42.637
eed5e0bf-36ee-4c4c-b2de-65987ac88b34	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_updated	product	a447b302-fcc0-4a85-833f-f86236329fe4	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 17:02:07.066
f9b32a21-c1d4-45d2-ad6f-ca39b88e9520	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	inventory_updated	inventory	2d69091a-3f30-419f-89c9-23ad0651fd41	\N	\N	0.000000000000000000000000000000	{"cost": 0, "icon": "snack", "name": "M&Ms", "type": "adjustment", "price": 15000, "reason": "dashboard product update", "barcode": "4607065000868", "quantity": 7, "product_id": "a447b302-fcc0-4a85-833f-f86236329fe4", "after_quantity": 7, "before_quantity": 7}	2026-06-17 17:02:07.764
fc0e1ef4-fa41-4e7d-9e1e-f2e72c865137	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a447b302-fcc0-4a85-833f-f86236329fe4	\N	\N	0.000000000000000000000000000000	{"barcode": "4607065000868"}	2026-06-17 17:02:09.961
d9a6ef8e-1c72-4528-bc71-16973bfea53b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a447b302-fcc0-4a85-833f-f86236329fe4	\N	\N	0.000000000000000000000000000000	{"barcode": "4607065000868"}	2026-06-17 17:02:19.473
72f43822-1c9a-456a-a7bc-f163d6107825	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a447b302-fcc0-4a85-833f-f86236329fe4	\N	\N	0.000000000000000000000000000000	{"barcode": "4607065000868"}	2026-06-17 17:02:22.87
3b29e771-39b2-4191-bdec-54a26d16aded	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a447b302-fcc0-4a85-833f-f86236329fe4	\N	\N	0.000000000000000000000000000000	{"barcode": "4607065000868"}	2026-06-17 17:02:26.11
d68bb8e6-7688-4d0b-96a5-4b51825938c6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a447b302-fcc0-4a85-833f-f86236329fe4	\N	\N	0.000000000000000000000000000000	{"barcode": "4607065000868"}	2026-06-17 17:02:26.854
11782f6a-65b5-483a-b8b3-63d18f599737	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a447b302-fcc0-4a85-833f-f86236329fe4	\N	\N	0.000000000000000000000000000000	{"barcode": "4607065000868"}	2026-06-17 17:02:27.376
496def52-0e4f-4caf-ab04-2113ea09a6bd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	a447b302-fcc0-4a85-833f-f86236329fe4	\N	\N	0.000000000000000000000000000000	{"barcode": "4607065000868"}	2026-06-17 17:02:45.608
22b18581-9a45-4fb5-9cd4-510805746781	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-17 19:02:39.176
348197b5-4a89-431e-a5e7-d64e89f53fc5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:03:38.293
5f097336-ccc1-4ced-8925-8e3f59c14cec	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:04:10.185
bdec0047-deaf-449b-9d4d-4ddabce01de1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:04:56.84
10644a10-a125-4176-97d3-367c667cd75b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:10:02.805
50bf357d-1064-4267-84b9-89c68fabbab9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:11:27.655
4a021973-64af-4289-84e8-ade0281a5a71	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:11:38.656
bd622c69-741d-4fcd-a29c-f4d988871b3f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:11:48.069
0e5a14e6-8831-4efb-bdc4-5215b54adc78	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	stop_session	session	7a22c4d5-83c0-4b0f-a8c8-8c07252340a4	c2a40555-3e9a-4a41-aa26-858577f1676f	7a22c4d5-83c0-4b0f-a8c8-8c07252340a4	0.000000000000000000000000000000	{}	2026-06-17 19:11:55.545
ca3e3828-087e-484f-96b0-ced703cf38fb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:11:57.511
4c297049-96fa-477b-8e55-2e9849812c7a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:12:00.318
738e9c7e-3898-4c7f-bb00-0fec942f5c70	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:12:02.203
01cdcfda-e5fb-4ea5-80f8-1d9443074536	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:12:05.057
f050e21c-8567-4c59-8dc6-8f4a9ca0a17d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:12:08.348
ca322c0e-5bbe-4e19-bb58-fed9dce74f9f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:12:12.175
bd3fa69f-e342-4c09-b197-5d007943f1a1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:12:27.76
dd4e1be9-9721-4c4f-8567-88bc053d4ffe	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-17 19:12:32.346
35b03d84-25c6-4f32-bd82-c8bab66caad9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-17 19:13:08.127
aa1e56b9-658f-48df-9cb0-79850e12506f	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	0.000000000000000000000000000000	{}	2026-06-18 07:22:33.035
08c1f6c1-83e6-4393-8d15-957aa5f77582	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	customer_created	customer	20222f92-3770-4b88-895a-f0ab6d2a03ed	\N	\N	0.000000000000000000000000000000	{}	2026-06-18 07:24:31.185
4283b453-aa12-4134-af5f-d283f8ffe915	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-18 07:46:45.208
ca7a5a5d-cb2c-45eb-9710-86086e8b1440	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	stop_session	session	7b067a26-3b21-40a8-a8b6-b42587785623	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	7b067a26-3b21-40a8-a8b6-b42587785623	0.000000000000000000000000000000	{}	2026-06-18 07:50:15.763
3fb98f0b-e917-44e8-8acd-59a9583af899	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-18 07:50:20.105
b2a3d279-dc30-485e-a8b0-4928513f4445	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	booking_created	booking	c17c2708-3c14-4a0d-96ff-8a4d9546e608	\N	\N	0.000000000000000000000000000000	{}	2026-06-18 08:20:49.776
5c252d96-a4b2-49fa-8b37-0422f732288f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-18 08:21:10.539
d6ce9783-019f-487f-b83b-1da0ed36bb52	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	stop_session	session	d5bd811f-a445-4d11-a7db-54b653efe0a3	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	d5bd811f-a445-4d11-a7db-54b653efe0a3	0.000000000000000000000000000000	{}	2026-06-18 08:21:10.953
9966b04b-eabf-483b-a1fb-62c0a4e74c9a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	booking_arrived	booking	c17c2708-3c14-4a0d-96ff-8a4d9546e608	\N	\N	0.000000000000000000000000000000	{}	2026-06-18 08:23:25.849
5d7a7fea-388d-42b7-be00-b4819bd02436	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	booking_cancelled	booking	c17c2708-3c14-4a0d-96ff-8a4d9546e608	\N	\N	0.000000000000000000000000000000	{}	2026-06-18 08:23:45.359
379241d8-1f98-4b2c-94f8-588b263fdb50	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	booking_created	booking	ca92b7c5-79a7-41d7-88c0-da5960c07a29	\N	\N	0.000000000000000000000000000000	{}	2026-06-18 11:55:38.824
3f1db548-2e6f-49c8-84c6-765c5b37af1b	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	0.000000000000000000000000000000	{}	2026-06-18 11:56:41.902
faa80502-7833-45bc-b51a-a82894bb6604	\N	2ab18278-557a-416c-a142-aae3cf6ea6d8	Developer	dev	login	user	2ab18278-557a-416c-a142-aae3cf6ea6d8	\N	\N	0.000000000000000000000000000000	{}	2026-06-18 11:57:34.276
10ce65f1-fe9e-4537-bb24-43d0a38cb2f9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	booking_arrived	booking	ca92b7c5-79a7-41d7-88c0-da5960c07a29	\N	\N	0.000000000000000000000000000000	{}	2026-06-18 11:58:57.552
b4608f5e-da58-4cf4-ab60-481f86385c1b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-18 11:59:03.964
7380271f-212a-4230-ae4e-2a31b03afc85	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-18 11:59:20.444
fa8be1a8-4605-441b-b500-7d6abc873496	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	tariff_updated	tariff	495afbd8-177b-42c5-bf8e-0f876335cf83	\N	\N	0.000000000000000000000000000000	{}	2026-06-18 12:33:10.673
4ad29e9f-439c-41b2-a309-4f90359556b1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	tariff_updated	tariff	495afbd8-177b-42c5-bf8e-0f876335cf83	\N	\N	0.000000000000000000000000000000	{}	2026-06-18 12:33:11.651
2329f6bb-bbb2-4dc4-99a6-1233938fa8b6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	tariff_updated	tariff	264d20d4-29eb-4f1c-bab9-53244a9e396c	\N	\N	0.000000000000000000000000000000	{}	2026-06-18 12:33:31.849
86e59e09-fa35-449f-b127-564f5512613a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0b72p9t5ck7"}	2026-06-18 13:08:45.355
531a8170-6595-4a42-ad57-50e9b3342d0e	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	0.000000000000000000000000000000	{}	2026-06-19 07:22:50.16
43759dec-332a-497a-b11b-6c7f5152fc1b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-25 14:28:30.47
87934adf-e954-4312-b3ee-f054b19c5c81	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	stop_session	session	4c90b3ba-7faf-491c-9049-c807cc2056f1	7560ac62-9494-4ba7-95c8-23d3e3313943	4c90b3ba-7faf-491c-9049-c807cc2056f1	0.000000000000000000000000000000	{}	2026-06-25 14:28:39.776
72b89670-6a79-435e-b3a3-2c9b08190fb4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-25 14:28:41.983
b4054186-37ff-4065-9a88-96746bb39caa	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-25 14:29:44.837
a9bc070b-cd78-4d2c-ac25-b7f0c2be59cf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-25 14:30:41.117
4201ce75-6cb1-4094-b1ba-7d176252e617	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-25 14:30:45.642
6769c66d-8304-4fae-9fa5-7758d251d594	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-25 14:35:10.993
6c1f43a7-0bdd-4541-b249-eadae6097b9a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-25 14:35:15.03
8023173a-9c02-4575-b6a2-2a6bb6f3b240	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-vip-2"}	2026-06-25 16:43:36.332
d4abc579-ac23-4eec-93d1-dcd0d72fdc71	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	0.000000000000000000000000000000	{}	2026-06-25 16:46:55.093
88d76304-7530-4c5e-995c-ac1df033718e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-25 15:27:17.935
af5ea454-4fd2-455e-b324-79ac93085b33	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	booking_created	booking	849855cb-38f7-4f26-acf4-ae36c251ffb9	\N	\N	0.000000000000000000000000000000	{}	2026-06-25 15:28:52.812
c464db8d-86f4-4e72-80cf-8c7219644ef1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	a642a180-6aa6-4107-a961-a0d9aa60cd2b	c2a40555-3e9a-4a41-aa26-858577f1676f	a642a180-6aa6-4107-a961-a0d9aa60cd2b	0.000000000000000000000000000000	{}	2026-06-25 15:30:13.663
6c9fafcb-6224-4854-ab33-38922d88fd37	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-25 15:30:15.315
8b16192e-b7fe-4d3f-921c-1f97e96373fa	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	booking_arrived	booking	849855cb-38f7-4f26-acf4-ae36c251ffb9	\N	\N	0.000000000000000000000000000000	{}	2026-06-25 15:31:07.317
1a6349af-ef8f-4769-a44d-32f1f6583df3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	edc88b19-c3ed-4443-a385-1ea602aadfde	c2a40555-3e9a-4a41-aa26-858577f1676f	edc88b19-c3ed-4443-a385-1ea602aadfde	0.000000000000000000000000000000	{}	2026-06-25 15:32:39.678
a2bd7e11-23f8-4853-9df8-94334e0856b6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-25 15:32:40.03
65a04e37-5cbf-466b-ab4b-654b606604c9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-25 15:46:54.612
5116ddf4-8800-43d1-8b34-03115694f934	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-25 15:47:00.026
46d0d77d-5978-4612-8cf6-42069fa12e80	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "home-pc"}	2026-06-25 15:47:14.725
a486d1fc-ae25-4a75-b54d-b26cde2896bf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-07"}	2026-06-25 15:59:59.32
f8973899-4489-4a74-a5c0-e5570d3f55c1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	maintenance_opened	repair_request	03e4f5bb-d3a6-46da-976d-9d2f2b996314	0f9ded33-8c57-4249-a1a6-54852a53ccfe	\N	0.000000000000000000000000000000	{}	2026-06-25 16:00:45.966
a8ac211b-0509-47db-911b-830481e0d993	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	booking_cancelled	booking	849855cb-38f7-4f26-acf4-ae36c251ffb9	\N	\N	0.000000000000000000000000000000	{}	2026-06-25 16:02:39.445
1bb37a46-db64-47a2-b3e6-e128216694d1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	80523d10-4c79-4ed8-8556-d027343df565	c2a40555-3e9a-4a41-aa26-858577f1676f	80523d10-4c79-4ed8-8556-d027343df565	0.000000000000000000000000000000	{}	2026-06-25 16:03:31.849
3fbd71a9-1772-43dd-b9a1-488cb9372b69	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-25 16:03:32.288
e9fb65fa-d7f4-4645-bc09-b093d09271f5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-03"}	2026-06-25 16:04:34.949
2a409def-1e29-4275-9416-0905968f709e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	b33ebbbb-d1bf-4263-8ca7-64c04bf252af	d689a237-dec7-4e5c-8b23-8b9257c805b5	b33ebbbb-d1bf-4263-8ca7-64c04bf252af	0.000000000000000000000000000000	{}	2026-06-25 16:15:36.071
57c0d48a-988b-41de-acb5-2b96b91309c2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-03"}	2026-06-25 16:15:36.517
12b42682-5eb0-4ee8-a54e-3ee3511b99ec	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-25 16:15:48.785
c4b41098-fa19-4c8d-a7ca-4bf4fb847ad1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	8abd94ff-d60c-435d-a9cc-b66c8d18c06a	0f9ded33-8c57-4249-a1a6-54852a53ccfe	8abd94ff-d60c-435d-a9cc-b66c8d18c06a	0.000000000000000000000000000000	{}	2026-06-25 16:15:49.648
d8dc60fb-4aa4-49a2-b4b0-d22c45cbba37	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-01"}	2026-06-25 16:15:50.46
438f3daa-b43d-46ea-a4df-a1c519569560	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	e711ac42-0638-44ce-b59f-85ccdd810b14	81e58e47-d95c-4d3f-a7e9-5ff88e251b65	e711ac42-0638-44ce-b59f-85ccdd810b14	0.000000000000000000000000000000	{}	2026-06-25 16:16:46.541
ae1042d5-cde7-4df9-89fd-4d77212fa0c4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-07"}	2026-06-25 16:16:46.943
04305136-12e5-45bb-9759-2da086fe566a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 22, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 23, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 21, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 16:20:08.471
fd71d20d-3fd9-4076-bf16-2c6541c7c7bc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 22, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 23, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 21, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 16:26:04.349
8185e94a-0877-4400-8315-cd049a06071f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 22, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 23, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 21, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 16:34:23.097
0bc64261-17eb-4281-97bb-57a9272e653c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-04"}	2026-06-25 16:34:33.721
2ffc1fe9-9eab-497b-9c3c-c93574d1327d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-05"}	2026-06-25 16:34:41.236
f66e0553-49fb-42b4-9836-c64e4298452d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-06"}	2026-06-25 16:34:46.957
042786bb-a65c-4b8b-9374-29dc5180a9f7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-06"}	2026-06-25 16:34:53.032
7379c164-635e-4a8d-a5fb-f516c1766b6f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	90c44abb-4814-4a53-8897-83426a50e674	81e58e47-d95c-4d3f-a7e9-5ff88e251b65	90c44abb-4814-4a53-8897-83426a50e674	0.000000000000000000000000000000	{}	2026-06-25 16:34:57.875
1e956ec4-1423-43c2-882a-df00821660f1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-07"}	2026-06-25 16:34:58.762
3cb48f60-69f8-417b-8040-79785deac087	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-07"}	2026-06-25 16:35:02.96
07f16db0-fa67-483f-947a-da7d87526b6d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 22, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 23, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 21, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 16:37:59.555
0915b822-afe5-4269-b189-afbdcf2d427a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-vip-2"}	2026-06-25 16:38:07.704
98a453d1-fdb1-432e-9273-e097ff91fb1d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 22, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 23, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 21, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 16:39:11.722
a1af6226-fe22-4d35-b98f-f6e3ba76bb56	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 22, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 23, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 21, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 16:42:27.842
feacf9fa-e2d3-46a2-b2cb-20c9c36c214b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 22, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 23, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 21, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 16:42:47.727
96586eed-9598-4e8a-b70f-ae6ef2cc374c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-vip-1"}	2026-06-25 16:42:56.777
9267ad14-165c-40a1-819a-219b024b0a0f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	3fe25825-9619-459c-a254-996e547f7fb1	07e923a0-e9bd-4683-8ef4-275ba3373d55	3fe25825-9619-459c-a254-996e547f7fb1	0.000000000000000000000000000000	{}	2026-06-25 16:43:34.323
785c137c-761d-47c7-94e2-d2ebe5113574	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	2380e790-8187-4a3c-96e4-0785b2e2dfff	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	2380e790-8187-4a3c-96e4-0785b2e2dfff	0.000000000000000000000000000000	{}	2026-06-11 13:55:10.605
fa33afe2-04c6-43c0-8c69-e09332ca4f37	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	0ce60b37-ec04-4e46-b763-4289ca6f721a	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	0ce60b37-ec04-4e46-b763-4289ca6f721a	0.000000000000000000000000000000	{}	2026-06-11 13:55:45.985
54406cd3-3e42-46b3-b201-3a3acd781cd1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 22, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 23, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 21, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 17:09:48.92
cb89bcd2-4981-4bf2-9c7f-02191954f293	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	aeb6a7b3-bbe0-4deb-8e81-a22cbe2ec3e8	81e58e47-d95c-4d3f-a7e9-5ff88e251b65	aeb6a7b3-bbe0-4deb-8e81-a22cbe2ec3e8	0.000000000000000000000000000000	{}	2026-06-25 17:22:28.121
6ea9c1ca-4272-43e8-8f83-9e92b6ba9990	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-07"}	2026-06-25 17:22:28.494
d847a1ed-d0e7-4860-8ae1-8f97fec719b3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	fa83530d-b8c9-439b-ba53-821c6078356d	5a2e84e4-503f-48bf-9491-c6d0c2a8828b	fa83530d-b8c9-439b-ba53-821c6078356d	0.000000000000000000000000000000	{}	2026-06-25 17:39:11.646
2d597e35-027d-4733-aa9c-aa6057ab48c3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-05"}	2026-06-25 17:39:12.131
eeec557d-8539-4ae1-a78f-29834952951e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	stop_session	session	d38f8548-df32-463c-852c-bc3a859db2e8	5a2e84e4-503f-48bf-9491-c6d0c2a8828b	d38f8548-df32-463c-852c-bc3a859db2e8	0.000000000000000000000000000000	{}	2026-06-25 17:41:42.936
f89573ec-20d1-4ec8-96fb-cd224550e357	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "pc-05"}	2026-06-25 17:41:43.389
b0b8465a-90c8-4169-9bf6-e18b6e742234	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 22, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 23, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 21, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 17:42:54.211
22e19ec7-a3ec-48f9-ab24-78143ecd3f19	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 22, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 23, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 21, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 17:43:04.842
69c84564-7cb1-48c6-9f33-1073d27e9860	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 18:03:10.887
ca956584-a2c5-4e91-86b8-61b3ee23a01d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 19:12:44.384
fdac4d0e-ab18-4964-bf9a-9d60049f8f03	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 19:14:41.773
df252988-0157-4fe6-ae3e-3ecb3fdc8617	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-25 19:15:26.984
713a59e6-3bc7-45af-8668-7bb6bb5cebc5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-26 07:15:37.063
f861bb72-ab55-4aeb-a2c7-f73928cd7b59	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	shift_opened	shift	ccb60595-93ce-4678-8ce5-a60a7eb458bf	\N	\N	0.000000000000000000000000000000	{"shift_type": "Tungi (19:00 - 03:00)", "starting_cash": 6555000}	2026-06-26 08:09:36.418
5f509225-a704-4a28-9672-a22ebf5b9d4e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-26 09:24:28.096
1381b507-f7e8-4fa7-84e3-a5759a521f19	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-26 09:27:58.489
dfce4543-5e16-4fdd-84cf-492d94ea6ba8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	simulator_locked	rig_mvp	\N	\N	\N	0.000000000000000000000000000000	{"rig_id": "win-0kakft78on1"}	2026-06-26 09:52:41.02
26d40d34-2b0a-43c2-a4da-425f4078e64c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-26 15:08:03.398
f4cb2ce6-4df9-45b3-afb9-7b3a466c3ca3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-30 07:10:57.492
25404b1a-47a9-4408-9e15-69e667bee733	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	0.000000000000000000000000000000	{}	2026-06-30 07:14:39.247
1cc4107a-d336-465d-b024-793c76eec3c6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-30 07:16:12.142
867be2ce-1978-499b-9d33-12c0ccd9942c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-30 07:25:55.773
dede9c53-ebd1-49df-a233-4656fe324993	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Main Admin	admin	start_session	session	01b08c39-3500-42bf-a9a4-2aaad0d7746a	b967ae2c-2207-4d47-b41a-5e27192e0bad	01b08c39-3500-42bf-a9a4-2aaad0d7746a	0.000000000000000000000000000000	{"seeded": true}	2026-06-08 13:00:41.554
9a73ea34-c716-4edf-a7d7-463a7ac42bf8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	sale_created	sale	8530352f-de49-43df-b719-3a2b107e7539	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "Flash", "barcode": "1234", "quantity": 3, "product_id": "5384e0c0-1630-48cb-99c4-da396559f5dc", "unit_price": 10000, "total_price": 30000}], "profit": 6000, "discount": 0, "subtotal": 30000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-06-09 14:51:05.112
6484181b-00ad-4dec-9df7-7135dc2e9b39	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	payment_created	sale	8530352f-de49-43df-b719-3a2b107e7539	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "Flash", "barcode": "1234", "quantity": 3, "product_id": "5384e0c0-1630-48cb-99c4-da396559f5dc", "unit_price": 10000, "total_price": 30000}], "method": "cash", "payment_id": "851eb1f0-e87a-4c63-a6f6-e95502918fd3", "card_amount": 0, "cash_amount": 30000, "customer_id": null, "balance_after": null, "change_amount": 20000, "customer_type": "guest", "balance_amount": 0, "balance_before": null, "received_amount": 50000}	2026-06-09 14:51:06.139
2c3dd9ae-6ee7-48ed-9685-85740755e79c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	add_time	session	01b08c39-3500-42bf-a9a4-2aaad0d7746a	\N	01b08c39-3500-42bf-a9a4-2aaad0d7746a	0.000000000000000000000000000000	{}	2026-06-09 14:51:38.729
aabbd0a2-13c4-478e-bd4b-a186e77e6fbf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	sale_created	sale	15fea797-cb76-4ba6-b731-fe7ca340b60f	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "Redbull", "barcode": "777123", "quantity": 2, "product_id": "37e42e81-2b80-43b4-8ad4-9de1327c91e3", "unit_price": 22000, "total_price": 44000}, {"name": "Flash", "barcode": "1234", "quantity": 1, "product_id": "5384e0c0-1630-48cb-99c4-da396559f5dc", "unit_price": 10000, "total_price": 10000}], "profit": 15000, "discount": 0, "subtotal": 54000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-06-09 15:14:11.247
a65ea3b1-8013-4419-9715-10aa3b8d2d34	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	payment_created	sale	15fea797-cb76-4ba6-b731-fe7ca340b60f	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "Redbull", "barcode": "777123", "quantity": 2, "product_id": "37e42e81-2b80-43b4-8ad4-9de1327c91e3", "unit_price": 22000, "total_price": 44000}, {"name": "Flash", "barcode": "1234", "quantity": 1, "product_id": "5384e0c0-1630-48cb-99c4-da396559f5dc", "unit_price": 10000, "total_price": 10000}], "method": "cash", "payment_id": "d971227c-0903-4812-9c40-39acfbd53df6", "card_amount": 0, "cash_amount": 54000, "customer_id": null, "balance_after": null, "change_amount": 6000, "customer_type": "guest", "balance_amount": 0, "balance_before": null, "received_amount": 60000}	2026-06-09 15:14:12.367
13243fef-3d43-49cc-b207-d9428e9733b0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	546a3a1d-fad3-4aea-a8c4-b3b35caa713f	7560ac62-9494-4ba7-95c8-23d3e3313943	546a3a1d-fad3-4aea-a8c4-b3b35caa713f	0.000000000000000000000000000000	{}	2026-06-10 10:31:45.404
a2cc8e91-8d12-4cb9-95ef-ea3a49fd1b84	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	37a131d1-32c6-4920-92aa-00757cda5cc4	7560ac62-9494-4ba7-95c8-23d3e3313943	37a131d1-32c6-4920-92aa-00757cda5cc4	0.000000000000000000000000000000	{}	2026-06-10 12:07:48.867
ed566c42-0fd4-49a2-8710-c4e565e34cb8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	51c5f428-20a4-4beb-9eaf-c23c2764bfc0	7560ac62-9494-4ba7-95c8-23d3e3313943	51c5f428-20a4-4beb-9eaf-c23c2764bfc0	0.000000000000000000000000000000	{}	2026-06-10 12:08:49.528
ae328bc3-d7d4-47ae-bb1e-aadd393ee831	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	c398e987-9ba8-4d72-8411-695adc0a2ba1	7560ac62-9494-4ba7-95c8-23d3e3313943	c398e987-9ba8-4d72-8411-695adc0a2ba1	0.000000000000000000000000000000	{}	2026-06-10 12:09:39.14
2220f123-b280-4f6a-bcff-d5080b5554e7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	7fb11c41-5907-417c-a002-4bc192039d65	7560ac62-9494-4ba7-95c8-23d3e3313943	7fb11c41-5907-417c-a002-4bc192039d65	0.000000000000000000000000000000	{}	2026-06-10 12:14:53.495
2b417f99-f7e5-45d4-8698-700443a15d52	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	95dbea80-82f9-4c03-8934-52a34ec1d71f	7560ac62-9494-4ba7-95c8-23d3e3313943	95dbea80-82f9-4c03-8934-52a34ec1d71f	0.000000000000000000000000000000	{}	2026-06-10 12:17:51.822
da0ea7ed-066f-4dc9-b438-10ced7679238	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	18cf73c3-7643-4667-baed-d193e73c8ada	7560ac62-9494-4ba7-95c8-23d3e3313943	18cf73c3-7643-4667-baed-d193e73c8ada	0.000000000000000000000000000000	{}	2026-06-10 12:21:35.914
e3ff821b-a037-48f7-b1c4-8f3240bd3c71	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	start_session	session	53a72eb1-efbf-4a78-9492-230d6b090cc8	f7db86e9-4c80-4f1c-a1d4-6f78b93e5bba	53a72eb1-efbf-4a78-9492-230d6b090cc8	0.000000000000000000000000000000	{}	2026-06-10 13:23:08.51
e9eb813a-0a1d-48bc-859c-ed7562924760	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	start_session	session	496ea8d0-a461-4f46-bd60-a733bf741fa6	7560ac62-9494-4ba7-95c8-23d3e3313943	496ea8d0-a461-4f46-bd60-a733bf741fa6	0.000000000000000000000000000000	{}	2026-06-10 13:34:13.811
d7b57f3f-2ac0-4192-8b05-9085ec3e9a35	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	start_session	session	bba4b667-0750-42e4-bf8a-ac95b3455606	7560ac62-9494-4ba7-95c8-23d3e3313943	bba4b667-0750-42e4-bf8a-ac95b3455606	0.000000000000000000000000000000	{}	2026-06-10 13:34:45.912
7d6b12d3-5a63-4593-b1a2-d087515a6eb0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	start_session	session	073da523-a917-4cd7-a916-93600ec68496	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	073da523-a917-4cd7-a916-93600ec68496	0.000000000000000000000000000000	{}	2026-06-11 08:24:18.415
b13dcfa8-8220-4278-b072-332cab3c3d07	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	6a41dc37-6efc-414a-94b9-7cbf6021e916	c2a40555-3e9a-4a41-aa26-858577f1676f	6a41dc37-6efc-414a-94b9-7cbf6021e916	0.000000000000000000000000000000	{}	2026-06-26 09:52:55.861
e381f109-3bfe-4e2e-935c-1d88a4276af7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	start_session	session	7d950085-cf0b-4903-aac5-7957f3c31ee9	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	7d950085-cf0b-4903-aac5-7957f3c31ee9	0.000000000000000000000000000000	{}	2026-06-11 08:28:00.355
ac53d999-e96f-4efd-ae77-cdbdce423954	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	add_time	session	7d950085-cf0b-4903-aac5-7957f3c31ee9	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	7d950085-cf0b-4903-aac5-7957f3c31ee9	0.000000000000000000000000000000	{}	2026-06-11 08:31:16.216
b4f75d6e-af66-4b68-aac9-240174938819	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	add_time	session	7d950085-cf0b-4903-aac5-7957f3c31ee9	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	7d950085-cf0b-4903-aac5-7957f3c31ee9	0.000000000000000000000000000000	{}	2026-06-11 08:31:26.085
07c864fb-dcab-460b-a708-36746936f883	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	start_session	session	2defbf2c-a9a1-4f87-b140-8c12e302dbd9	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	2defbf2c-a9a1-4f87-b140-8c12e302dbd9	0.000000000000000000000000000000	{}	2026-06-11 08:32:16.087
30435e9e-a32b-4447-9a52-01b9972e8858	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	add_time	session	2defbf2c-a9a1-4f87-b140-8c12e302dbd9	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	2defbf2c-a9a1-4f87-b140-8c12e302dbd9	0.000000000000000000000000000000	{}	2026-06-11 08:39:57.017
44ca858c-f0eb-42ec-bb00-235d1b543ec8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	start_session	session	583a599a-bf4c-4b7f-ad77-afe2d4e5c11e	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	583a599a-bf4c-4b7f-ad77-afe2d4e5c11e	0.000000000000000000000000000000	{}	2026-06-11 08:42:30.31
e259aa2f-9d33-47bc-ae01-a61d1e4e019d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	add_time	session	583a599a-bf4c-4b7f-ad77-afe2d4e5c11e	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	583a599a-bf4c-4b7f-ad77-afe2d4e5c11e	0.000000000000000000000000000000	{}	2026-06-11 08:45:51.058
ee5d90b2-e788-4ba7-909f-4662b1bfaaed	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	add_time	session	583a599a-bf4c-4b7f-ad77-afe2d4e5c11e	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	583a599a-bf4c-4b7f-ad77-afe2d4e5c11e	0.000000000000000000000000000000	{}	2026-06-11 09:50:12.416
26fe2b04-b206-4df1-97d3-4b3eacd535ab	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	start_session	session	55b75e04-d245-4f57-8d49-d88571fa80f0	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	55b75e04-d245-4f57-8d49-d88571fa80f0	0.000000000000000000000000000000	{}	2026-06-11 09:56:11.196
1269d7de-e775-457b-8c63-5ec1b3eb7cb4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	add_time	session	55b75e04-d245-4f57-8d49-d88571fa80f0	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	55b75e04-d245-4f57-8d49-d88571fa80f0	0.000000000000000000000000000000	{}	2026-06-11 09:56:39.46
0a8f4889-a819-43b0-b97c-d9d7c9ec565e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	45fc6af3-d031-4a83-b26d-fe648fcd5866	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	45fc6af3-d031-4a83-b26d-fe648fcd5866	0.000000000000000000000000000000	{}	2026-06-11 11:11:44.752
463ee58b-238c-44c2-8b34-ce3fe8ade8d0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	2d57f8b4-2881-4d16-9f71-0a2d0f28dc57	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	2d57f8b4-2881-4d16-9f71-0a2d0f28dc57	0.000000000000000000000000000000	{}	2026-06-11 11:12:46.8
bfd94dca-60b8-4bc9-ae4b-311c6f10eab1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	payment_created	payment	eda221b8-5073-462a-90e1-e563e934fa2c	\N	2d57f8b4-2881-4d16-9f71-0a2d0f28dc57	0.000000000000000000000000000000	{"method": "cash", "card_amount": 0, "cash_amount": 40000, "change_amount": 0, "balance_amount": 0, "received_amount": null}	2026-06-11 11:13:17.751
026a4246-3b79-4a17-bf89-ba71d3888aa7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	start_session	session	da0e9f61-f56b-4d7c-a71c-ebba63c6f855	7560ac62-9494-4ba7-95c8-23d3e3313943	da0e9f61-f56b-4d7c-a71c-ebba63c6f855	0.000000000000000000000000000000	{}	2026-06-11 11:27:22.688
39cd4403-f9d8-42fd-b62a-ca261b1a6056	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	start_session	session	3cfc2498-6dc3-420d-bc5d-cd35dbc7ebfd	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	3cfc2498-6dc3-420d-bc5d-cd35dbc7ebfd	0.000000000000000000000000000000	{}	2026-06-11 11:39:26.102
bc134e1c-b63c-4fb9-8522-935fe5d44d36	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	payment_created	payment	268a54db-9803-4c63-b453-336e423e3409	\N	0ce60b37-ec04-4e46-b763-4289ca6f721a	0.000000000000000000000000000000	{"method": "card", "card_amount": 60000, "cash_amount": 0, "change_amount": 0, "balance_amount": 0, "received_amount": null}	2026-06-11 13:58:56.102
2ada14e8-8601-4bc0-bbc5-db593289a8c4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	ac9dfcb3-a4ad-443a-84d7-493644c9fa93	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	ac9dfcb3-a4ad-443a-84d7-493644c9fa93	0.000000000000000000000000000000	{}	2026-06-11 14:03:51.849
c01e0b44-9fee-4395-aee2-3ea191abefbe	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	payment_created	payment	b988781c-21e2-440c-a93f-fc6e2836a4d3	\N	ac9dfcb3-a4ad-443a-84d7-493644c9fa93	0.000000000000000000000000000000	{"method": "card", "card_amount": 60000, "cash_amount": 0, "change_amount": 0, "balance_amount": 0, "received_amount": null}	2026-06-11 14:04:10.661
005fe1a4-e4d8-4c40-8cb9-b89791a8ee1a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	4801c96e-5483-4c87-bbdb-2381b2720961	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	4801c96e-5483-4c87-bbdb-2381b2720961	0.000000000000000000000000000000	{}	2026-06-11 14:05:07.331
b62a8399-28fa-487a-8e9c-0c2db0b5184a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	shift_closed	shift	115db3e8-ab49-4837-9243-4a8bffbc6b9d	\N	\N	0.000000000000000000000000000000	{"bank": 0, "card": 0, "cash": 0, "balance": 0, "recipient": "Jasur aka", "difference": 0, "cash_withdrawn": 0, "remaining_cash": 200000}	2026-06-11 14:44:04.927
19a1d9e2-dbcc-48d2-b2ad-ac4dc0ba71fc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	shift_closed	shift	004710fa-fca5-45de-97fb-2c64b279b09c	\N	\N	0.000000000000000000000000000000	{"bank": 0, "card": 0, "cash": 0, "balance": 0, "recipient": "Jasur aka", "difference": -15000, "cash_withdrawn": 10000, "remaining_cash": 10000}	2026-06-11 14:45:43.779
5d6355a2-b303-4477-9790-86c59df556f3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	add_time	session	52f4bf25-3427-459f-89c6-9ccaeea0db99	7560ac62-9494-4ba7-95c8-23d3e3313943	52f4bf25-3427-459f-89c6-9ccaeea0db99	0.000000000000000000000000000000	{}	2026-06-11 14:55:16.546
3bcd008b-9b3c-4c0a-8fe9-250ba6d03bfc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	start_session	session	fbd53f56-e892-4243-8740-44dd4cdc76ef	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	fbd53f56-e892-4243-8740-44dd4cdc76ef	0.000000000000000000000000000000	{}	2026-06-11 14:56:17.05
2906e5ae-7a84-47e3-b26e-50be3fc0e67b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	sale_created	sale	78f660db-6cfc-47ed-a698-b049b2c04e31	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "ABC", "barcode": "4607065000868", "quantity": 2, "product_id": "8c4dfff7-f020-47b8-b228-0c1432e6a96f", "unit_price": 9000, "total_price": 18000}], "profit": 6000, "discount": 0, "subtotal": 18000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-06-11 15:16:44.32
ed2a08f4-461e-45c7-88c9-83ac1563c393	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	payment_created	sale	78f660db-6cfc-47ed-a698-b049b2c04e31	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "ABC", "barcode": "4607065000868", "quantity": 2, "product_id": "8c4dfff7-f020-47b8-b228-0c1432e6a96f", "unit_price": 9000, "total_price": 18000}], "method": "cash", "payment_id": "1fca03b5-5ef8-46c7-bb96-78a815aa2387", "card_amount": 0, "cash_amount": 18000, "customer_id": null, "balance_after": null, "change_amount": 0, "customer_type": "guest", "balance_amount": 0, "balance_before": null, "received_amount": 18000}	2026-06-11 15:16:45.183
66acc888-e816-4429-aa36-c40163d4c7d3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	sale_created	sale	042e4c9f-c862-4571-bd5e-f0d1c62b7867	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "M&M's", "barcode": "4607065000868", "quantity": 4, "product_id": "9e5cd792-2919-407f-963d-1e088654f9e6", "unit_price": 15000, "total_price": 60000}], "profit": 20000, "discount": 0, "subtotal": 60000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-06-11 15:21:45.753
c462a034-f166-4780-b451-471e7824edd8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	payment_created	sale	042e4c9f-c862-4571-bd5e-f0d1c62b7867	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "M&M's", "barcode": "4607065000868", "quantity": 4, "product_id": "9e5cd792-2919-407f-963d-1e088654f9e6", "unit_price": 15000, "total_price": 60000}], "method": "cash", "payment_id": "40a0c5cb-f183-47bf-a6a4-2033c2652b61", "card_amount": 0, "cash_amount": 60000, "customer_id": null, "balance_after": null, "change_amount": 40000, "customer_type": "guest", "balance_amount": 0, "balance_before": null, "received_amount": 100000}	2026-06-11 15:21:46.661
9cad794d-e03f-478a-9720-00797c4ae17f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	maintenance_closed	repair_request	93b24c1d-037f-40b3-bb26-ed69e74e500e	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{}	2026-06-25 07:34:14.428
180faf98-e2b5-4663-b03d-997e3fe9b687	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	sale_created	sale	09173d22-b784-452e-bfd0-3a2b660f8e88	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "M&M's", "barcode": "4607065000868", "quantity": 1, "product_id": "9e5cd792-2919-407f-963d-1e088654f9e6", "unit_price": 15000, "total_price": 15000}, {"name": "Qurt", "barcode": "4780102760304", "quantity": 1, "product_id": "7e30b780-f60c-424a-a184-4fef11a44306", "unit_price": 10000, "total_price": 10000}], "profit": 7000, "discount": 0, "subtotal": 25000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-06-11 15:23:24.712
70b93e24-f230-4215-b5a6-1e456b7e28c5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	payment_created	sale	09173d22-b784-452e-bfd0-3a2b660f8e88	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "M&M's", "barcode": "4607065000868", "quantity": 1, "product_id": "9e5cd792-2919-407f-963d-1e088654f9e6", "unit_price": 15000, "total_price": 15000}, {"name": "Qurt", "barcode": "4780102760304", "quantity": 1, "product_id": "7e30b780-f60c-424a-a184-4fef11a44306", "unit_price": 10000, "total_price": 10000}], "method": "card", "payment_id": "8f3fc10e-96dd-421b-b4da-34ce12d69820", "card_amount": 25000, "cash_amount": 0, "customer_id": null, "balance_after": null, "change_amount": 0, "customer_type": "guest", "balance_amount": 0, "balance_before": null, "received_amount": null}	2026-06-11 15:23:26.099
d9a41f6c-9466-484b-b648-feedc8a78022	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	start_session	session	5a5dd402-8c3b-436c-9592-c1f6dd4e17f8	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	5a5dd402-8c3b-436c-9592-c1f6dd4e17f8	0.000000000000000000000000000000	{}	2026-06-11 15:25:08.482
47d91a53-75ec-4a08-a750-7ea3298ca290	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	payment_created	payment	d1ecb804-71bf-4084-8e35-73828bc73d65	\N	5a5dd402-8c3b-436c-9592-c1f6dd4e17f8	0.000000000000000000000000000000	{"method": "cash", "card_amount": 0, "cash_amount": 50000, "change_amount": 0, "balance_amount": 0, "received_amount": null}	2026-06-11 15:25:36.786
d48331cc-e557-4984-bd63-a45ebdc61ffe	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	shift_closed	shift	2d73dce6-93d1-4255-9db5-578889ef9a70	\N	\N	0.000000000000000000000000000000	{"bank": 0, "card": 0, "cash": 0, "balance": 0, "recipient": "Owner", "difference": 0, "cash_withdrawn": 0, "remaining_cash": 200000}	2026-06-12 07:34:42.38
9f08c68f-9639-48a7-9eca-266fdeda4832	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	sale_created	sale	3c127e17-0277-493e-91fd-7ecbbeb32524	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "M&M's", "barcode": "4607065000868", "quantity": 2, "product_id": "9e5cd792-2919-407f-963d-1e088654f9e6", "unit_price": 15000, "total_price": 30000}], "profit": 10000, "discount": 0, "subtotal": 30000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-06-12 07:42:26.758
0b6ad9a4-1a5d-4b7a-b05b-d40db8268bbe	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	cd58bea7-c246-40bc-a3ad-66fcdf9739bd	07e923a0-e9bd-4683-8ef4-275ba3373d55	cd58bea7-c246-40bc-a3ad-66fcdf9739bd	0.000000000000000000000000000000	{}	2026-06-25 16:44:36.579
36cd50f7-3b98-459f-af6d-c345200a14ba	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	maintenance_closed	repair_request	72e385b1-aae9-4187-b996-cfe7023c6c02	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{}	2026-06-25 15:11:39.425
a10a3a83-40fb-4c56-8b29-9572d391d690	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	payment_created	sale	3c127e17-0277-493e-91fd-7ecbbeb32524	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "M&M's", "barcode": "4607065000868", "quantity": 2, "product_id": "9e5cd792-2919-407f-963d-1e088654f9e6", "unit_price": 15000, "total_price": 30000}], "method": "card", "payment_id": "b5065d42-339f-4465-8c21-604119856967", "card_amount": 30000, "cash_amount": 0, "customer_id": null, "balance_after": null, "change_amount": 0, "customer_type": "guest", "balance_amount": 0, "balance_before": null, "received_amount": null}	2026-06-12 07:42:31.199
885c785d-61c5-407c-ad31-6833bc3bc18a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	shift_closed	shift	fa1772cc-fde3-4d4e-a506-674fd018a35a	\N	\N	0.000000000000000000000000000000	{"bank": 0, "card": 30000, "cash": 0, "balance": 0, "recipient": "Owner", "difference": 200000, "cash_withdrawn": 0, "remaining_cash": 100000}	2026-06-12 07:44:58.88
cac4323f-f4a1-492e-b80c-cf3f5d0c8720	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	sale_created	sale	ed42b073-733a-498d-81d3-667ef66ecf08	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "Qurt", "barcode": "4780102760304", "quantity": 2, "product_id": "7e30b780-f60c-424a-a184-4fef11a44306", "unit_price": 10000, "total_price": 20000}], "profit": 4000, "discount": 0, "subtotal": 20000, "customer_id": "b172db10-871c-4988-93d1-9c69c2906154", "customer_name": "Aziz", "customer_type": "registered", "customer_phone": "998901112233"}	2026-06-12 07:55:41.599
28d1c81e-62e1-48bb-92ec-515f7c017efc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	payment_created	sale	ed42b073-733a-498d-81d3-667ef66ecf08	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "Qurt", "barcode": "4780102760304", "quantity": 2, "product_id": "7e30b780-f60c-424a-a184-4fef11a44306", "unit_price": 10000, "total_price": 20000}], "method": "card", "payment_id": "c46362d7-c758-47d4-a355-119670a249cd", "card_amount": 20000, "cash_amount": 0, "customer_id": "b172db10-871c-4988-93d1-9c69c2906154", "balance_after": null, "change_amount": 0, "customer_type": "registered", "balance_amount": 0, "balance_before": null, "received_amount": null}	2026-06-12 07:55:46.578
2243eb1f-e1f5-432f-bb8f-407be8003d01	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	shift_closed	shift	816f18dc-3598-41e4-ac94-c0da90ecff6e	\N	\N	0.000000000000000000000000000000	{"bank": 0, "card": 20000, "cash": 0, "balance": 0, "recipient": "Owner", "difference": -5000, "cash_withdrawn": 0, "remaining_cash": 95000}	2026-06-12 07:56:35.361
0c2753f9-7404-4e6a-bc74-0c58f65c2395	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	shift_closed	shift	0291fff4-2edb-4f1b-acd7-b1144ebeb11e	\N	\N	0.000000000000000000000000000000	{"bank": 0, "card": 0, "cash": 0, "balance": 0, "recipient": "Owner", "difference": 0, "cash_withdrawn": 0, "remaining_cash": 95000}	2026-06-12 08:48:07.763
368c9f82-a031-46f7-a33e-c1ba6f537a29	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	sale_created	sale	42197872-7ca8-4dcb-b443-7fc6d7a70585	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "Keshu M", "barcode": "47801027603044607065000868622113401271246070650014454780102760113", "quantity": 1, "product_id": "5b988a52-4c33-487c-afb5-6cbea9b943e8", "unit_price": 10000, "total_price": 10000}, {"name": "Mindal M", "barcode": "4780102760304460706500086862211340127124607065001445478010276011347801478010276012002760199", "quantity": 1, "product_id": "a2103180-05cc-42f0-9b18-d4f459709873", "unit_price": 10000, "total_price": 10000}], "profit": 20000, "discount": 0, "subtotal": 20000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-06-12 15:32:13.112
42e6af1a-df23-4717-bc00-52061e6305d9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	sale_created	sale	21fe43ac-4e28-4ee8-972a-5a260e16ca7e	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "Keshu M", "barcode": "47801027603044607065000868622113401271246070650014454780102760113", "quantity": 1, "product_id": "5b988a52-4c33-487c-afb5-6cbea9b943e8", "unit_price": 10000, "total_price": 10000}, {"name": "Mindal M", "barcode": "4780102760304460706500086862211340127124607065001445478010276011347801478010276012002760199", "quantity": 1, "product_id": "a2103180-05cc-42f0-9b18-d4f459709873", "unit_price": 10000, "total_price": 10000}], "profit": 20000, "discount": 0, "subtotal": 20000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-06-12 15:32:51.014
d929a4d3-5167-4306-8156-6f8417101d34	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	maintenance_reviewed	repair_request	93b24c1d-037f-40b3-bb26-ed69e74e500e	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{"decision": "cleared"}	2026-06-25 07:35:06.238
3f3af0c9-0839-4d12-b0af-4cfef38e7ca4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	maintenance_closed	repair_request	7d131cb8-1347-4f49-8aef-84301fa73189	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	\N	0.000000000000000000000000000000	{}	2026-06-25 07:42:40.271
41242d23-7485-47f2-ba49-f8b55ef95a2a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	sale_created	sale	9e8749f0-8358-4a0d-87f1-8aaceacec184	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "Keshu M", "barcode": "47801027603044607065000868622113401271246070650014454780102760113", "quantity": 1, "product_id": "5b988a52-4c33-487c-afb5-6cbea9b943e8", "unit_price": 10000, "total_price": 10000}], "profit": 10000, "discount": 0, "subtotal": 10000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-06-12 16:18:09.656
22113043-27f2-4b6f-8352-32abb1cf3ec3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	8a4de02e-ed8b-436f-a29b-1486396453aa	7560ac62-9494-4ba7-95c8-23d3e3313943	8a4de02e-ed8b-436f-a29b-1486396453aa	0.000000000000000000000000000000	{}	2026-06-15 12:19:55.088
13b64080-6b1c-4d3c-8894-00ee769885e3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	0a9e69ed-410f-4880-af17-e22c8262dc2d	7560ac62-9494-4ba7-95c8-23d3e3313943	0a9e69ed-410f-4880-af17-e22c8262dc2d	0.000000000000000000000000000000	{}	2026-06-15 12:23:14.11
a322da5e-6033-4795-9a93-091e59d51ddd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	shift_closed	shift	6c475e03-e99b-4279-b329-6e2f9e069357	\N	\N	0.000000000000000000000000000000	{"bank": 0, "card": 0, "cash": 80000, "balance": 0, "recipient": "Owner", "difference": 0, "cash_withdrawn": 0, "remaining_cash": 175000}	2026-06-17 11:03:18.842
5346b032-cf65-49b8-b1a1-4ee79f5c19ee	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	shift_closed	shift	09d7b689-5ba5-47c4-84e2-1ec1787f38cb	\N	\N	0.000000000000000000000000000000	{"bank": 0, "card": 0, "cash": 0, "balance": 0, "recipient": "Owner", "difference": 0, "cash_withdrawn": 0, "remaining_cash": 175000}	2026-06-17 11:06:24.23
7acc76b4-779b-427f-a330-2d2a289926a1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	shift_closed	shift	99c1f6bf-889f-4188-bc53-d17d3a4c7a60	\N	\N	0.000000000000000000000000000000	{"bank": 0, "card": 0, "cash": 0, "balance": 0, "recipient": "Owner", "difference": 0, "cash_withdrawn": 0, "remaining_cash": 175000}	2026-06-17 11:07:15.34
3c134b71-6530-474e-884a-29abe62d5f99	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	shift_closed	shift	034a8729-759f-4de4-b3ee-4184463bc4d3	\N	\N	0.000000000000000000000000000000	{"bank": 0, "card": 0, "cash": 0, "balance": 0, "recipient": "Owner", "difference": 0, "cash_withdrawn": 0, "remaining_cash": 175000}	2026-06-17 11:13:04.624
94f4780c-6776-4634-a7f4-42667b8b78cf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	maintenance_closed	repair_request	868785e8-765e-419e-a2d7-a12d61d3d373	c2a40555-3e9a-4a41-aa26-858577f1676f	\N	0.000000000000000000000000000000	{}	2026-06-25 15:13:25.768
e6a5c494-6fc9-4c08-9320-0262b9654673	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	0ad39109-12db-422a-b7fd-b232f8ce8645	c2a40555-3e9a-4a41-aa26-858577f1676f	0ad39109-12db-422a-b7fd-b232f8ce8645	0.000000000000000000000000000000	{}	2026-06-25 15:13:40.076
923a90d8-9c1e-4b1b-aaeb-b4b781ca6a64	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	maintenance_closed	repair_request	e1340b0a-56c8-4b9b-a716-08a3773612f7	c2a40555-3e9a-4a41-aa26-858577f1676f	\N	0.000000000000000000000000000000	{}	2026-06-25 15:14:15.911
17c60f8b-ccee-401a-89c6-e2f8f30a8a80	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	a61aac7a-fd11-4e7f-a448-6cdbd282f1d8	\N	\N	\N	{}	2026-07-01 22:29:43.299
fade84ea-412f-4816-9137-3649093c2d92	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	sale_created	sale	0c567b87-b378-4fc7-9660-e9c422a1fad0	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "B fresh", "barcode": "478013764029947801376402134780072660161", "quantity": 1, "product_id": "0cc1edd1-c65d-4332-9484-9555b5ea4b0e", "unit_price": 15000, "total_price": 15000}, {"name": "Flash Kichik", "barcode": "4780137640299478013764021347800726601614780068020023", "quantity": 1, "product_id": "a438fe77-74a0-4a86-87c5-6de222ea6373", "unit_price": 10000, "total_price": 10000}], "profit": 25000, "discount": 0, "subtotal": 25000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-06-17 17:06:09.013
9656558e-ecb9-4ebd-b0e4-9e2e694d1eb8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	payment_created	sale	0c567b87-b378-4fc7-9660-e9c422a1fad0	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "B fresh", "barcode": "478013764029947801376402134780072660161", "quantity": 1, "product_id": "0cc1edd1-c65d-4332-9484-9555b5ea4b0e", "unit_price": 15000, "total_price": 15000}, {"name": "Flash Kichik", "barcode": "4780137640299478013764021347800726601614780068020023", "quantity": 1, "product_id": "a438fe77-74a0-4a86-87c5-6de222ea6373", "unit_price": 10000, "total_price": 10000}], "method": "cash", "payment_id": "ef8fe803-ed1d-4d64-b8be-a1ec050230b1", "card_amount": 0, "cash_amount": 25000, "customer_id": null, "balance_after": null, "change_amount": 0, "customer_type": "guest", "balance_amount": 0, "balance_before": null, "received_amount": 25000}	2026-06-17 17:06:09.926
efa06ade-65bd-42cc-a282-a2981dc610ff	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	sale_created	sale	50591526-1512-42a8-8f95-f5349e684ea0	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "M&Ms", "barcode": "4607065000868", "quantity": 1, "product_id": "a447b302-fcc0-4a85-833f-f86236329fe4", "unit_price": 15000, "total_price": 15000}], "profit": 15000, "discount": 0, "subtotal": 15000, "customer_id": "58dceacf-f773-4e62-bd9e-7748904919fa", "customer_name": "nd", "customer_type": "registered", "customer_phone": "998886750811"}	2026-06-17 17:07:27.768
e1de9dda-f131-44b2-be0c-2332dfe77d61	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	payment_created	sale	50591526-1512-42a8-8f95-f5349e684ea0	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "M&Ms", "barcode": "4607065000868", "quantity": 1, "product_id": "a447b302-fcc0-4a85-833f-f86236329fe4", "unit_price": 15000, "total_price": 15000}], "method": "cash", "payment_id": "71f08dd0-5a55-4a22-8477-0cbe7ac96aed", "card_amount": 0, "cash_amount": 15000, "customer_id": "58dceacf-f773-4e62-bd9e-7748904919fa", "balance_after": null, "change_amount": 5000, "customer_type": "registered", "balance_amount": 0, "balance_before": null, "received_amount": 20000}	2026-06-17 17:07:28.872
5ac10f28-4f86-41c8-aac6-e6694a973ff6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	sale_created	sale	f0b4c386-cacf-4a14-9969-2db028ca289e	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "Flash Kichik", "barcode": "4780137640299478013764021347800726601614780068020023", "quantity": 1, "product_id": "a438fe77-74a0-4a86-87c5-6de222ea6373", "unit_price": 10000, "total_price": 10000}], "profit": 10000, "discount": 0, "subtotal": 10000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-06-17 17:07:45.849
01c7e9b2-9ed6-45c3-9930-421f26d76711	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	payment_created	sale	f0b4c386-cacf-4a14-9969-2db028ca289e	\N	\N	0.000000000000000000000000000000	{"items": [{"name": "Flash Kichik", "barcode": "4780137640299478013764021347800726601614780068020023", "quantity": 1, "product_id": "a438fe77-74a0-4a86-87c5-6de222ea6373", "unit_price": 10000, "total_price": 10000}], "method": "cash", "payment_id": "a326daa1-3139-4614-b674-d1d5c728051c", "card_amount": 0, "cash_amount": 10000, "customer_id": null, "balance_after": null, "change_amount": 0, "customer_type": "guest", "balance_amount": 0, "balance_before": null, "received_amount": 10000}	2026-06-17 17:07:46.464
43d1ed03-365b-487b-9626-acaf92d8a1f7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	8bd255d0-1d69-4684-b1f8-328dd0167dfc	7560ac62-9494-4ba7-95c8-23d3e3313943	8bd255d0-1d69-4684-b1f8-328dd0167dfc	0.000000000000000000000000000000	{}	2026-06-17 17:28:15.889
1ee5afac-5647-4a1d-a27c-55403bd0d1df	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	payment_created	payment	322151ea-df8e-42d9-8229-b50ae502de6b	\N	\N	0.000000000000000000000000000000	{"method": "card", "card_amount": 50000, "cash_amount": 0, "change_amount": 0, "balance_amount": 0, "received_amount": null}	2026-06-17 17:34:31.16
896abe7e-76cd-42fb-add3-a1c25bd1f3c4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	start_session	session	7a22c4d5-83c0-4b0f-a8c8-8c07252340a4	c2a40555-3e9a-4a41-aa26-858577f1676f	7a22c4d5-83c0-4b0f-a8c8-8c07252340a4	0.000000000000000000000000000000	{}	2026-06-17 19:10:14.111
3b66339a-1969-4a21-8d69-fa252fe38611	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	customer_balance_topup	customer	20222f92-3770-4b88-895a-f0ab6d2a03ed	\N	\N	0.000000000000000000000000000000	{"method": "card", "payment_id": "189a1a3d-636c-46fb-8c02-e1df898c6c7e", "balance_after": 200000}	2026-06-18 07:45:26.463
ea62871b-d772-48fb-b906-c6bd15f681e6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	start_session	session	7b067a26-3b21-40a8-a8b6-b42587785623	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	7b067a26-3b21-40a8-a8b6-b42587785623	0.000000000000000000000000000000	{}	2026-06-18 07:49:00.096
9449aebf-ffa4-4eda-99e9-e1c322c5604b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	start_session	session	d5bd811f-a445-4d11-a7db-54b653efe0a3	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	d5bd811f-a445-4d11-a7db-54b653efe0a3	0.000000000000000000000000000000	{}	2026-06-18 08:11:12.519
82706711-13b8-4f25-81ed-a276d2ace323	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	maintenance_closed	repair_request	f8217399-1a7a-4bf8-bdf5-8ef1ad155135	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{}	2026-06-25 07:42:56.021
eecac717-25b6-4cc0-bac5-c0ebac9ca92c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	maintenance_closed	repair_request	b2c67977-44b0-48d3-8e6e-c265124f2c6d	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{}	2026-06-25 07:46:32.316
6357ebc0-f60e-4a43-9b7f-ac382dffbf46	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	maintenance_reviewed	repair_request	b2c67977-44b0-48d3-8e6e-c265124f2c6d	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{"decision": "charged"}	2026-06-25 07:46:55.992
aca12d39-a209-4c7f-bad1-c250aa8d863c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	withdrawal_requested	cash_withdrawal	b055bfc6-9ace-4372-a03b-6ed548c3fd9a	\N	\N	0.000000000000000000000000000000	{"initiator_role": "admin"}	2026-06-25 08:30:48.093
d749f74c-40ed-4edf-a3f3-29a607238544	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	withdrawal_confirmed	cash_withdrawal	b055bfc6-9ace-4372-a03b-6ed548c3fd9a	\N	\N	0.000000000000000000000000000000	{}	2026-06-25 08:31:20.877
70c3657f-d729-42c6-b88b-d44f7806b369	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	maintenance_reviewed	repair_request	f8217399-1a7a-4bf8-bdf5-8ef1ad155135	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{"decision": "charged"}	2026-06-25 08:32:10.112
4d288051-7a65-49ff-bd59-fe7fe6112a61	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	start_session	session	7faf187d-c634-4661-834a-fac80405cf0d	7560ac62-9494-4ba7-95c8-23d3e3313943	7faf187d-c634-4661-834a-fac80405cf0d	0.000000000000000000000000000000	{}	2026-06-25 08:33:26.117
b134f3c4-63ea-42fd-b9b9-980dca74af96	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	maintenance_closed	repair_request	b68e1d79-d003-4044-9743-a270bf38eba1	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{}	2026-06-25 08:42:31.755
14194adc-e979-422a-989c-f864690c7b03	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	maintenance_reviewed	repair_request	b68e1d79-d003-4044-9743-a270bf38eba1	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	0.000000000000000000000000000000	{"decision": "cleared"}	2026-06-25 08:43:00.514
0ff8af33-3dfd-411a-8bcc-3e1b7cbc2ad6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	start_session	session	0ccec717-5e34-4a37-b9ee-bc8c156e2260	7560ac62-9494-4ba7-95c8-23d3e3313943	0ccec717-5e34-4a37-b9ee-bc8c156e2260	0.000000000000000000000000000000	{}	2026-06-25 08:49:37.026
c448c99f-d2cf-4ca0-8d45-d166ed95e9be	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	start_session	session	966ef5a2-ac1b-4197-ba91-76a4d00b4d9a	7560ac62-9494-4ba7-95c8-23d3e3313943	966ef5a2-ac1b-4197-ba91-76a4d00b4d9a	0.000000000000000000000000000000	{}	2026-06-25 14:03:05.223
71781f79-b9af-4614-9d22-9fa68de0420a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	start_session	session	4c90b3ba-7faf-491c-9049-c807cc2056f1	7560ac62-9494-4ba7-95c8-23d3e3313943	4c90b3ba-7faf-491c-9049-c807cc2056f1	0.000000000000000000000000000000	{}	2026-06-25 14:07:16.22
3d36cf78-bbf1-494c-8733-9faba779cbad	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	withdrawal_requested	cash_withdrawal	8f82c991-aaec-4e71-91fd-8b8ef1a852ba	\N	\N	0.000000000000000000000000000000	{"initiator_role": "admin"}	2026-06-25 15:20:28.584
aa0b84c1-8d71-4e19-9aa2-edee908e6521	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	withdrawal_rejected	cash_withdrawal	8f82c991-aaec-4e71-91fd-8b8ef1a852ba	\N	\N	0.000000000000000000000000000000	{}	2026-06-25 15:22:16.034
a229c3b7-e027-49dc-a379-e04397e93d8b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	a642a180-6aa6-4107-a961-a0d9aa60cd2b	c2a40555-3e9a-4a41-aa26-858577f1676f	a642a180-6aa6-4107-a961-a0d9aa60cd2b	0.000000000000000000000000000000	{}	2026-06-25 15:24:35.952
b0942dc4-8dc5-4444-aae5-79b7b44e1e02	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	17a9ea03-8a9f-4f3f-be42-923625bd5bda	7560ac62-9494-4ba7-95c8-23d3e3313943	17a9ea03-8a9f-4f3f-be42-923625bd5bda	0.000000000000000000000000000000	{}	2026-06-25 15:25:00.948
91beb4ec-a188-47d1-b542-330b5693bfbb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	add_time	session	17a9ea03-8a9f-4f3f-be42-923625bd5bda	7560ac62-9494-4ba7-95c8-23d3e3313943	17a9ea03-8a9f-4f3f-be42-923625bd5bda	0.000000000000000000000000000000	{}	2026-06-25 15:25:35.451
61b89d3b-4cc8-4d00-bf81-216cff585029	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	withdrawal_requested	cash_withdrawal	5b6257d8-dd23-429d-a3f1-1477915e2b78	\N	\N	0.000000000000000000000000000000	{"initiator_role": "admin"}	2026-06-25 15:27:20.221
86fbfaa7-a76d-4427-a954-7054b74f7fc2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	edc88b19-c3ed-4443-a385-1ea602aadfde	c2a40555-3e9a-4a41-aa26-858577f1676f	edc88b19-c3ed-4443-a385-1ea602aadfde	0.000000000000000000000000000000	{}	2026-06-25 15:31:19.172
ef7bf383-1564-414c-bbeb-f5c698c3d150	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	e711ac42-0638-44ce-b59f-85ccdd810b14	81e58e47-d95c-4d3f-a7e9-5ff88e251b65	e711ac42-0638-44ce-b59f-85ccdd810b14	0.000000000000000000000000000000	{}	2026-06-25 16:00:07.847
4cf30cfe-30bb-4650-9ce8-d065abed41b6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	maintenance_closed	repair_request	03e4f5bb-d3a6-46da-976d-9d2f2b996314	0f9ded33-8c57-4249-a1a6-54852a53ccfe	\N	0.000000000000000000000000000000	{}	2026-06-25 16:00:54.437
c5604226-7afa-4784-84bb-e31a55747bf8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	8abd94ff-d60c-435d-a9cc-b66c8d18c06a	0f9ded33-8c57-4249-a1a6-54852a53ccfe	8abd94ff-d60c-435d-a9cc-b66c8d18c06a	0.000000000000000000000000000000	{}	2026-06-25 16:02:10.171
fb1ca451-877c-4469-bbc2-de39e33f01d5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	80523d10-4c79-4ed8-8556-d027343df565	c2a40555-3e9a-4a41-aa26-858577f1676f	80523d10-4c79-4ed8-8556-d027343df565	0.000000000000000000000000000000	{}	2026-06-25 16:03:14.062
6a3aca4e-a901-4520-a90f-c48258b8b533	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	b33ebbbb-d1bf-4263-8ca7-64c04bf252af	d689a237-dec7-4e5c-8b23-8b9257c805b5	b33ebbbb-d1bf-4263-8ca7-64c04bf252af	0.000000000000000000000000000000	{}	2026-06-25 16:04:45.885
2fc88dd7-fde6-4365-95f0-f9307ae1f08c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	90c44abb-4814-4a53-8897-83426a50e674	81e58e47-d95c-4d3f-a7e9-5ff88e251b65	90c44abb-4814-4a53-8897-83426a50e674	0.000000000000000000000000000000	{}	2026-06-25 16:20:47.393
4a4388b0-e107-43da-9845-b4aa7569b63b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	3fe25825-9619-459c-a254-996e547f7fb1	07e923a0-e9bd-4683-8ef4-275ba3373d55	3fe25825-9619-459c-a254-996e547f7fb1	0.000000000000000000000000000000	{}	2026-06-25 16:38:18.415
d360187f-f0d9-4454-a04b-8cbc2b947fe6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	630576d6-01a3-461a-884e-2a8784e33135	39c89b64-f99f-4f87-8961-918d283727aa	630576d6-01a3-461a-884e-2a8784e33135	0.000000000000000000000000000000	{}	2026-06-25 16:43:27.49
38e0e92a-b3bb-4aaa-948d-0574b819dec7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	aeb6a7b3-bbe0-4deb-8e81-a22cbe2ec3e8	81e58e47-d95c-4d3f-a7e9-5ff88e251b65	aeb6a7b3-bbe0-4deb-8e81-a22cbe2ec3e8	0.000000000000000000000000000000	{}	2026-06-25 17:22:05.655
4761ea63-9375-4e64-b57c-4448df48e9a7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	24e91c72-ffe8-4035-97cb-113a625e23b3	2c472262-7d5b-4af2-ae14-e7bb42b62974	24e91c72-ffe8-4035-97cb-113a625e23b3	0.000000000000000000000000000000	{}	2026-06-25 17:27:49.635
bc104d67-b024-48ba-a272-c5a73eb53f07	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	fa83530d-b8c9-439b-ba53-821c6078356d	5a2e84e4-503f-48bf-9491-c6d0c2a8828b	fa83530d-b8c9-439b-ba53-821c6078356d	0.000000000000000000000000000000	{}	2026-06-25 17:28:00.86
9a9b338a-e715-4abd-9122-fbc697fbf08a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	4bea8dbc-aacd-40fd-8dd1-4e20e859629d	a5469dcd-c373-44ab-9acc-c90fc0748b5e	4bea8dbc-aacd-40fd-8dd1-4e20e859629d	0.000000000000000000000000000000	{}	2026-06-25 17:37:49.962
6db73b98-4e22-45bd-88a6-8e88105495f6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	start_session	session	d38f8548-df32-463c-852c-bc3a859db2e8	5a2e84e4-503f-48bf-9491-c6d0c2a8828b	d38f8548-df32-463c-852c-bc3a859db2e8	0.000000000000000000000000000000	{}	2026-06-25 17:39:48.906
e5e1eed2-a6ff-4dce-bd19-023d60c8821b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	withdrawal_rejected	cash_withdrawal	5b6257d8-dd23-429d-a3f1-1477915e2b78	\N	\N	0.000000000000000000000000000000	{}	2026-06-26 07:15:07.18
c084a632-b7b9-4d33-b03d-8f63e3d1be00	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	shift_closed	shift	6826f136-3104-45ff-af2b-fe1485091dcd	\N	\N	0.000000000000000000000000000000	{"bank": 0, "card": 515000, "cash": 6580000, "balance": 25000, "expenses": 0, "recipient": "Owner", "difference": 0, "cash_expenses": 0, "cash_withdrawn": 0, "remaining_cash": 6555000}	2026-06-26 07:29:57.692
f3a2c362-899a-4a6a-bf68-fb9de9c5b1b6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	start_session	session	f9454b78-d27a-433c-84f2-454769698f50	1cda26e8-da1f-430a-a312-fd4b2ac390a3	f9454b78-d27a-433c-84f2-454769698f50	0.000000000000000000000000000000	{}	2026-06-26 08:09:56.11
56838d4d-1ae2-4b27-a7f9-a4186d84b347	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	withdrawal_requested	cash_withdrawal	46c7e3ca-a411-4481-8bc8-b7f0f426915d	\N	\N	0.000000000000000000000000000000	{"initiator_role": "admin"}	2026-06-26 08:51:03.082
78291cdd-4739-4be4-9b40-e8d940306a5a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	withdrawal_rejected	cash_withdrawal	46c7e3ca-a411-4481-8bc8-b7f0f426915d	\N	\N	0.000000000000000000000000000000	{}	2026-06-26 08:51:12.309
90d02cb6-7847-442d-9341-a53e434605c9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	maintenance_closed	repair_request	db699216-830b-4212-8304-6c9f8e7d4248	1cda26e8-da1f-430a-a312-fd4b2ac390a3	\N	0.000000000000000000000000000000	{}	2026-06-26 08:54:27.792
e8ecef09-148c-4462-a202-f794257d33b3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	shift_closed	shift	ccb60595-93ce-4678-8ce5-a60a7eb458bf	\N	\N	0.000000000000000000000000000000	{"bank": 0, "card": 0, "cash": 0, "balance": 0, "expenses": 0, "recipient": "Owner", "difference": 0, "cash_expenses": 0, "cash_withdrawn": 0, "remaining_cash": 0}	2026-06-30 12:45:29.132
a0f33249-a8e0-4476-add7-d0dd999fe930	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"simulator_map_layout": {"facilities": {"wc": {"col": 6, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 6, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 6, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-30 13:31:07.211
2871b581-c7c8-4279-a5a5-2b7b1aadb4fa	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-06-30 14:00:13.672
5c001f03-0004-45eb-bba1-7ec8970a8031	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	shift_opened	shift	239e7868-75b9-494e-bf14-1530a34cd348	\N	\N	0.000000000000000000000000000000	{"shift_type": "Tungi (19:00 - 03:00)", "starting_cash": 180000}	2026-06-30 14:02:25.51
7a216580-0cee-4e1b-8458-0a884a3e496d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-07-01 17:00:19.899
8e5e676d-06fc-4c49-9eec-006c62bd62cd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	withdrawal_requested	cash_withdrawal	2f09de1d-9394-4c6c-85d9-dc9781452001	\N	\N	0.000000000000000000000000000000	{"initiator_role": "admin"}	2026-07-01 17:41:46.438
bb941cee-9094-4d4c-b0bd-c28cd85d67ab	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	0.000000000000000000000000000000	{}	2026-07-01 17:42:31.356
cc64ef77-406d-44a4-8684-4026537fec9b	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"games": [{"id": "a4b8a8fa-0c05-4fe3-96f2-87fd6d5ba2ba", "name": "AC", "zone": "Standard", "status": "ready", "version": "", "imageUrl": ""}]}	2026-07-01 17:45:59.191
ad273aad-df58-43f2-baae-f33e05749e91	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	settings_updated	settings	\N	\N	\N	0.000000000000000000000000000000	{"games": []}	2026-07-01 17:46:08.718
7a83056e-968d-4bb8-bd28-ed9a5d3b0671	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	withdrawal_rejected	cash_withdrawal	2f09de1d-9394-4c6c-85d9-dc9781452001	\N	\N	0.000000000000000000000000000000	{}	2026-07-01 17:47:16.479
2f3fb21c-be05-4753-a748-5b19fd1c3648	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	login	user	dac28a45-122f-47f0-85d2-9bd2ae523eff	\N	\N	0.000000000000000000000000000000	{}	2026-07-01 17:50:30.158
f3c92d6d-b7bb-47c9-916e-42a64ca87469	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	maintenance_opened	repair_request	eb2dea16-483e-46e9-90bb-2e06d7cfb26c	7b32e26f-38b4-46db-a026-41b7b19ca136	\N	0.000000000000000000000000000000	{}	2026-07-01 17:51:07.052
77d61c38-4b1d-4244-a366-d809fc2361b8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	dev_admin	maintenance_closed	repair_request	eb2dea16-483e-46e9-90bb-2e06d7cfb26c	7b32e26f-38b4-46db-a026-41b7b19ca136	\N	0.000000000000000000000000000000	{}	2026-07-01 17:54:20.411
dd936ce3-5876-4563-99f8-189acc91c136	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_deleted	product	f888b38b-0201-484c-8aef-d3bcb8854950	\N	\N	\N	{}	2026-07-01 22:29:48.85
f1a8a092-3c77-40a3-a557-24832d2af2b6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	maintenance_reviewed	repair_request	eb2dea16-483e-46e9-90bb-2e06d7cfb26c	7b32e26f-38b4-46db-a026-41b7b19ca136	\N	0.000000000000000000000000000000	{"decision": "cleared"}	2026-07-01 17:54:43.22
1e63ffc0-3710-4956-adee-52d34d2864ff	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	shift_closed	shift	239e7868-75b9-494e-bf14-1530a34cd348	\N	\N	0.000000000000000000000000000000	{"bank": 0, "card": 0, "cash": 0, "balance": 0, "expenses": 0, "recipient": "Owner", "difference": 0, "cash_expenses": 0, "cash_withdrawn": 0, "remaining_cash": 180000}	2026-07-01 17:56:16.29
08bc362d-1de6-459a-80a4-4dd56fb6153c	\N	22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	dev_super_admin	login	user	22778489-a0f5-4640-87c1-b24ff009cb87	\N	\N	0.000000000000000000000000000000	{}	2026-07-01 17:56:54.957
f26d9c5c-4fe6-4830-a5f2-cef7570e739e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	cc59e684-4a6b-42cf-9a27-2d1f84755135	\N	\N	\N	{"barcode": "4607065001445"}	2026-07-01 22:30:02.748
ae144e6c-2138-49ed-82c5-366f9ce13777	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	cc59e684-4a6b-42cf-9a27-2d1f84755135	\N	\N	\N	{"barcode": "4607065001445"}	2026-07-01 22:30:04.313
a03eb38e-0d7e-4694-acc7-ffcd5ac0608b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{"barcode": "4780101734269"}	2026-07-01 23:17:33.647
8428bb11-7612-470d-b399-2fec2ca47e34	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{"barcode": "4780101734269"}	2026-07-01 23:17:35.31
3ca20cbd-dc5a-466f-9e84-e543da1c33e0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{"barcode": "4780101734269"}	2026-07-01 23:17:35.972
93560f9a-ad5f-45d9-a485-652dd33eb5ed	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{"barcode": "4780101734269"}	2026-07-01 23:17:36.386
a73f9d46-ac19-4b1d-8af4-585b533296bc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{"barcode": "4780101734269"}	2026-07-01 23:17:36.668
50b0a466-25b5-40b8-bcda-a06110ba36db	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{"barcode": "4780101734269"}	2026-07-01 23:17:37.031
31c79ff8-58a1-44a8-8bbd-89f24632bf49	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{"barcode": "4780101734269"}	2026-07-01 23:17:37.83
8b65139b-011e-4d3e-8169-6b3f3caa433b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{"barcode": "4780101734269"}	2026-07-01 23:17:38.368
f0485366-5478-4aba-8355-e5275d1c6c34	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{"barcode": "4780101734269"}	2026-07-01 23:17:39.66
2cc009fe-7577-4d94-bfd5-adfe622c3006	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{"barcode": "4780101734269"}	2026-07-01 23:17:39.933
10beec3d-69a1-4239-b3aa-361beb2efd8e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{"barcode": "4780101734269"}	2026-07-01 23:17:40.935
8f581a45-1816-46e4-b435-ce7db61afd7f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	ba62679b-176a-473c-81b0-1f156361df92	\N	\N	\N	{"barcode": "4780101734269"}	2026-07-01 23:17:41.329
05dde2f2-c9af-4b42-859b-bee0ab667df7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_created	product	4cb599c8-2d66-4406-a864-6073de3c2002	\N	\N	\N	{}	2026-07-01 23:53:14.724
8bfb801c-b41e-47c8-87bb-57c28337a077	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_inventory_created	product	4cb599c8-2d66-4406-a864-6073de3c2002	\N	\N	\N	{"cost": 0, "icon": "cookie", "name": "Grenki kichik (Chesnochniy)", "price": 10000, "barcode": "4780137640299", "category": "Snack", "stock_after": 10}	2026-07-01 23:53:14.878
d105104a-865f-4ba7-b9cc-9fa27d814092	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	4cb599c8-2d66-4406-a864-6073de3c2002	\N	\N	\N	{"barcode": "4780137640299"}	2026-07-01 23:53:21.16
1fed8b59-f230-428a-b898-a45ac4b57bcd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	4cb599c8-2d66-4406-a864-6073de3c2002	\N	\N	\N	{"barcode": "4780137640299"}	2026-07-01 23:53:21.67
e6c5b471-9ce3-4619-aa04-414150196dc4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	4cb599c8-2d66-4406-a864-6073de3c2002	\N	\N	\N	{"barcode": "4780137640299"}	2026-07-01 23:53:22.382
08dd8c61-47f9-4fac-8759-3f7b6dae49f1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	product_scanned	product	4cb599c8-2d66-4406-a864-6073de3c2002	\N	\N	\N	{"barcode": "4780137640299"}	2026-07-01 23:53:22.83
e9c24a42-6f2d-4d2a-870c-958735d50d51	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	add_time	session	c812bae3-196e-4130-a847-8284d058f11a	4fb435c0-0277-404e-be64-adbd714b9f46	c812bae3-196e-4130-a847-8284d058f11a	100000.000000000000000000000000000000	{}	2026-07-05 16:05:05.667
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.payments (id, branch_id, session_id, sale_id, customer_id, amount, method, cash_amount, card_amount, qr_amount, balance_amount, received_amount, change_amount, status, paid_by_admin_id, paid_at, created_at, shift_id, source_type, source_note) FROM stdin;
b5065d42-339f-4465-8c21-604119856967	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	3c127e17-0277-493e-91fd-7ecbbeb32524	\N	0.000000000000000000000000000000	card	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-12 07:42:30.959	2026-06-12 07:42:30.959	fa1772cc-fde3-4d4e-a506-674fd018a35a	payment	\N
c46362d7-c758-47d4-a355-119670a249cd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	ed42b073-733a-498d-81d3-667ef66ecf08	b172db10-871c-4988-93d1-9c69c2906154	0.000000000000000000000000000000	card	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 07:55:46.329	2026-06-12 07:55:46.329	816f18dc-3598-41e4-ac94-c0da90ecff6e	payment	\N
dd2fd37b-e9d6-4ecd-a8b6-45a40268cbb6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	8a4de02e-ed8b-436f-a29b-1486396453aa	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-15 12:19:52.836	2026-06-15 12:19:52.836	6c475e03-e99b-4279-b329-6e2f9e069357	payment	\N
06c354db-7d5e-42b8-bf31-b8e6828ebe1f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	0a9e69ed-410f-4880-af17-e22c8262dc2d	\N	b172db10-871c-4988-93d1-9c69c2906154	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-15 12:23:10.938	2026-06-15 12:23:10.938	6c475e03-e99b-4279-b329-6e2f9e069357	payment	\N
ef8fe803-ed1d-4d64-b8be-a1ec050230b1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	0c567b87-b378-4fc7-9660-e9c422a1fad0	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	22778489-a0f5-4640-87c1-b24ff009cb87	2026-06-17 17:06:09.899	2026-06-17 17:06:09.899	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
6da69476-8d2b-4de5-a956-3e0d133422a2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	90c44abb-4814-4a53-8897-83426a50e674	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 16:20:45.039	2026-06-25 16:20:45.039	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
6221beb0-0d5a-47c4-9ae3-f788575cbf03	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	3fe25825-9619-459c-a254-996e547f7fb1	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 16:38:15.938	2026-06-25 16:38:15.938	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
7c6f494d-8137-4ccd-bcbe-6bf3527510b6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	aeb6a7b3-bbe0-4deb-8e81-a22cbe2ec3e8	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 17:22:02.957	2026-06-25 17:22:02.957	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
3088e7af-8e27-4684-906c-b31e742defae	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	24e91c72-ffe8-4035-97cb-113a625e23b3	\N	\N	0.000000000000000000000000000000	card	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 17:27:47.107	2026-06-25 17:27:47.107	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
0ad5dbb3-ccf1-4841-ad1b-3313184134d4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	fa83530d-b8c9-439b-ba53-821c6078356d	\N	\N	0.000000000000000000000000000000	card	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 17:27:58.309	2026-06-25 17:27:58.309	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
7aca1305-43f1-4fdb-99e4-0f3b49df0cd2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	4bea8dbc-aacd-40fd-8dd1-4e20e859629d	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 17:37:46.994	2026-06-25 17:37:46.994	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
c42c7114-88e8-49c7-92ac-710c0cd4cd23	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	d38f8548-df32-463c-852c-bc3a859db2e8	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 17:39:46.257	2026-06-25 17:39:46.257	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
c0800d79-7a71-451f-aa3d-22eb68f38e8a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f9454b78-d27a-433c-84f2-454769698f50	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	dac28a45-122f-47f0-85d2-9bd2ae523eff	2026-06-26 08:09:48.293	2026-06-26 08:09:48.293	ccb60595-93ce-4678-8ce5-a60a7eb458bf	payment	\N
4390a088-0afb-4fc3-85d4-adc5c9751a15	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	50c4f384-ddd8-4514-b73c-1aa531df554c	\N	\N	40000.000000000000000000000000000000	card	0.000000000000000000000000000000	40000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 18:34:15.262	2026-07-01 18:34:15.262	cb40ae37-235a-4bca-9510-027675548a1e	payment	\N
599d1728-0da1-478f-bc10-756aac0aa92c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	43832062-345c-40b1-bcb3-4d64d5b5f4ea	\N	\N	80000.000000000000000000000000000000	cash	80000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 19:45:16.657	2026-07-01 19:45:16.657	cb40ae37-235a-4bca-9510-027675548a1e	payment	\N
4cf8a5c3-2a4a-42e6-a32c-46a5b78f112c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	3779e8f6-05ae-4efa-a13d-09f4bfbf2e26	\N	\N	40000.000000000000000000000000000000	cash	40000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 20:56:02.504	2026-07-01 20:56:02.504	cb40ae37-235a-4bca-9510-027675548a1e	payment	\N
b435c541-6474-4c79-9470-5c3aa75acedb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	b692f45d-1902-4172-9a73-6ca58f9a5a39	\N	\N	200000.000000000000000000000000000000	cash	200000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	22778489-a0f5-4640-87c1-b24ff009cb87	2026-07-02 08:41:37.057	2026-07-02 08:41:37.057	1d0dea0e-a911-49de-a5bb-d67707597bf1	payment	\N
d9605559-30e9-4348-b68e-83c3f300c42d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	844fee3c-29d4-4607-84dc-b274bdc610ad	\N	20000.000000000000000000000000000000	cash	20000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	20000.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:14:31.192	2026-07-05 15:14:31.192	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
870efb04-e49d-4df8-8cd9-d206caee2c3d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	2a86cce4-e6d1-4cf1-adb9-b746eb0495ed	\N	\N	50000.000000000000000000000000000000	card	0.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:18:35.999	2026-07-05 15:18:35.999	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
aeb32b3c-ef8a-45c9-a3e8-f860bac3acfa	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	d7c24a68-c2d4-4fa4-96ca-bcb48930cc7c	\N	\N	50000.000000000000000000000000000000	cash	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:19:05.645	2026-07-05 15:19:05.645	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
36785f91-b8f1-4728-a556-b16b277d486d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	541f408d-e9b0-43eb-ae9c-22c0d0351143	\N	\N	100000.000000000000000000000000000000	card	0.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:56:05.848	2026-07-05 15:56:05.848	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
ea1b7193-8116-49ea-9275-992bb63651c4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	8fb0363b-1732-4709-9d78-833e5a634d70	\N	\N	100000.000000000000000000000000000000	card	0.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:56:25.46	2026-07-05 15:56:25.46	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
997f37d5-0da0-48da-9131-fd4068c39902	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	c812bae3-196e-4130-a847-8284d058f11a	\N	\N	100000.000000000000000000000000000000	card	0.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 16:05:05.247	2026-07-05 16:05:05.247	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
c475603d-8fb0-48f1-9984-45cdb207dc32	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	d014d98c-c1f0-4ddf-a1dc-c07d26a1548d	\N	\N	50000.000000000000000000000000000000	card	0.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 16:11:46.834	2026-07-05 16:11:46.834	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
bf77150f-4b97-463c-adca-cfdc221faa7f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	af2d8df2-f42d-4f37-b43c-9e8a5ab99d9f	\N	\N	50000.000000000000000000000000000000	cash	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 17:18:42.373	2026-07-05 17:18:42.373	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
7234ab5d-1409-4fdc-bce3-a618c077ad22	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a7464126-f401-41c1-ac87-9b1645395653	\N	\N	50000.000000000000000000000000000000	cash	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 17:29:48.044	2026-07-05 17:29:48.044	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
cdb25b07-a26a-470c-8126-b6661dd41d29	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	3fc61fd1-7cce-4505-b766-9d2ca3996e4f	\N	\N	50000.000000000000000000000000000000	cash	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 17:31:08.624	2026-07-05 17:31:08.624	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
fea6899f-b212-42b5-b46b-71af0ec5391d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	e05add79-61ec-44cf-b53a-d0e40cc2e70e	\N	\N	50000.000000000000000000000000000000	cash	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 17:34:23.092	2026-07-05 17:34:23.092	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
a86641f7-03d5-413c-a2e0-6352940652e1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	88317b37-2700-4234-9a86-81af041b63bf	\N	\N	50000.000000000000000000000000000000	card	0.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 18:01:50.956	2026-07-05 18:01:50.956	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
40bb099e-1c3c-45c1-becc-9494366b878b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7de98944-8531-4695-a872-8b7f5e480d88	\N	\N	50000.000000000000000000000000000000	card	0.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 18:02:34.512	2026-07-05 18:02:34.512	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
71f08dd0-5a55-4a22-8477-0cbe7ac96aed	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	50591526-1512-42a8-8f95-f5349e684ea0	58dceacf-f773-4e62-bd9e-7748904919fa	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-17 17:07:28.845	2026-06-17 17:07:28.845	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
a326daa1-3139-4614-b674-d1d5c728051c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	f0b4c386-cacf-4a14-9969-2db028ca289e	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	22778489-a0f5-4640-87c1-b24ff009cb87	2026-06-17 17:07:46.436	2026-06-17 17:07:46.436	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
caf2291b-aab7-4913-ad9f-619f151a84f0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	8bd255d0-1d69-4684-b1f8-328dd0167dfc	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-17 17:28:14.01	2026-06-17 17:28:14.01	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
322151ea-df8e-42d9-8229-b50ae502de6b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	0.000000000000000000000000000000	card	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	22778489-a0f5-4640-87c1-b24ff009cb87	2026-06-17 17:34:31.127	2026-06-17 17:34:31.127	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
b21585ee-7340-4332-883f-bc15d3157b82	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7a22c4d5-83c0-4b0f-a8c8-8c07252340a4	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-17 19:10:11.988	2026-06-17 19:10:11.988	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
189a1a3d-636c-46fb-8c02-e1df898c6c7e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	20222f92-3770-4b88-895a-f0ab6d2a03ed	0.000000000000000000000000000000	card	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-18 07:45:24.3	2026-06-18 07:45:24.3	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
696854da-2dfa-4135-9e54-5f20caeac905	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7b067a26-3b21-40a8-a8b6-b42587785623	\N	20222f92-3770-4b88-895a-f0ab6d2a03ed	0.000000000000000000000000000000	card	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-18 07:48:57.607	2026-06-18 07:48:57.607	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
7f2eaef2-d0fb-4660-9268-7454413078a2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	d5bd811f-a445-4d11-a7db-54b653efe0a3	\N	20222f92-3770-4b88-895a-f0ab6d2a03ed	0.000000000000000000000000000000	balance	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-18 08:11:09.622	2026-06-18 08:11:09.622	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
5664daa2-fc5c-47b4-8f09-1f8a1b726e31	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7faf187d-c634-4661-834a-fac80405cf0d	\N	ced4930c-9a08-4434-a233-43d08364a850	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	dac28a45-122f-47f0-85d2-9bd2ae523eff	2026-06-25 08:33:22.668	2026-06-25 08:33:22.668	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
c4418b4c-19b7-42b2-851c-9397daa5366f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	0ccec717-5e34-4a37-b9ee-bc8c156e2260	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	dac28a45-122f-47f0-85d2-9bd2ae523eff	2026-06-25 08:49:30.148	2026-06-25 08:49:30.148	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
b1f830c7-84e1-4639-b37e-85cb40b5b8ee	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	fa334467-2bf7-4dd3-914b-58b2a7b4c7a7	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	22778489-a0f5-4640-87c1-b24ff009cb87	2026-06-25 14:02:40.295	2026-06-25 14:02:40.295	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
7237e5ab-7d24-4a22-bc3d-ed21d3b9e24a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	966ef5a2-ac1b-4197-ba91-76a4d00b4d9a	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	22778489-a0f5-4640-87c1-b24ff009cb87	2026-06-25 14:03:03.169	2026-06-25 14:03:03.169	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
2fc35dfb-a86b-403b-bcbc-d31e6e4ee3e2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	4c90b3ba-7faf-491c-9049-c807cc2056f1	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	22778489-a0f5-4640-87c1-b24ff009cb87	2026-06-25 14:07:13.811	2026-06-25 14:07:13.811	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
027517a2-9c02-43cc-aebd-31f16f079fab	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	0ad39109-12db-422a-b7fd-b232f8ce8645	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 15:13:37.252	2026-06-25 15:13:37.252	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
91d6f8c4-29aa-434c-beb5-15da02dab9c2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a642a180-6aa6-4107-a961-a0d9aa60cd2b	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 15:24:33.405	2026-06-25 15:24:33.405	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
4ba12599-e466-4bd3-a88b-7cce3308d2da	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	17a9ea03-8a9f-4f3f-be42-923625bd5bda	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 15:24:58.16	2026-06-25 15:24:58.16	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
15b7bdf7-1bbc-4b0e-80e2-8d50100ee0a1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	17a9ea03-8a9f-4f3f-be42-923625bd5bda	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 15:25:35.021	2026-06-25 15:25:35.021	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
dee4d9b7-93f0-4c13-b8c8-6476a31a5e67	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	8abd94ff-d60c-435d-a9cc-b66c8d18c06a	\N	\N	0.000000000000000000000000000000	card	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 16:02:07.587	2026-06-25 16:02:07.587	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
232829d3-62ef-433a-b6a6-c2b08dbfb9b8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	b33ebbbb-d1bf-4263-8ca7-64c04bf252af	\N	\N	0.000000000000000000000000000000	cash	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.00	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 16:04:42.989	2026-06-25 16:04:42.989	6826f136-3104-45ff-af2b-fe1485091dcd	payment	\N
abc9e854-f279-4f77-b671-756c1b2fb4d4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	795d7232-3141-482f-94bf-03668fa7835a	\N	\N	80000.000000000000000000000000000000	cash	80000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 18:26:52.351	2026-07-01 18:26:52.351	cb40ae37-235a-4bca-9510-027675548a1e	payment	\N
13cf9eca-7033-47be-a8d5-6b7436ee400c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	1067e9c0-d8ce-4d5e-95df-bd6a3223bd71	\N	35000.000000000000000000000000000000	card	0.000000000000000000000000000000	35000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 19:00:58.532	2026-07-01 19:00:58.532	cb40ae37-235a-4bca-9510-027675548a1e	payment	\N
df3a4847-b0df-4fcb-8de8-3acf43f8b20a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	4ff9acc4-5f51-4e9f-9b3b-818041f37c7d	\N	\N	40000.000000000000000000000000000000	cash	40000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 19:52:02.534	2026-07-01 19:52:02.534	cb40ae37-235a-4bca-9510-027675548a1e	payment	\N
64e9f3c1-734c-4eef-b6e3-3c2a9fc5f594	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	2236605a-1f99-48c5-b5f0-e6c17db02d4b	\N	\N	40000.000000000000000000000000000000	cash	40000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 20:56:14.958	2026-07-01 20:56:14.958	cb40ae37-235a-4bca-9510-027675548a1e	payment	\N
0f4c909b-d3ac-4f2b-8482-bbbe81a58bab	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f9349071-83ca-4400-bd6e-bad12c611cd0	\N	\N	200000.000000000000000000000000000000	cash	200000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	22778489-a0f5-4640-87c1-b24ff009cb87	2026-07-02 08:42:33.323	2026-07-02 08:42:33.323	1d0dea0e-a911-49de-a5bb-d67707597bf1	payment	\N
af925c20-c782-4c96-9ab2-ee7924b8e7b9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	8f19acc8-5bd5-4a3d-a926-62d3a0f3b1ac	\N	30000.000000000000000000000000000000	card	0.000000000000000000000000000000	30000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:18:09.422	2026-07-05 15:18:09.422	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
14323da6-15a9-4021-9adf-92023279de17	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	c1becbf1-7f0a-4be9-8063-8f91857b1057	\N	\N	50000.000000000000000000000000000000	card	0.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:18:46.866	2026-07-05 15:18:46.866	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
5ce7109b-060f-407e-9b19-7f93258dcdee	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	e7cca17f-9833-4f59-ac2e-e936bfc14119	\N	\N	50000.000000000000000000000000000000	cash	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:19:14.228	2026-07-05 15:19:14.228	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
257b3ebf-15a6-45a9-8124-a7d741d08edd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	c812bae3-196e-4130-a847-8284d058f11a	\N	\N	100000.000000000000000000000000000000	card	0.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 16:02:39.793	2026-07-05 16:02:39.793	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
fabb767c-dbc3-47d4-a79c-b896ce9b8cfd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	541f408d-e9b0-43eb-ae9c-22c0d0351143	\N	\N	100000.000000000000000000000000000000	card	0.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 16:05:35.559	2026-07-05 16:05:35.559	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
9408ff49-e6d4-475e-a779-f504265b0d2a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	63c908d4-c831-4252-bc67-f5701de7c381	\N	\N	50000.000000000000000000000000000000	card	0.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 16:12:13.362	2026-07-05 16:12:13.362	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
aaba0070-3783-498b-b25b-0f70b367fcd2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	5f6b8747-0684-4d2f-b5ac-a508e75c477d	\N	\N	50000.000000000000000000000000000000	card	0.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 17:27:41.368	2026-07-05 17:27:41.368	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
ea4100cf-c1ea-45c8-8738-0ea065ffd097	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	347e6566-f9e8-43b6-8ff3-88957687aede	\N	\N	50000.000000000000000000000000000000	cash	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 17:31:41.864	2026-07-05 17:31:41.864	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
b8468f60-82bd-4127-bcb2-5223b94b99d9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	6267a112-d5c1-4e3c-97df-42bc1da8d3e3	\N	\N	100000.000000000000000000000000000000	card	0.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 18:01:09.278	2026-07-05 18:01:09.278	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
63e5209e-183c-4648-8671-25f6b3abfd91	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	b9f9dd7b-e7ef-4e8a-bc86-b4d098dfb6ad	\N	\N	50000.000000000000000000000000000000	card	0.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 18:02:02.975	2026-07-05 18:02:02.975	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
f963fd3f-391c-4c65-9530-2e2302ce91c2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	23a26ba2-ffa9-4f5b-8d77-4b6f8531b1fb	\N	\N	50000.000000000000000000000000000000	card	0.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 18:02:12.554	2026-07-05 18:02:12.554	17d4da99-d22d-4f8c-bd87-88841a733ede	payment	\N
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.products (id, name, category, barcode, price, cost, icon, is_active, created_at, updated_at) FROM stdin;
bb986954-5cca-41bc-82aa-8821c8faa139	Keshyu kichik	Ichimliklar	4780102760113	15000.000000000000000000000000000000	0.000000000000000000000000000000	snack	t	2026-07-01 22:47:40.081	2026-07-01 22:47:41.226
eb6792f0-ef4b-4774-9002-cb219c7ac8d9	Bfresh Mango	Ichimliklar	4780072660239	15000.000000000000000000000000000000	0.000000000000000000000000000000	energy	t	2026-07-01 22:52:55.092	2026-07-01 22:52:55.092
41a3b5bf-e4cb-42d4-b061-0558d3ddc93d	Bfresh Klubnika	Ichimliklar	4780072660178	15000.000000000000000000000000000000	0.000000000000000000000000000000	energy	t	2026-07-01 22:54:06.281	2026-07-01 22:54:06.281
38cf6445-2d6f-4ec1-9d1e-d30976aa503b	Moxito Katta	Ichimliklar	4600068058058	18000.000000000000000000000000000000	0.000000000000000000000000000000	energy	t	2026-07-01 22:57:54.819	2026-07-01 22:57:56.095
ba62679b-176a-473c-81b0-1f156361df92	18+	Ichimliklar	4780101734269	15000.000000000000000000000000000000	0.000000000000000000000000000000	bottle	t	2026-06-12 15:37:12.411	2026-07-01 19:02:54.88
39ba6975-8c2e-46bb-8eab-3d96f7bc1afd	Coca coal 0,5	Ichimliklar	4780069000130	10000.000000000000000000000000000000	0.000000000000000000000000000000	snack	t	2026-07-01 23:05:20.895	2026-07-01 23:05:21.901
c7a8dd61-af92-46e6-989c-10204958f5cb	Ays tea	Ichimliklar	4780101732340	10000.000000000000000000000000000000	0.000000000000000000000000000000	/product-images/aic-tea.png	t	2026-07-01 23:31:48.556	2026-07-02 07:13:43.797
ce629280-202d-4251-81a4-c6771a15fa00	Saber	Ichimliklar	4780072660215	15000.000000000000000000000000000000	0.000000000000000000000000000000	energy	t	2026-07-01 23:05:57.926	2026-07-01 23:05:58.995
717e503a-2141-4d77-9243-453133378a61	Flash kichik	Ichimliklar	4780068020023	15000.000000000000000000000000000000	0.000000000000000000000000000000	energy	t	2026-07-01 23:13:32.164	2026-07-01 23:13:32.164
9062379f-fbce-4452-aec1-42465710a42c	Sushki kichik	Snack	4780035860010	12000.000000000000000000000000000000	0.000000000000000000000000000000	snack	t	2026-07-01 23:15:21.057	2026-07-01 23:15:57.449
e97d5c26-14af-48cc-ac27-ded8cd286c32	Moxito klubnika kichik	Ichimliklar	4600068054142	15000.000000000000000000000000000000	0.000000000000000000000000000000	energy	t	2026-07-01 23:26:15.882	2026-07-01 23:26:15.882
3e44b847-85aa-4ad0-83f0-c696cb14f0c8	Moxito laym kichik	Ichimliklar	4600068054128	15000.000000000000000000000000000000	0.000000000000000000000000000000	energy	t	2026-07-01 23:26:59.699	2026-07-01 23:26:59.699
60fbc4cd-9378-4bb5-8ea2-ee7f4a62ddec	Fuse tea Ramashka	Ichimliklar	4780069000840	10000.000000000000000000000000000000	0.000000000000000000000000000000	water	t	2026-07-01 23:28:29.909	2026-07-01 23:28:29.909
d37b6dc1-06ed-4d7c-b0a8-1ac2b3c755f3	Fuse tea Ananas	Ichimliklar	4780069000864	10000.000000000000000000000000000000	0.000000000000000000000000000000	drink	t	2026-07-01 23:29:18.713	2026-07-01 23:29:18.713
53f9c27b-c18d-4e5c-9e9c-4e17e7544704	Fuse tea Shaftoli	Ichimliklar	4780069000819	10000.000000000000000000000000000000	0.000000000000000000000000000000	drink	t	2026-07-01 23:30:26.91	2026-07-01 23:30:26.91
e59f9b81-a33d-4887-b2ac-254daf515c1b	Flash katta	Ichimliklar	4780068020047	18000.000000000000000000000000000000	0.000000000000000000000000000000	energy	t	2026-07-01 22:21:32.365	2026-07-01 22:22:25.015
a1d6a446-3e0c-4a20-951e-50c7b1b34fa4	Пластик курт	Snack	4780102760304	10000.000000000000000000000000000000	0.000000000000000000000000000000	bottle	t	2026-06-12 15:14:20.309	2026-06-12 15:45:11.653
97ae7f2f-c33b-4027-9fc7-d29dbbee6c60	Lipton	Ichimliklar	4780022620498	10000.000000000000000000000000000000	0.000000000000000000000000000000	drink	t	2026-07-01 23:31:11.257	2026-07-01 23:31:11.257
a447b302-fcc0-4a85-833f-f86236329fe4	M&Ms	Snack	4607065000868	15000.000000000000000000000000000000	0.000000000000000000000000000000	snack	t	2026-06-12 15:14:57.812	2026-06-17 17:02:06.821
5e0c3039-285f-41ad-baa0-1a59a60e9c34	Water 0.5	Drinks	4780001000028	5000.000000000000000000000000000000	2500.000000000000000000000000000000	snack	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511
5a570593-cfbb-4e09-9ad9-ff5cd4472900	TWIX	Snack	6221134012712	10000.000000000000000000000000000000	0.000000000000000000000000000000	candy	t	2026-07-01 22:32:59.425	2026-07-01 22:32:59.425
8f5711c5-1246-409e-ada9-73c3c7a9256b	Burger	Fast food	0001BRG	25000.000000000000000000000000000000	17000.000000000000000000000000000000	snack	t	2026-06-29 08:22:24.511	2026-07-01 18:46:17.459
cc59e684-4a6b-42cf-9a27-2d1f84755135	Snickers	Snack	4607065001445	10000.000000000000000000000000000000	6500.000000000000000000000000000000	candy	t	2026-06-29 08:22:24.511	2026-07-01 18:58:13.269
bb889a9a-f2a0-4c2f-84c8-d03a026f5f2c	Вакуум курт райхон	Snack	4780102760328	10000.000000000000000000000000000000	6500.000000000000000000000000000000	snack	t	2026-07-01 22:39:48.811	2026-07-01 22:39:48.811
3e2c3880-6c39-4c2a-a3a1-010a186006ff	Bfresh limon	Ichimliklar	4780072660161	15000.000000000000000000000000000000	0.000000000000000000000000000000	energy	t	2026-07-01 22:24:35.382	2026-07-01 22:40:20.425
d67b1954-9761-4dd4-a1ad-34bf55a8d770	Вакуум курт тош	Snack	4780102760335	10000.000000000000000000000000000000	6500.000000000000000000000000000000	snack	t	2026-07-01 22:38:21.573	2026-07-01 22:41:32.872
f540f44e-9244-4f00-8184-afcdd580cc5f	Шурданак M	Snack	4780102760144	15000.000000000000000000000000000000	0.000000000000000000000000000000	snack	t	2026-06-12 15:21:44.067	2026-07-01 22:41:47.749
acfb40b5-6e27-4a1b-ba4c-aa032c69c4c7	Redbull kichik	Ichimliklar	90415258	22000.000000000000000000000000000000	15000.000000000000000000000000000000	energy	t	2026-07-01 22:44:20.93	2026-07-01 22:44:22.334
7d8f12ab-9034-45c3-8735-b0ee46ce172c	Fistashki kichik	Ichimliklar	4780102760137	15000.000000000000000000000000000000	0.000000000000000000000000000000	snack	t	2026-07-01 22:46:02.594	2026-07-01 22:46:02.594
24219e09-0e40-42ad-bada-6faf4a48aca5	Mindal kichik	Ichimliklar	4780102760120	15000.000000000000000000000000000000	0.000000000000000000000000000000	snack	t	2026-07-01 22:46:48.628	2026-07-01 22:46:48.628
c242a797-938f-4f49-9b4f-e2b8952a04a3	Sprite	Ichimliklar	4780069000215	10000.000000000000000000000000000000	0.000000000000000000000000000000	drink	t	2026-07-01 23:32:29.736	2026-07-01 23:32:29.736
578cd664-747b-4ea0-aa1e-fde12edec97b	Fanta 0,5	Ichimliklar	4780069000178	10000.000000000000000000000000000000	0.000000000000000000000000000000	drink	t	2026-07-01 23:33:28.915	2026-07-01 23:33:28.915
775d3fb8-0729-4175-8aab-091f396192c1	V Bez gaz 0.5	Ichimliklar	4780136570016	5000.000000000000000000000000000000	0.000000000000000000000000000000	drink	t	2026-07-01 23:34:22.535	2026-07-01 23:34:22.535
47b6ac8c-8343-4a42-9d96-cb8d2dc85e32	H Bez gaz	Ichimliklar	4780012960153	5000.000000000000000000000000000000	0.000000000000000000000000000000	drink	t	2026-07-01 23:34:58.031	2026-07-01 23:34:58.031
dd4c1fc7-15cd-4f0c-96af-c81faf8668e1	Flin katta Shashlik	Snack	4780137640152	15000.000000000000000000000000000000	0.000000000000000000000000000000	cookie	t	2026-07-01 23:37:25.61	2026-07-01 23:37:25.61
72daa972-3cc5-42ba-b7e0-2c06682f5137	Flint kichik crab	Snack	4780137640022	10000.000000000000000000000000000000	0.000000000000000000000000000000	cookie	t	2026-07-01 23:38:18.328	2026-07-01 23:38:18.328
16070d60-617d-4fc2-9bbd-7177460cf31b	Lay's kichik 37gr (luk)	Ichimliklar	4690388116101	10000.000000000000000000000000000000	0.000000000000000000000000000000	cookie	t	2026-07-01 23:39:45.194	2026-07-01 23:39:45.194
58dd5df1-c231-479a-afa9-014019c543ea	Lay's kichik 37gr (smetana)	Snack	4690388116125	10000.000000000000000000000000000000	0.000000000000000000000000000000	cookie	t	2026-07-01 23:40:45.853	2026-07-01 23:40:45.853
339d63d6-9619-46b0-a3e1-98b7d9ce5fbb	Lay's kichik 37gr (sirniy)	Snack	4690388116163	10000.000000000000000000000000000000	0.000000000000000000000000000000	cookie	t	2026-07-01 23:42:12.419	2026-07-01 23:42:12.419
8f2c46bd-aeaa-4e5e-8d16-8b8356a56116	Lay's kichik 37gr (crab)	Snack	4690388116187	10000.000000000000000000000000000000	0.000000000000000000000000000000	cookie	t	2026-07-01 23:43:08.271	2026-07-01 23:43:08.271
a8e0178e-a428-4b02-939c-784ef65743db	Flint kichik (kolbasniy)	Snack	4780137640053	10000.000000000000000000000000000000	0.000000000000000000000000000000	cookie	t	2026-07-01 23:44:48.323	2026-07-01 23:44:48.323
30c68431-762c-4116-a9c2-8870ab5d3eed	Flint kichik (kolbasniy grill)	Snack	4870254130763	10000.000000000000000000000000000000	0.000000000000000000000000000000	chicken	t	2026-07-01 23:46:36.772	2026-07-01 23:46:36.772
32576e86-47cb-4355-b6e9-6c6bb1e683f7	Lay's Katta 70gr (sirniy)	Snack	4690388121044	20000.000000000000000000000000000000	0.000000000000000000000000000000	pizza	t	2026-07-01 23:47:58.902	2026-07-01 23:47:58.902
1c521c54-f6c8-4967-8d4b-b4e2b7bcdd73	Grenki kichik (go'shtli)	Snack	4780137640237	10000.000000000000000000000000000000	0.000000000000000000000000000000	cookie	t	2026-07-01 23:50:33.811	2026-07-01 23:50:33.811
7a691efc-030a-49c6-9620-4fea2843cd22	Grenki katta (Salyami)	Snack	4780137640213	15000.000000000000000000000000000000	0.000000000000000000000000000000	chicken	t	2026-07-01 23:49:20.879	2026-07-01 23:51:27.449
30e4ca1e-89e8-414f-a5e4-6f41802d4855	Grenki kichik (tomatnniy)	Snack	4870254130466	10000.000000000000000000000000000000	0.000000000000000000000000000000	cookie	t	2026-07-01 23:52:08.007	2026-07-01 23:52:08.007
4cb599c8-2d66-4406-a864-6073de3c2002	Grenki kichik (Chesnochniy)	Snack	4780137640299	10000.000000000000000000000000000000	0.000000000000000000000000000000	cookie	t	2026-07-01 23:53:14.296	2026-07-01 23:53:14.296
0aede6ba-4094-4e51-b8db-789b35b8b8ee	Megachips (sirniy)	Snack	4810279000429	10000.000000000000000000000000000000	0.000000000000000000000000000000	chicken	t	2026-07-01 23:54:25.415	2026-07-01 23:54:25.415
673d5c1c-9f54-40c5-b8b2-a7d55713a15e	Megachips (achik)	Snack	4810279008340	10000.000000000000000000000000000000	0.000000000000000000000000000000	cookie	t	2026-07-01 23:55:11.273	2026-07-01 23:55:11.273
71fb7685-1cd4-4c96-bed3-b30cac8e52b7	Megachips (shashlik)	Snack	4810279008487	10000.000000000000000000000000000000	0.000000000000000000000000000000	cookie	t	2026-07-01 23:55:59.649	2026-07-01 23:55:59.649
f9e6adf0-8e50-4668-938d-19e7ef32b766	Megachips (pitsa)	Snack	4810279008654	10000.000000000000000000000000000000	0.000000000000000000000000000000	cookie	t	2026-07-02 00:02:04.927	2026-07-02 00:02:04.927
665ed85f-481f-4375-b438-586951259c8d	Megachips (kalbasniy)	Snack	4810279009187	10000.000000000000000000000000000000	0.000000000000000000000000000000	cookie	t	2026-07-02 00:02:46.098	2026-07-02 00:02:46.098
\.


--
-- Data for Name: repair_requests; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.repair_requests (id, branch_id, simulator_id, requested_by, approved_by, confirmed_by, title, description, error_type, priority, status, admin_note, super_admin_note, requested_at, approved_at, fixing_started_at, marked_fixed_at, confirmed_at, revenue_impact, created_at, updated_at, closed_at, duration_minutes, charge_amount, review_status, reviewed_by, reviewed_at, session_id, opened_during_session) FROM stdin;
7754fbc5-b708-41d8-83e3-0384d4c3a37f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	36685d3d-ff4a-4c91-86a3-11962fa0a45d	67005460-527d-4723-915f-8ff20067e42d	\N	\N	Sessiya vaqtida texnik nosozlik	Muammo tafsilotlari maintenance yopilayotganda kiritiladi.	other	medium	requested	\N	\N	2026-07-05 17:32:42.004	\N	\N	2026-07-05 17:34:04.56	\N	0.000000000000000000000000000000	2026-07-05 17:32:42.004	2026-07-05 17:34:04.74	2026-07-05 17:34:04.56	2	1667.00	pending_review	\N	\N	347e6566-f9e8-43b6-8ff3-88957687aede	t
3b2fbeef-7eda-4119-b98e-a350cf59b50d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7b32e26f-38b4-46db-a026-41b7b19ca136	67005460-527d-4723-915f-8ff20067e42d	\N	\N	forza	forza	device_error	medium	requested	forza	\N	2026-07-05 16:41:50.533	\N	\N	2026-07-05 16:42:12.67	\N	0.000000000000000000000000000000	2026-07-05 16:41:50.533	2026-07-05 16:42:12.859	2026-07-05 16:42:12.67	1	833.00	pending_review	\N	\N	\N	f
8caed594-6236-4f65-bb65-92a14dc6ed8f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	1b7395de-87f0-46f0-996e-6d62617e0922	67005460-527d-4723-915f-8ff20067e42d	\N	\N	forza	forza	device_error	medium	requested	forza	\N	2026-07-05 16:41:32.067	\N	\N	2026-07-05 17:17:53.935	\N	0.000000000000000000000000000000	2026-07-05 16:41:32.067	2026-07-05 17:17:54.162	2026-07-05 17:17:53.935	36	30000.00	pending_review	\N	\N	\N	f
7874570c-19eb-4b81-91ad-47e72dd3c929	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f124efe3-f0cc-4116-8984-b2d1bae6885b	67005460-527d-4723-915f-8ff20067e42d	\N	\N	forza	forza	device_error	medium	requested	forza	\N	2026-07-05 16:41:41.921	\N	\N	2026-07-05 17:18:27.328	\N	0.000000000000000000000000000000	2026-07-05 16:41:41.921	2026-07-05 17:18:27.52	2026-07-05 17:18:27.328	37	30833.00	pending_review	\N	\N	\N	f
65efd2f5-d983-42dd-84d9-efbe763efed7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	36685d3d-ff4a-4c91-86a3-11962fa0a45d	67005460-527d-4723-915f-8ff20067e42d	\N	\N	Sessiya vaqtida texnik nosozlik	Muammo tafsilotlari maintenance yopilayotganda kiritiladi.	other	medium	requested	\N	\N	2026-07-05 17:27:51.242	\N	\N	2026-07-05 17:29:18.807	\N	0.000000000000000000000000000000	2026-07-05 17:27:51.242	2026-07-05 17:29:18.984	2026-07-05 17:29:18.807	2	1667.00	pending_review	\N	\N	5f6b8747-0684-4d2f-b5ac-a508e75c477d	t
8aa6ca53-0c4a-49f0-8808-14b8578e64ee	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	36685d3d-ff4a-4c91-86a3-11962fa0a45d	67005460-527d-4723-915f-8ff20067e42d	\N	\N	Sessiya vaqtida texnik nosozlik	Muammo tafsilotlari maintenance yopilayotganda kiritiladi.	other	critical	requested	\N	\N	2026-07-05 17:30:00.589	\N	\N	2026-07-05 17:30:50.484	\N	0.000000000000000000000000000000	2026-07-05 17:30:00.589	2026-07-05 17:30:50.687	2026-07-05 17:30:50.484	0	0.00	pending_review	\N	\N	a7464126-f401-41c1-ac87-9b1645395653	t
6fbeb733-1092-4a73-b5e4-9ed32cff723a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	36685d3d-ff4a-4c91-86a3-11962fa0a45d	67005460-527d-4723-915f-8ff20067e42d	\N	\N	Sessiya vaqtida texnik nosozlik	Muammo tafsilotlari maintenance yopilayotganda kiritiladi.	other	medium	requested	\N	\N	2026-07-05 17:31:32.597	\N	\N	2026-07-05 17:32:05.49	\N	0.000000000000000000000000000000	2026-07-05 17:31:32.597	2026-07-05 17:32:05.567	2026-07-05 17:32:05.49	1	833.00	pending_review	\N	\N	3fc61fd1-7cce-4505-b766-9d2ca3996e4f	t
\.


--
-- Data for Name: rig_connections; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.rig_connections (id, rig_id, simulator_id, branch_id, hostname, label, version, latest_version, locked, lock_message, online, update_status, first_seen_at, last_seen_at, created_at, updated_at) FROM stdin;
8592f686-50f0-49cb-aa5d-617cf156444e	Rig-3	8b29e323-2d6a-4bc4-8f9c-89a76d11e3aa	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	HOME-PC	Rig-3	1.0.24	1.0.24	f	\N	t		2026-06-26 14:42:14.811	2026-07-07 14:15:26.559	2026-07-01 08:12:53.189	2026-07-07 18:30:30.616
2a0131d9-eb14-490f-b47c-75ab537e0e8b	b2game	13f06790-c478-4e8e-8344-c1aa91b3e72f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	B2Game	b2game	1.0.21	1.0.24	f	\N	t		2026-06-26 14:54:23.227	2026-06-26 14:54:23.229	2026-06-26 14:55:32.063	2026-06-26 14:55:32.063
3c3306da-88a3-447e-9b3c-b429bae89b2c	Rig-5	f124efe3-f0cc-4116-8984-b2d1bae6885b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	HOME-PC	Rig-5	1.0.24	1.0.24	f	\N	t		2026-06-26 14:52:48.121	2026-07-07 11:00:39.766	2026-07-01 08:12:53.181	2026-07-07 18:30:31.245
3bed88c3-b2eb-497b-a93e-8a88705b60ef	Rig-4	1b7395de-87f0-46f0-996e-6d62617e0922	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	HOME-PC	Rig-4	1.0.24	1.0.24	f	\N	t		2026-06-26 14:48:04.104	2026-07-07 17:04:55.993	2026-07-01 08:12:53.219	2026-07-07 18:30:31.246
890ba9f0-b3fb-44b2-b932-9b87f3f06239	Vip-3	13f06790-c478-4e8e-8344-c1aa91b3e72f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	B2Game	Vip-3	1.0.24	1.0.24	f	\N	t		2026-06-26 15:01:07.302	2026-07-07 17:25:07.716	2026-07-01 08:12:53.23	2026-07-07 18:30:31.246
2cfe0951-6a96-4ddd-9436-1b8a4128f25f	Rig-6	7b32e26f-38b4-46db-a026-41b7b19ca136	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	DESKTOP-6MMLSRQ	Rig-6	1.0.24	1.0.24	f	\N	t		2026-06-26 15:24:16.139	2026-07-07 17:05:50.973	2026-07-01 08:12:53.245	2026-07-07 18:30:31.545
710bbbb7-9efa-49f8-b360-6d1ad15d6ac2	Vip-1	d38a3dff-9fa5-4738-9dad-d09c49c7db4f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	HOME-PC	Vip-1	1.0.24	1.0.24	f	\N	t		2026-06-26 14:58:32.064	2026-07-07 17:31:45.221	2026-07-01 08:12:53.231	2026-07-07 18:30:31.896
a3c89678-15ea-4d2d-bbeb-16648bbe4b5f	Rig-2	93850eed-1a97-41de-9e9a-2506edd110ac	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	WIN-0KAKFT78ON1	Rig-2	1.0.24	1.0.24	f	\N	t		2026-06-26 14:33:14.919	2026-07-07 11:30:34.197	2026-07-01 08:12:53.188	2026-07-07 18:30:30.93
cab19ea7-c6ac-49db-8bad-ecbbd5b6bf5d	Rig-7	36685d3d-ff4a-4c91-86a3-11962fa0a45d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	HOME-PC	Rig-7	1.0.24	1.0.24	f	\N	t		2026-06-26 14:50:55.071	2026-07-07 17:05:46.375	2026-07-01 08:12:53.238	2026-07-07 18:30:30.933
efc60377-70a8-4e65-ad03-6042e67857dd	Rig-1	2b3ec612-bcaf-462a-9d08-969347cf0151	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	HOME-PC	Rig-1	1.0.24	1.0.24	f	\N	t		2026-06-26 14:36:48.056	2026-07-07 11:30:06.148	2026-07-01 08:12:53.198	2026-07-07 18:30:30.931
7a2c9830-cc04-48d2-8c79-35c3f84a9f93	Vip-4	9eae5376-edb1-4ebd-be59-1940bf83e7b6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	HOME-PC	Vip-4	1.0.24	1.0.24	f	\N	t		2026-06-26 15:04:28.386	2026-07-07 17:25:15.311	2026-07-01 08:12:53.239	2026-07-07 18:30:31.571
0c3141b1-5fff-4257-aef0-7b554ec3bf2d	Vip-2	4fb435c0-0277-404e-be64-adbd714b9f46	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Vip-1	Vip-2	1.0.24	1.0.24	f	\N	t		2026-06-26 14:56:19.255	2026-07-07 11:08:52.284	2026-07-01 08:12:53.227	2026-07-07 18:30:31.903
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.sale_items (id, sale_id, product_id, product_name, barcode, quantity, unit_price, unit_cost, total_price, total_cost, profit) FROM stdin;
ba01c773-df8b-419b-a32e-a209a25e39af	3c127e17-0277-493e-91fd-7ecbbeb32524	9e5cd792-2919-407f-963d-1e088654f9e6	M&M's	4607065000868	2	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000
97259b6d-0777-4b29-86d2-ef352663580b	ed42b073-733a-498d-81d3-667ef66ecf08	7e30b780-f60c-424a-a184-4fef11a44306	Qurt	4780102760304	2	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000
1646d6b8-20b3-4b2a-9c50-0b49df14d06f	42197872-7ca8-4dcb-b443-7fc6d7a70585	5b988a52-4c33-487c-afb5-6cbea9b943e8	Keshu M	47801027603044607065000868622113401271246070650014454780102760113	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000
49f35e9f-487a-4605-bdf4-fe093d7c8b94	42197872-7ca8-4dcb-b443-7fc6d7a70585	a2103180-05cc-42f0-9b18-d4f459709873	Mindal M	4780102760304460706500086862211340127124607065001445478010276011347801478010276012002760199	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000
181f1d6c-2b85-489b-94ea-100585f93d18	21fe43ac-4e28-4ee8-972a-5a260e16ca7e	5b988a52-4c33-487c-afb5-6cbea9b943e8	Keshu M	47801027603044607065000868622113401271246070650014454780102760113	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000
19eecc21-0979-4752-9dc6-62fe20f9da6b	21fe43ac-4e28-4ee8-972a-5a260e16ca7e	a2103180-05cc-42f0-9b18-d4f459709873	Mindal M	4780102760304460706500086862211340127124607065001445478010276011347801478010276012002760199	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000
38da1b57-927b-4cab-b37a-5069aa8f88ff	9e8749f0-8358-4a0d-87f1-8aaceacec184	5b988a52-4c33-487c-afb5-6cbea9b943e8	Keshu M	47801027603044607065000868622113401271246070650014454780102760113	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000
d2c29e8e-e0c0-4273-adc3-c01b894f35ca	0c567b87-b378-4fc7-9660-e9c422a1fad0	0cc1edd1-c65d-4332-9484-9555b5ea4b0e	B fresh	478013764029947801376402134780072660161	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000
23900001-9bb9-4f89-b73f-6823f0c9c335	0c567b87-b378-4fc7-9660-e9c422a1fad0	a438fe77-74a0-4a86-87c5-6de222ea6373	Flash Kichik	4780137640299478013764021347800726601614780068020023	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000
f1f5b611-a425-4b38-9190-0657c8b8c927	50591526-1512-42a8-8f95-f5349e684ea0	a447b302-fcc0-4a85-833f-f86236329fe4	M&Ms	4607065000868	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000
6bc3591a-4efe-48f6-a5ad-71c4640a577d	f0b4c386-cacf-4a14-9969-2db028ca289e	a438fe77-74a0-4a86-87c5-6de222ea6373	Flash Kichik	4780137640299478013764021347800726601614780068020023	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000
611152e2-f9bd-4c5f-874e-10efcd548539	1067e9c0-d8ce-4d5e-95df-bd6a3223bd71	70e7f8e9-aa5e-4611-be5a-0a2d1030e68b	Coca-Cola 0.5	4780069000130	1	10000.000000000000000000000000000000	6000.000000000000000000000000000000	10000.000000000000000000000000000000	6000.000000000000000000000000000000	4000.000000000000000000000000000000
727500e3-695d-4771-b849-59f884fd943e	1067e9c0-d8ce-4d5e-95df-bd6a3223bd71	f540f44e-9244-4f00-8184-afcdd580cc5f	Шурданак M	4780102760144	1	15000.000000000000000000000000000000	0.000000000000000000000000000000	15000.000000000000000000000000000000	0.000000000000000000000000000000	15000.000000000000000000000000000000
ef470f9c-0b4f-454f-8764-f49cd4c2ead6	1067e9c0-d8ce-4d5e-95df-bd6a3223bd71	cc59e684-4a6b-42cf-9a27-2d1f84755135	Snickers	4607065001445	1	10000.000000000000000000000000000000	6500.000000000000000000000000000000	10000.000000000000000000000000000000	6500.000000000000000000000000000000	3500.000000000000000000000000000000
b1cef7d4-6f53-4b37-be87-83fc295f03f3	844fee3c-29d4-4607-84dc-b274bdc610ad	39ba6975-8c2e-46bb-8eab-3d96f7bc1afd	Coca coal 0,5	4780069000130	2	10000.000000000000000000000000000000	0.000000000000000000000000000000	20000.000000000000000000000000000000	0.000000000000000000000000000000	20000.000000000000000000000000000000
a4309b84-5999-4eb6-935a-8c8ae87c3159	8f19acc8-5bd5-4a3d-a926-62d3a0f3b1ac	ba62679b-176a-473c-81b0-1f156361df92	18+	4780101734269	1	15000.000000000000000000000000000000	0.000000000000000000000000000000	15000.000000000000000000000000000000	0.000000000000000000000000000000	15000.000000000000000000000000000000
ca7b5ec3-fba0-43cf-b7c3-26f6243972fd	8f19acc8-5bd5-4a3d-a926-62d3a0f3b1ac	717e503a-2141-4d77-9243-453133378a61	Flash kichik	4780068020023	1	15000.000000000000000000000000000000	0.000000000000000000000000000000	15000.000000000000000000000000000000	0.000000000000000000000000000000	15000.000000000000000000000000000000
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.sales (id, branch_id, session_id, customer_id, sold_by, subtotal, discount, total, total_cost, profit, payment_status, payment_method, created_at, paid_at) FROM stdin;
3c127e17-0277-493e-91fd-7ecbbeb32524	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	paid	card	2026-06-12 07:42:24.143	2026-06-12 07:42:30.439
ed42b073-733a-498d-81d3-667ef66ecf08	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	b172db10-871c-4988-93d1-9c69c2906154	67005460-527d-4723-915f-8ff20067e42d	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	paid	card	2026-06-12 07:55:39.22	2026-06-12 07:55:45.827
42197872-7ca8-4dcb-b443-7fc6d7a70585	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	67005460-527d-4723-915f-8ff20067e42d	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	pending	cash	2026-06-12 15:32:12.384	\N
21fe43ac-4e28-4ee8-972a-5a260e16ca7e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	67005460-527d-4723-915f-8ff20067e42d	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	pending	cash	2026-06-12 15:32:50.69	\N
9e8749f0-8358-4a0d-87f1-8aaceacec184	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	67005460-527d-4723-915f-8ff20067e42d	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	pending	cash	2026-06-12 16:18:09.34	\N
0c567b87-b378-4fc7-9660-e9c422a1fad0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	22778489-a0f5-4640-87c1-b24ff009cb87	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	paid	cash	2026-06-17 17:06:08.67	2026-06-17 17:06:09.839
50591526-1512-42a8-8f95-f5349e684ea0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	58dceacf-f773-4e62-bd9e-7748904919fa	67005460-527d-4723-915f-8ff20067e42d	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	paid	cash	2026-06-17 17:07:27.474	2026-06-17 17:07:28.795
f0b4c386-cacf-4a14-9969-2db028ca289e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	22778489-a0f5-4640-87c1-b24ff009cb87	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	paid	cash	2026-06-17 17:07:45.506	2026-06-17 17:07:46.407
1067e9c0-d8ce-4d5e-95df-bd6a3223bd71	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	67005460-527d-4723-915f-8ff20067e42d	35000.000000000000000000000000000000	0.000000000000000000000000000000	35000.000000000000000000000000000000	12500.000000000000000000000000000000	22500.000000000000000000000000000000	paid	card	2026-07-01 19:00:56.115	2026-07-01 19:00:58.425
844fee3c-29d4-4607-84dc-b274bdc610ad	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	67005460-527d-4723-915f-8ff20067e42d	20000.000000000000000000000000000000	0.000000000000000000000000000000	20000.000000000000000000000000000000	0.000000000000000000000000000000	20000.000000000000000000000000000000	paid	cash	2026-07-05 15:14:29.442	2026-07-05 15:14:31.088
8f19acc8-5bd5-4a3d-a926-62d3a0f3b1ac	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	67005460-527d-4723-915f-8ff20067e42d	30000.000000000000000000000000000000	0.000000000000000000000000000000	30000.000000000000000000000000000000	0.000000000000000000000000000000	30000.000000000000000000000000000000	paid	card	2026-07-05 15:18:07.437	2026-07-05 15:18:09.325
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.sessions (id, branch_id, simulator_id, customer_id, customer_name, phone, tariff_id, status, payment_mode, started_at, ended_at, duration_minutes, added_minutes, remaining_seconds, session_amount, added_time_amount, shop_amount, total_amount, paid_amount, debt_amount, created_by, stopped_by, created_at, updated_at, billing_mode, hourly_rate) FROM stdin;
7b067a26-3b21-40a8-a8b6-b42587785623	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	20222f92-3770-4b88-895a-f0ab6d2a03ed	1234	998098765432	7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-18 07:48:56.031	2026-06-18 07:50:11.977	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	7307199d-28dd-4935-85f9-53b7d7cabd3b	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-18 07:48:56.031	2026-06-18 07:48:56.031	fixed	0.00
7faf187d-c634-4661-834a-fac80405cf0d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	ced4930c-9a08-4434-a233-43d08364a850	Asilbek	998882387992	7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-25 08:33:21.18	2026-06-25 08:41:42.25	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	dac28a45-122f-47f0-85d2-9bd2ae523eff	dac28a45-122f-47f0-85d2-9bd2ae523eff	2026-06-25 08:33:21.18	2026-06-25 08:33:21.18	fixed	0.00
fa334467-2bf7-4dd3-914b-58b2a7b4c7a7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	Mehmon		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-25 14:02:39.971	2026-06-25 14:02:54.72	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	22778489-a0f5-4640-87c1-b24ff009cb87	22778489-a0f5-4640-87c1-b24ff009cb87	2026-06-25 14:02:39.971	2026-06-25 14:02:39.971	fixed	0.00
4c90b3ba-7faf-491c-9049-c807cc2056f1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	Mehmon		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-25 14:07:13.443	2026-06-25 14:28:38.462	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	22778489-a0f5-4640-87c1-b24ff009cb87	22778489-a0f5-4640-87c1-b24ff009cb87	2026-06-25 14:07:13.443	2026-06-25 14:07:13.443	fixed	0.00
a642a180-6aa6-4107-a961-a0d9aa60cd2b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	c2a40555-3e9a-4a41-aa26-858577f1676f	\N	Mehmon		264d20d4-29eb-4f1c-bab9-53244a9e396c	stopped	prepaid	2026-06-25 15:24:32.975	2026-06-25 15:30:11.897	480	0	28800	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 15:24:32.975	2026-06-25 15:24:32.975	fixed	0.00
edc88b19-c3ed-4443-a385-1ea602aadfde	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	c2a40555-3e9a-4a41-aa26-858577f1676f	\N	1234	998098765432	7fafda37-8fc0-4b86-af03-593ea967942c	stopped	postpaid	2026-06-25 15:31:13.575	2026-06-25 15:32:35.553	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 15:31:13.575	2026-06-25 15:31:13.575	fixed	0.00
80523d10-4c79-4ed8-8556-d027343df565	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	c2a40555-3e9a-4a41-aa26-858577f1676f	\N	Mehmon		baaa413d-5fdd-4ef5-a80d-11d08b2bef41	stopped	postpaid	2026-06-25 16:03:10.958	2026-06-25 16:03:29.314	180	0	10800	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 16:03:10.958	2026-06-25 16:03:10.958	fixed	0.00
90c44abb-4814-4a53-8897-83426a50e674	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	81e58e47-d95c-4d3f-a7e9-5ff88e251b65	\N	Mehmon		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-25 16:20:44.709	2026-06-25 16:34:55.898	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 16:20:44.709	2026-06-25 16:20:44.709	fixed	0.00
630576d6-01a3-461a-884e-2a8784e33135	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	39c89b64-f99f-4f87-8961-918d283727aa	\N	Mehmon		142004ec-027d-40ff-8bd5-af1ab93a121e	active	postpaid	2026-06-25 16:43:24.811	\N	0	0	0	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-06-25 16:43:24.811	2026-06-25 16:43:24.811	open	0.00
aeb6a7b3-bbe0-4deb-8e81-a22cbe2ec3e8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	81e58e47-d95c-4d3f-a7e9-5ff88e251b65	\N	Mehmon		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-25 17:22:02.63	2026-06-25 17:22:25.635	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 17:22:02.63	2026-06-25 17:22:02.63	fixed	0.00
fa83530d-b8c9-439b-ba53-821c6078356d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	5a2e84e4-503f-48bf-9491-c6d0c2a8828b	\N	Mehmon		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-25 17:27:57.994	2026-06-25 17:39:09.156	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 17:27:57.994	2026-06-25 17:27:57.994	fixed	0.00
d38f8548-df32-463c-852c-bc3a859db2e8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	5a2e84e4-503f-48bf-9491-c6d0c2a8828b	\N	Mehmon		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-25 17:39:45.905	2026-06-25 17:41:40.536	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 17:39:45.905	2026-06-25 17:39:45.905	fixed	0.00
6a41dc37-6efc-414a-94b9-7cbf6021e916	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	c2a40555-3e9a-4a41-aa26-858577f1676f	\N	Mehmon		569a7198-4acc-418f-9e39-8e07151958a0	active	postpaid	2026-06-26 09:52:53.311	\N	0	0	0	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-06-26 09:52:53.311	2026-06-26 09:52:53.311	open	0.00
d5bd811f-a445-4d11-a7db-54b653efe0a3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	fb8d5238-49fe-4345-99d2-81dfb2f2fd41	20222f92-3770-4b88-895a-f0ab6d2a03ed	1234	998098765432	7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-18 08:11:08.185	2026-06-18 08:21:04.738	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	7307199d-28dd-4935-85f9-53b7d7cabd3b	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-18 08:11:08.185	2026-06-18 08:11:08.185	fixed	0.00
0ccec717-5e34-4a37-b9ee-bc8c156e2260	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	Mehmon		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-25 08:49:28.605	2026-06-25 09:49:34.446	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	dac28a45-122f-47f0-85d2-9bd2ae523eff	22778489-a0f5-4640-87c1-b24ff009cb87	2026-06-25 08:49:28.605	2026-06-25 08:49:28.605	fixed	0.00
966ef5a2-ac1b-4197-ba91-76a4d00b4d9a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	Mehmon		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-25 14:03:02.842	2026-06-25 14:06:05.119	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	22778489-a0f5-4640-87c1-b24ff009cb87	22778489-a0f5-4640-87c1-b24ff009cb87	2026-06-25 14:03:02.842	2026-06-25 14:03:02.842	fixed	0.00
0ad39109-12db-422a-b7fd-b232f8ce8645	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	c2a40555-3e9a-4a41-aa26-858577f1676f	\N	Mehmon		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-25 15:13:36.917	2026-06-25 15:13:46.386	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 15:13:36.917	2026-06-25 15:13:36.917	fixed	0.00
17a9ea03-8a9f-4f3f-be42-923625bd5bda	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	Mehmon		264d20d4-29eb-4f1c-bab9-53244a9e396c	stopped	prepaid	2026-06-25 15:24:57.72	2026-06-25 15:27:13.436	480	10	29365	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 15:24:57.72	2026-06-25 15:25:32.642	fixed	0.00
8a4de02e-ed8b-436f-a29b-1486396453aa	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	Guest		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-15 12:19:52.679	2026-06-15 12:22:26.294	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-15 12:19:52.679	2026-06-15 12:19:52.679	fixed	0.00
0a9e69ed-410f-4880-af17-e22c8262dc2d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	b172db10-871c-4988-93d1-9c69c2906154	Aziz	998901112233	7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-15 12:23:10.768	2026-06-15 13:23:10.717	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-06-15 12:23:10.768	2026-06-15 12:23:10.768	fixed	0.00
8bd255d0-1d69-4684-b1f8-328dd0167dfc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	Guest		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-17 17:28:13.643	2026-06-17 17:29:45.98	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	22778489-a0f5-4640-87c1-b24ff009cb87	2026-06-17 17:28:13.643	2026-06-17 17:28:13.643	fixed	0.00
7a22c4d5-83c0-4b0f-a8c8-8c07252340a4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	c2a40555-3e9a-4a41-aa26-858577f1676f	\N	Guest		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-17 19:10:11.806	2026-06-17 19:11:54.414	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	7307199d-28dd-4935-85f9-53b7d7cabd3b	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-17 19:10:11.806	2026-06-17 19:10:11.806	fixed	0.00
b33ebbbb-d1bf-4263-8ca7-64c04bf252af	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	d689a237-dec7-4e5c-8b23-8b9257c805b5	\N	Mehmon		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-25 16:04:42.65	2026-06-25 16:15:33.621	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 16:04:42.65	2026-06-25 16:04:42.65	fixed	0.00
8abd94ff-d60c-435d-a9cc-b66c8d18c06a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	0f9ded33-8c57-4249-a1a6-54852a53ccfe	\N	Mehmon		69c843d4-8ba0-42cc-b8e4-8061d1df0d20	stopped	prepaid	2026-06-25 16:02:07.178	2026-06-25 16:15:47.697	120	0	7200	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 16:02:07.178	2026-06-25 16:02:07.178	fixed	0.00
e711ac42-0638-44ce-b59f-85ccdd810b14	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	81e58e47-d95c-4d3f-a7e9-5ff88e251b65	\N	Mehmon		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	postpaid	2026-06-25 16:00:05.535	2026-06-25 16:16:44.788	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 16:00:05.535	2026-06-25 16:00:05.535	fixed	0.00
3fe25825-9619-459c-a254-996e547f7fb1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	07e923a0-e9bd-4683-8ef4-275ba3373d55	\N	Mehmon		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-25 16:38:15.613	2026-06-25 16:43:33.047	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 16:38:15.613	2026-06-25 16:38:15.613	fixed	0.00
cd58bea7-c246-40bc-a3ad-66fcdf9739bd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	07e923a0-e9bd-4683-8ef4-275ba3373d55	\N	Mehmon		142004ec-027d-40ff-8bd5-af1ab93a121e	active	postpaid	2026-06-25 16:44:33.478	\N	0	0	0	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-06-25 16:44:33.478	2026-06-25 16:44:33.478	open	0.00
f9454b78-d27a-433c-84f2-454769698f50	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	3387c3f8-0bdc-4392-9a99-21f01f32793e	\N	Mehmon		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-26 08:10:41.615	2026-06-26 08:55:03.618	60	0	1199	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	dac28a45-122f-47f0-85d2-9bd2ae523eff	dac28a45-122f-47f0-85d2-9bd2ae523eff	2026-06-26 08:09:46.127	2026-06-26 08:50:42.615	fixed	0.00
24e91c72-ffe8-4035-97cb-113a625e23b3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	2c472262-7d5b-4af2-ae14-e7bb42b62974	\N	Mehmon		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-25 17:27:46.78	2026-06-25 18:28:10.892	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 17:27:46.78	2026-06-25 17:27:46.78	fixed	0.00
4bea8dbc-aacd-40fd-8dd1-4e20e859629d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	a5469dcd-c373-44ab-9acc-c90fc0748b5e	\N	Mehmon		7fafda37-8fc0-4b86-af03-593ea967942c	stopped	prepaid	2026-06-25 17:37:46.666	2026-06-25 18:37:46.687	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-06-25 17:37:46.666	2026-06-25 17:37:46.666	fixed	0.00
8f42a4ac-21ba-45f8-83a4-8c1497bf9e39	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	13f06790-c478-4e8e-8344-c1aa91b3e72f	\N	Mehmon		d7e6ce6b-97f2-40a0-8d54-99af10004d9e	stopped	postpaid	2026-07-01 18:21:29.908	2026-07-01 18:22:56.311	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 18:21:29.908	2026-07-01 18:21:29.908	fixed	0.00
795d7232-3141-482f-94bf-03668fa7835a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	9eae5376-edb1-4ebd-be59-1940bf83e7b6	\N	Mehmon		d7e6ce6b-97f2-40a0-8d54-99af10004d9e	stopped	prepaid	2026-07-01 18:26:52.019	2026-07-01 19:26:52.936	60	0	3600	80000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	80000.000000000000000000000000000000	80000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-07-01 18:26:52.019	2026-07-01 18:26:52.019	fixed	0.00
50c4f384-ddd8-4514-b73c-1aa531df554c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	1b7395de-87f0-46f0-996e-6d62617e0922	\N	Mehmon		0f3816fe-40fb-4395-b239-47074858a097	stopped	prepaid	2026-07-01 18:34:14.957	2026-07-01 19:41:07.224	60	90	5088	40000.000000000000000000000000000000	60000.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 18:34:14.957	2026-07-01 19:39:26.474	fixed	0.00
b692f45d-1902-4172-9a73-6ca58f9a5a39	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	2b3ec612-bcaf-462a-9d08-969347cf0151	\N	Mehmon	998990324234	38401fb5-44df-4594-b645-6e94b746274f	stopped	prepaid	2026-07-02 08:41:34.948	2026-07-02 08:41:54.772	300	0	18000	200000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	200000.000000000000000000000000000000	200000.000000000000000000000000000000	0.000000000000000000000000000000	22778489-a0f5-4640-87c1-b24ff009cb87	22778489-a0f5-4640-87c1-b24ff009cb87	2026-07-02 08:41:34.948	2026-07-02 08:41:34.948	fixed	0.00
43832062-345c-40b1-bcb3-4d64d5b5f4ea	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	9eae5376-edb1-4ebd-be59-1940bf83e7b6	\N	Mehmon		d7e6ce6b-97f2-40a0-8d54-99af10004d9e	stopped	postpaid	2026-07-01 19:43:29.269	2026-07-01 19:45:22.824	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	80000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 19:43:29.269	2026-07-01 19:43:29.269	fixed	0.00
f52f4c07-8727-43de-8f73-531ce7248dc2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	9eae5376-edb1-4ebd-be59-1940bf83e7b6	\N	Mehmon		d7e6ce6b-97f2-40a0-8d54-99af10004d9e	stopped	postpaid	2026-07-01 19:46:47.044	2026-07-01 19:47:40.479	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 19:46:47.044	2026-07-01 19:46:47.044	fixed	0.00
4ff9acc4-5f51-4e9f-9b3b-818041f37c7d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	1b7395de-87f0-46f0-996e-6d62617e0922	\N	Mehmon		0f3816fe-40fb-4395-b239-47074858a097	stopped	prepaid	2026-07-01 19:52:02.238	2026-07-01 19:57:00.409	60	0	3600	40000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	40000.000000000000000000000000000000	40000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-07-01 19:52:02.238	2026-07-01 19:52:02.238	fixed	0.00
3779e8f6-05ae-4efa-a13d-09f4bfbf2e26	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	1b7395de-87f0-46f0-996e-6d62617e0922	\N	Mehmon		0f3816fe-40fb-4395-b239-47074858a097	stopped	prepaid	2026-07-01 20:56:02.162	2026-07-01 22:17:28.614	60	0	3600	40000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	40000.000000000000000000000000000000	40000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-07-01 20:56:02.162	2026-07-01 20:56:02.162	fixed	0.00
2236605a-1f99-48c5-b5f0-e6c17db02d4b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f124efe3-f0cc-4116-8984-b2d1bae6885b	\N	Mehmon		0f3816fe-40fb-4395-b239-47074858a097	stopped	prepaid	2026-07-01 20:56:14.634	2026-07-02 06:14:16.779	60	0	3600	40000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	40000.000000000000000000000000000000	40000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-07-01 20:56:14.634	2026-07-01 20:56:14.634	fixed	0.00
f9349071-83ca-4400-bd6e-bad12c611cd0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	2b3ec612-bcaf-462a-9d08-969347cf0151	\N	Mehmon	998990324234	38401fb5-44df-4594-b645-6e94b746274f	stopped	prepaid	2026-07-02 08:42:31.207	2026-07-02 08:42:45.954	300	0	18000	200000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	200000.000000000000000000000000000000	200000.000000000000000000000000000000	0.000000000000000000000000000000	22778489-a0f5-4640-87c1-b24ff009cb87	22778489-a0f5-4640-87c1-b24ff009cb87	2026-07-02 08:42:31.207	2026-07-02 08:42:31.207	fixed	0.00
c812bae3-196e-4130-a847-8284d058f11a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	4fb435c0-0277-404e-be64-adbd714b9f46	\N	Mehmon		4d2c7d39-7d51-46ed-a226-1e0675dcc304	stopped	prepaid	2026-07-05 16:02:39.481	2026-07-05 19:37:05.959	60	120	3662	100000.000000000000000000000000000000	200000.000000000000000000000000000000	0.000000000000000000000000000000	300000.000000000000000000000000000000	300000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-07-05 16:02:39.481	2026-07-05 18:01:37.742	fixed	0.00
d7c24a68-c2d4-4fa4-96ca-bcb48930cc7c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7b32e26f-38b4-46db-a026-41b7b19ca136	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	stopped	prepaid	2026-07-05 15:19:05.335	2026-07-05 16:19:05.672	60	0	3600	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:19:05.335	2026-07-05 15:19:05.335	fixed	0.00
c1becbf1-7f0a-4be9-8063-8f91857b1057	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f124efe3-f0cc-4116-8984-b2d1bae6885b	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	stopped	prepaid	2026-07-05 15:18:46.568	2026-07-05 16:18:47.555	60	0	3600	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:18:46.568	2026-07-05 15:18:46.568	fixed	0.00
e7cca17f-9833-4f59-ac2e-e936bfc14119	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	36685d3d-ff4a-4c91-86a3-11962fa0a45d	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	stopped	prepaid	2026-07-05 15:19:13.91	2026-07-05 16:19:14.463	60	0	3600	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:19:13.91	2026-07-05 15:19:13.91	fixed	0.00
8fb0363b-1732-4709-9d78-833e5a634d70	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	13f06790-c478-4e8e-8344-c1aa91b3e72f	\N	Mehmon		4d2c7d39-7d51-46ed-a226-1e0675dcc304	stopped	prepaid	2026-07-05 15:56:25.263	2026-07-05 16:56:25.464	60	0	3600	100000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-07-05 15:56:25.263	2026-07-05 15:56:25.263	fixed	0.00
d014d98c-c1f0-4ddf-a1dc-c07d26a1548d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	93850eed-1a97-41de-9e9a-2506edd110ac	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	stopped	prepaid	2026-07-05 16:11:46.515	2026-07-05 17:17:47.616	60	0	3600	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-07-05 16:11:46.515	2026-07-05 16:11:46.515	fixed	0.00
2a86cce4-e6d1-4cf1-adb9-b746eb0495ed	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	1b7395de-87f0-46f0-996e-6d62617e0922	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	stopped	prepaid	2026-07-05 15:18:35.704	2026-07-05 16:18:35.923	60	0	3600	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 15:18:35.704	2026-07-05 15:18:35.704	fixed	0.00
63c908d4-c831-4252-bc67-f5701de7c381	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	8b29e323-2d6a-4bc4-8f9c-89a76d11e3aa	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	stopped	prepaid	2026-07-05 16:12:13.056	2026-07-05 17:18:21.191	60	0	3600	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 16:12:13.056	2026-07-05 16:12:13.056	fixed	0.00
5f6b8747-0684-4d2f-b5ac-a508e75c477d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	36685d3d-ff4a-4c91-86a3-11962fa0a45d	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	paused	prepaid	2026-07-05 17:27:41.059	\N	60	0	3590	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-07-05 17:27:41.059	2026-07-05 17:27:51.137	fixed	0.00
a7464126-f401-41c1-ac87-9b1645395653	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	36685d3d-ff4a-4c91-86a3-11962fa0a45d	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	paused	prepaid	2026-07-05 17:29:47.702	\N	60	0	3587	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-07-05 17:29:47.702	2026-07-05 17:30:00.479	fixed	0.00
3fc61fd1-7cce-4505-b766-9d2ca3996e4f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	36685d3d-ff4a-4c91-86a3-11962fa0a45d	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	paused	prepaid	2026-07-05 17:31:08.456	\N	60	0	3576	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-07-05 17:31:08.456	2026-07-05 17:31:32.496	fixed	0.00
347e6566-f9e8-43b6-8ff3-88957687aede	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	36685d3d-ff4a-4c91-86a3-11962fa0a45d	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	paused	prepaid	2026-07-05 17:31:41.568	\N	60	0	3540	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-07-05 17:31:41.568	2026-07-05 17:32:41.902	fixed	0.00
af2d8df2-f42d-4f37-b43c-9e8a5ab99d9f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7b32e26f-38b4-46db-a026-41b7b19ca136	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	stopped	postpaid	2026-07-05 16:42:22.862	2026-07-05 17:42:24.267	60	0	3600	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 16:42:22.862	2026-07-05 16:42:22.862	fixed	0.00
e05add79-61ec-44cf-b53a-d0e40cc2e70e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	36685d3d-ff4a-4c91-86a3-11962fa0a45d	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	stopped	prepaid	2026-07-05 17:34:22.789	2026-07-05 17:50:55.652	60	0	3600	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 17:34:22.789	2026-07-05 17:34:22.789	fixed	0.00
541f408d-e9b0-43eb-ae9c-22c0d0351143	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	9eae5376-edb1-4ebd-be59-1940bf83e7b6	\N	Mehmon		4d2c7d39-7d51-46ed-a226-1e0675dcc304	stopped	prepaid	2026-07-05 15:56:05.543	2026-07-05 19:37:07.285	60	130	3880	100000.000000000000000000000000000000	216667.000000000000000000000000000000	0.000000000000000000000000000000	316667.000000000000000000000000000000	316667.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-07-05 15:56:05.543	2026-07-05 18:01:25.212	fixed	0.00
88317b37-2700-4234-9a86-81af041b63bf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	36685d3d-ff4a-4c91-86a3-11962fa0a45d	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	stopped	prepaid	2026-07-05 18:01:50.658	2026-07-05 19:37:07.824	60	0	3600	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-07-05 18:01:50.658	2026-07-05 18:01:50.658	fixed	0.00
b9f9dd7b-e7ef-4e8a-bc86-b4d098dfb6ad	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7b32e26f-38b4-46db-a026-41b7b19ca136	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	stopped	prepaid	2026-07-05 18:02:02.665	2026-07-05 19:37:08.328	60	0	3600	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-07-05 18:02:02.665	2026-07-05 18:02:02.665	fixed	0.00
23a26ba2-ffa9-4f5b-8d77-4b6f8531b1fb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f124efe3-f0cc-4116-8984-b2d1bae6885b	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	stopped	prepaid	2026-07-05 18:02:12.386	2026-07-05 19:37:08.835	60	0	3600	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-07-05 18:02:12.386	2026-07-05 18:02:12.386	fixed	0.00
7de98944-8531-4695-a872-8b7f5e480d88	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	1b7395de-87f0-46f0-996e-6d62617e0922	\N	Mehmon		f5b08c3b-acad-4752-8110-f8082afc314c	stopped	prepaid	2026-07-05 18:02:33.812	2026-07-05 19:37:09.402	60	0	3600	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	\N	2026-07-05 18:02:33.812	2026-07-05 18:02:33.812	fixed	0.00
6267a112-d5c1-4e3c-97df-42bc1da8d3e3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	13f06790-c478-4e8e-8344-c1aa91b3e72f	\N	Mehmon		4d2c7d39-7d51-46ed-a226-1e0675dcc304	stopped	prepaid	2026-07-05 18:01:08.943	2026-07-05 21:59:34.311	60	0	3600	100000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	2026-07-05 18:01:08.943	2026-07-05 18:01:08.943	fixed	0.00
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.settings (id, branch_id, key, value, created_at, updated_at) FROM stdin;
89b9bfca-2ef1-4c45-bf9d-9b23784ad8e1	\N	games	[]	2026-07-01 17:45:58.756	2026-07-01 17:46:08.557
9b2edb88-c496-4983-8f44-712834a80654	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	simulator_map_layout	{"facilities": {"wc": {"col": 6, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 6, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 6, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}	2026-06-10 09:41:16.294	2026-07-01 18:28:32.861
\.


--
-- Data for Name: shift_withdrawals; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.shift_withdrawals (id, shift_id, branch_id, source, amount, recipient, note, withdrawn_by, created_at) FROM stdin;
ccb6c70c-d480-4f47-8103-9ddfb8a3cbc5	fa1772cc-fde3-4d4e-a506-674fd018a35a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	card	0.000000000000000000000000000000	Owner	bugun	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-12 07:44:57.234
aa1be92a-d2cc-4406-9733-9b070afd2482	816f18dc-3598-41e4-ac94-c0da90ecff6e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	card	0.000000000000000000000000000000	Owner		67005460-527d-4723-915f-8ff20067e42d	2026-06-12 07:56:33.814
d09670eb-e942-43f9-9c14-66cd1c4073cf	6826f136-3104-45ff-af2b-fe1485091dcd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	card	0.000000000000000000000000000000	Owner		dac28a45-122f-47f0-85d2-9bd2ae523eff	2026-06-26 07:29:55.877
3a94f2a4-9db6-4f84-a793-cd32cde56a47	cb40ae37-235a-4bca-9510-027675548a1e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	card	75000.000000000000000000000000000000	Owner		67005460-527d-4723-915f-8ff20067e42d	2026-07-02 06:26:39.186
01c78b18-3535-4f9d-97df-e6a8b85ea465	17d4da99-d22d-4f8c-bd87-88841a733ede	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	cash	5000.000000000000000000000000000000	Admin qarzi	taxi	22778489-a0f5-4640-87c1-b24ff009cb87	2026-07-07 15:42:22.931
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.shifts (id, branch_id, opened_by, closed_by, status, starting_cash, expected_cash, actual_cash, card_total, qr_total, product_sales, session_sales, refunds, difference, notes, opened_at, closed_at, created_at, updated_at, shift_type, cash_sales, balance_sales, total_revenue, cash_withdrawn, card_withdrawn, bank_withdrawn, remaining_cash, withdraw_recipient) FROM stdin;
239e7868-75b9-494e-bf14-1530a34cd348	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	22778489-a0f5-4640-87c1-b24ff009cb87	closed	0.000000000000000000000000000000	846000.000000000000000000000000000000	846000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000		2026-06-30 14:02:25.01	2026-07-01 17:56:15.86	2026-06-30 14:02:25.01	2026-07-01 18:12:47.893	Tungi (19:00 - 03:00)	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	846000.000000000000000000000000000000	Owner
cb40ae37-235a-4bca-9510-027675548a1e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	closed	846000.000000000000000000000000000000	1126000.000000000000000000000000000000	1126000.000000000000000000000000000000	75000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000		2026-07-01 18:14:24.257	2026-07-02 06:26:39.078	2026-07-01 18:14:24.257	2026-07-02 06:26:39.078	Tungi (19:00 - 03:00)	280000.000000000000000000000000000000	0.000000000000000000000000000000	355000.000000000000000000000000000000	0.000000000000000000000000000000	75000.000000000000000000000000000000	0.000000000000000000000000000000	1126000.000000000000000000000000000000	Owner
1d0dea0e-a911-49de-a5bb-d67707597bf1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	dac28a45-122f-47f0-85d2-9bd2ae523eff	closed	0.000000000000000000000000000000	400000.000000000000000000000000000000	400000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000		2026-07-02 07:09:21.762	2026-07-04 08:05:49.109	2026-07-02 07:09:21.762	2026-07-04 08:05:49.109	Kunduzgi (10:00 - 19:00)	400000.000000000000000000000000000000	0.000000000000000000000000000000	400000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	400000.000000000000000000000000000000	Owner
17d4da99-d22d-4f8c-bd87-88841a733ede	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	\N	open	130000.000000000000000000000000000000	130000.000000000000000000000000000000	\N	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	2026-07-05 15:01:27.966	\N	2026-07-05 15:01:27.966	2026-07-05 15:01:27.966	Tungi (19:00 - 03:00)	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N
ccb60595-93ce-4678-8ce5-a60a7eb458bf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	dac28a45-122f-47f0-85d2-9bd2ae523eff	closed	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000		2026-06-26 08:09:34.339	2026-06-30 12:45:27.282	2026-06-26 08:09:34.339	2026-06-30 13:43:49.682	Tungi (19:00 - 03:00)	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	Owner
2d73dce6-93d1-4255-9db5-578889ef9a70	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	7307199d-28dd-4935-85f9-53b7d7cabd3b	closed	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000		2026-06-12 07:09:43.414	2026-06-12 07:34:39.232	2026-06-12 07:09:43.414	2026-06-12 07:34:39.232	Kunduzgi (09:00 - 18:00)	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	Owner
fa1772cc-fde3-4d4e-a506-674fd018a35a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	7307199d-28dd-4935-85f9-53b7d7cabd3b	closed	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	bugun	2026-06-12 07:35:39.519	2026-06-12 07:44:56.71	2026-06-12 07:35:39.519	2026-06-12 07:44:56.71	Kunduzgi (09:00 - 18:00)	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	Owner
816f18dc-3598-41e4-ac94-c0da90ecff6e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	closed	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000		2026-06-12 07:55:00.225	2026-06-12 07:56:33.264	2026-06-12 07:55:00.225	2026-06-12 07:56:33.264	Kunduzgi (09:00 - 18:00)	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	Owner
0291fff4-2edb-4f1b-acd7-b1144ebeb11e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	67005460-527d-4723-915f-8ff20067e42d	closed	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000		2026-06-12 08:48:00.029	2026-06-12 08:48:07.518	2026-06-12 08:48:00.029	2026-06-12 08:48:07.518	Kunduzgi (09:00 - 18:00)	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	Owner
6c475e03-e99b-4279-b329-6e2f9e069357	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	67005460-527d-4723-915f-8ff20067e42d	22778489-a0f5-4640-87c1-b24ff009cb87	closed	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000		2026-06-12 17:01:14.759	2026-06-17 11:03:18.6	2026-06-12 17:01:14.759	2026-06-17 11:03:18.6	Kunduzgi (09:00 - 18:00)	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	Owner
09d7b689-5ba5-47c4-84e2-1ec1787f38cb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	22778489-a0f5-4640-87c1-b24ff009cb87	06ad4ebc-1250-4a6d-94ca-605bd0871581	closed	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000		2026-06-17 11:03:41.977	2026-06-17 11:06:24.01	2026-06-17 11:03:41.977	2026-06-17 11:06:24.01	Kunduzgi (09:00 - 18:00)	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	Owner
99c1f6bf-889f-4188-bc53-d17d3a4c7a60	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	06ad4ebc-1250-4a6d-94ca-605bd0871581	closed	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000		2026-06-17 11:06:56.811	2026-06-17 11:07:15.053	2026-06-17 11:06:56.811	2026-06-17 11:07:15.053	Kunduzgi (09:00 - 18:00)	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	Owner
034a8729-759f-4de4-b3ee-4184463bc4d3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	06ad4ebc-1250-4a6d-94ca-605bd0871581	closed	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000		2026-06-17 11:12:47.106	2026-06-17 11:13:04.089	2026-06-17 11:12:47.106	2026-06-17 11:13:04.089	Kunduzgi (09:00 - 18:00)	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	Owner
6826f136-3104-45ff-af2b-fe1485091dcd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	dac28a45-122f-47f0-85d2-9bd2ae523eff	dac28a45-122f-47f0-85d2-9bd2ae523eff	closed	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000		2026-06-17 12:03:50.62	2026-06-26 07:29:55.36	2026-06-17 12:03:50.62	2026-06-26 07:29:55.36	Kunduzgi (10:00 - 19:00)	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	Owner
\.


--
-- Data for Name: simulator_admins; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.simulator_admins (simulator_id, admin_id, created_at) FROM stdin;
fb8d5238-49fe-4345-99d2-81dfb2f2fd41	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 12:40:32.755
7560ac62-9494-4ba7-95c8-23d3e3313943	67005460-527d-4723-915f-8ff20067e42d	2026-06-12 12:40:32.755
\.


--
-- Data for Name: simulators; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.simulators (id, branch_id, name, code, zone, simulator_type, status, device_id, ip_address, ws_rig_id, is_online, current_session_id, last_seen_at, created_at, updated_at, map_position) FROM stdin;
2b3ec612-bcaf-462a-9d08-969347cf0151	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Rig-1	Rig-1	main	main	ready_to_play	Rig-1	HOME-PC	Rig-1	t	\N	2026-07-07 11:30:06.148	2026-07-01 08:12:53.087	2026-07-07 18:30:29.451	{"col": 7, "row": 1, "floor": "1", "colSpan": 2, "rowSpan": 1}
f124efe3-f0cc-4116-8984-b2d1bae6885b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Rig-5	Rig-5	main	main	ready_to_play	Rig-5	HOME-PC	Rig-5	t	\N	2026-07-07 11:00:39.766	2026-07-01 08:12:53.043	2026-07-07 18:30:29.733	{"col": 15, "row": 1, "floor": "1", "colSpan": 2, "rowSpan": 1}
4fb435c0-0277-404e-be64-adbd714b9f46	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Vip-2	Vip-2	vip	vip	ready_to_play	Vip-2	Vip-1	Vip-2	t	\N	2026-07-07 11:08:52.284	2026-07-01 08:12:53.095	2026-07-07 18:30:30.052	{"col": 1, "row": 1, "floor": "2", "colSpan": 2, "rowSpan": 1}
d38a3dff-9fa5-4738-9dad-d09c49c7db4f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Vip-1	Vip-1	vip	vip	ready_to_play	Vip-1	HOME-PC	Vip-1	t	\N	2026-07-07 17:31:45.221	2026-07-01 08:12:53.136	2026-07-07 18:30:30.335	{"col": 4, "row": 1, "floor": "2", "colSpan": 2, "rowSpan": 1}
8b29e323-2d6a-4bc4-8f9c-89a76d11e3aa	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Rig-3	Rig-3	main	main	ready_to_play	Rig-3	HOME-PC	Rig-3	t	\N	2026-07-07 14:15:26.559	2026-07-01 08:12:53.081	2026-07-07 18:30:29.174	{"col": 11, "row": 1, "floor": "1", "colSpan": 2, "rowSpan": 1}
1b7395de-87f0-46f0-996e-6d62617e0922	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Rig-4	Rig-4	main	main	ready_to_play	Rig-4	HOME-PC	Rig-4	t	\N	2026-07-07 17:04:55.993	2026-07-01 08:12:53.088	2026-07-07 18:30:29.73	{"col": 13, "row": 1, "floor": "1", "colSpan": 2, "rowSpan": 1}
7b32e26f-38b4-46db-a026-41b7b19ca136	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Rig-6	Rig-6	main	main	ready_to_play	Rig-6	DESKTOP-6MMLSRQ	Rig-6	t	\N	2026-07-07 17:05:50.973	2026-07-01 08:12:53.132	2026-07-07 18:30:30.042	{"col": 17, "row": 1, "floor": "1", "colSpan": 2, "rowSpan": 1}
13f06790-c478-4e8e-8344-c1aa91b3e72f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Vip-3	b2game	vip	vip	ready_to_play	Vip-3	B2Game	Vip-3	t	\N	2026-07-07 17:25:07.716	2026-06-26 14:55:31.546	2026-07-07 18:30:30.046	{"col": 4, "row": 3, "floor": "2", "colSpan": 2, "rowSpan": 1}
9eae5376-edb1-4ebd-be59-1940bf83e7b6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Vip-4	Vip-4	vip	vip	ready_to_play	Vip-4	HOME-PC	Vip-4	t	\N	2026-07-07 17:25:15.311	2026-07-01 08:12:53.143	2026-07-07 18:30:30.332	{"col": 1, "row": 3, "floor": "2", "colSpan": 2, "rowSpan": 1}
93850eed-1a97-41de-9e9a-2506edd110ac	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Rig-2	Rig-2	main	main	ready_to_play	Rig-2	WIN-0KAKFT78ON1	Rig-2	t	\N	2026-07-07 11:30:34.197	2026-07-01 08:12:53.081	2026-07-07 18:30:29.452	{"col": 9, "row": 1, "floor": "1", "colSpan": 2, "rowSpan": 1}
36685d3d-ff4a-4c91-86a3-11962fa0a45d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Rig-7	Rig-7	main	main	ready_to_play	Rig-7	HOME-PC	Rig-7	t	\N	2026-07-07 17:05:46.375	2026-07-01 08:12:53.127	2026-07-07 18:30:29.735	{"col": 19, "row": 1, "floor": "1", "colSpan": 2, "rowSpan": 1}
\.


--
-- Data for Name: tariffs; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.tariffs (id, branch_id, name, simulator_zone, duration_minutes, price, weekday_price, weekend_price, weekday_bonus, weekend_bonus, type, is_active, created_at, updated_at, available_days, available_from, available_until, availability_label) FROM stdin;
7fafda37-8fc0-4b86-af03-593ea967942c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 1 soat	main	60	40000.000000000000000000000000000000	40000.00	50000.00	\N	\N	time	f	2026-06-11 13:51:01.357	2026-06-11 13:51:01.357	{}	\N	\N	\N
495afbd8-177b-42c5-bf8e-0f876335cf83	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 8 soat tungi zaezd	main	480	250000.000000000000000000000000000000	250000.00	350000.00	\N	energetik	night	f	2026-06-11 13:51:02.904	2026-06-18 12:33:09.864	{}	\N	\N	\N
264d20d4-29eb-4f1c-bab9-53244a9e396c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza 8 soat tungi zaezd	vip	480	500000.000000000000000000000000000000	500000.00	500000.00	energetik	energetik	night	f	2026-06-11 13:51:04.785	2026-06-18 12:33:30.044	{}	\N	\N	\N
9091f73f-004a-46bb-98e4-e8aef22c44b5	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 2 soat	main	120	80000.000000000000000000000000000000	80000.00	100000.00	\N	\N	package	f	2026-06-11 13:51:01.665	2026-06-11 13:51:01.665	{}	\N	\N	\N
baaa413d-5fdd-4ef5-a80d-11d08b2bef41	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 3 soat	main	180	100000.000000000000000000000000000000	100000.00	130000.00	\N	\N	package	f	2026-06-11 13:51:01.911	2026-06-11 13:51:01.911	{}	\N	\N	\N
85966f19-b405-41cf-a48b-8a81a23953a2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 5 soat	main	300	150000.000000000000000000000000000000	150000.00	200000.00	\N	energetik	package	f	2026-06-11 13:51:02.614	2026-06-11 13:51:02.614	{}	\N	\N	\N
569a7198-4acc-418f-9e39-8e07151958a0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech VIP	main	60	50000.000000000000000000000000000000	50000.00	60000.00	\N	\N	vip	f	2026-06-11 13:51:03.205	2026-06-11 13:51:03.205	{}	\N	\N	\N
a291c4f0-ca4b-40af-bd60-aaae57418206	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza 1 soat	vip	60	80000.000000000000000000000000000000	80000.00	100000.00	\N	\N	time	f	2026-06-11 13:51:03.462	2026-06-11 13:51:03.462	{}	\N	\N	\N
69c843d4-8ba0-42cc-b8e4-8061d1df0d20	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza 2 soat	vip	120	160000.000000000000000000000000000000	160000.00	200000.00	\N	\N	package	f	2026-06-11 13:51:03.72	2026-06-11 13:51:03.72	{}	\N	\N	\N
b2d09395-a342-4067-be1a-fc8ec2f5b739	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza 3 soat	vip	180	200000.000000000000000000000000000000	200000.00	250000.00	\N	energetik	package	f	2026-06-11 13:51:03.969	2026-06-11 13:51:03.969	{}	\N	\N	\N
d59bee3e-dd06-4ee1-89f3-8bd2c89419d8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza 5 soat	vip	300	300000.000000000000000000000000000000	300000.00	300000.00	\N	energetik + chips	package	f	2026-06-11 13:51:04.24	2026-06-11 13:51:04.24	{}	\N	\N	\N
142004ec-027d-40ff-8bd5-af1ab93a121e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza VIP	vip	60	100000.000000000000000000000000000000	100000.00	120000.00	\N	\N	vip	f	2026-06-11 13:51:05.042	2026-06-11 13:51:05.042	{}	\N	\N	\N
b7a5afbc-9399-4d29-af79-d0e3f873a30d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 1 soat	main	60	25000.000000000000000000000000000000	25000.00	25000.00	\N	\N	time	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{1,2,3,4}	10:00:00	17:00:00	Dushanba-Payshanba 10:00-17:00
0f3816fe-40fb-4395-b239-47074858a097	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 1 soat	main	60	40000.000000000000000000000000000000	40000.00	40000.00	\N	\N	time	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{1,2,3,4}	17:00:00	03:00:00	Dushanba-Payshanba 17:00-03:00
f5b08c3b-acad-4752-8110-f8082afc314c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 1 soat	main	60	50000.000000000000000000000000000000	50000.00	50000.00	\N	\N	time	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{5,6,7}	10:00:00	03:00:00	Juma-Yakshanba
a50839af-cfe4-49d7-802d-89b081f52399	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 3 soat paket	main	180	100000.000000000000000000000000000000	100000.00	100000.00	\N	\N	package	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{1,2,3,4}	17:00:00	03:00:00	Dushanba-Payshanba 17:00-03:00
494e7690-f233-4938-874f-bcf91660d88a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 5 soat paket	main	300	150000.000000000000000000000000000000	150000.00	150000.00	\N	\N	package	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{1,2,3,4}	17:00:00	03:00:00	Dushanba-Payshanba 17:00-03:00
6a095a7d-1d73-4504-9b03-fae9103edb5b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech tungi paket (8 soat)	main	480	250000.000000000000000000000000000000	250000.00	250000.00	\N	\N	night	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{1,2,3,4}	17:00:00	03:00:00	Dushanba-Payshanba 17:00-03:00
23b56bf7-29af-4599-96fd-cf16350e0a2d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 3 soat paket	main	180	130000.000000000000000000000000000000	130000.00	130000.00	\N	\N	package	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{5,6,7}	17:00:00	03:00:00	Juma-Yakshanba 17:00-03:00
ee462069-4bb5-40c1-b527-d58c9d72f74b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech tungi paket (8 soat)	main	480	350000.000000000000000000000000000000	350000.00	350000.00	Redbull	Redbull	night	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{5,6,7}	17:00:00	03:00:00	Juma-Yakshanba 17:00-03:00
f92ec947-3334-4503-882e-b75fdc1dec5c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza 1 soat	vip	60	60000.000000000000000000000000000000	60000.00	60000.00	\N	\N	time	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{1,2,3,4}	10:00:00	17:00:00	Dushanba-Payshanba 10:00-17:00
d7e6ce6b-97f2-40a0-8d54-99af10004d9e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza 1 soat	vip	60	80000.000000000000000000000000000000	80000.00	80000.00	\N	\N	time	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{1,2,3,4}	17:00:00	03:00:00	Dushanba-Payshanba 17:00-03:00
4d2c7d39-7d51-46ed-a226-1e0675dcc304	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza 1 soat	vip	60	100000.000000000000000000000000000000	100000.00	100000.00	\N	\N	time	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{5,6,7}	10:00:00	03:00:00	Juma-Yakshanba
6ff69528-8d84-45e6-a5a5-5306bba888e6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza 3 soat paket	vip	180	200000.000000000000000000000000000000	200000.00	200000.00	\N	\N	package	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{1,2,3,4}	17:00:00	03:00:00	Dushanba-Payshanba 17:00-03:00
ecb7a24e-fdb7-4072-bb08-6722521281e2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza 5 soat paket	vip	300	300000.000000000000000000000000000000	300000.00	300000.00	\N	\N	package	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{1,2,3,4}	17:00:00	03:00:00	Dushanba-Payshanba 17:00-03:00
67ed0efd-280f-4187-be5e-061990eb25f0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza tungi paket (8 soat)	vip	480	500000.000000000000000000000000000000	500000.00	500000.00	Energetik	Energetik	night	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{1,2,3,4}	17:00:00	03:00:00	Dushanba-Payshanba 17:00-03:00
97d4b6b6-ed8f-46b9-bdfb-a7c92b1278fc	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza 3 soat paket	vip	180	250000.000000000000000000000000000000	250000.00	250000.00	Energetik	Energetik	package	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{5,6,7}	17:00:00	03:00:00	Juma-Yakshanba 17:00-03:00
b2058b01-f860-490f-9c30-6583b23e2843	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza 5 soat paket	vip	300	300000.000000000000000000000000000000	300000.00	300000.00	Energetik + Chips	Energetik + Chips	package	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{5,6,7}	17:00:00	03:00:00	Juma-Yakshanba 17:00-03:00
4ffa4329-c97b-4c39-9e73-fb467b91f3c8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza tungi paket (8 soat)	vip	480	500000.000000000000000000000000000000	500000.00	500000.00	Redbull + Chips	Redbull + Chips	night	t	2026-06-29 08:22:24.511	2026-06-29 08:22:24.511	{5,6,7}	17:00:00	03:00:00	Juma-Yakshanba 17:00-03:00
38401fb5-44df-4594-b645-6e94b746274f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 5 soat paket	main	300	200000.000000000000000000000000000000	200000.00	200000.00	18+	Flash kichik	package	t	2026-06-29 08:22:24.511	2026-07-02 08:56:36.673	{5,6,7}	17:00:00	03:00:00	Juma-Yakshanba 17:00-03:00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: b2game_club_user
--

COPY public.users (id, name, email, password_hash, role, branch_id, is_active, created_at, updated_at) FROM stdin;
06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin.3@b2game.uz	$2a$12$8cxcMc4TjxhN7Qc2vyAUzeoHjfz5/r40kagjI8RGi9q.1fvF.s2Aa	admin	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	t	2026-06-08 13:00:45.248	2026-06-09 15:09:34.358
3b87f36b-3c07-4ac8-8686-3e76ce91f43f	Admin-2	admin.2@b2game.uz	$2a$12$61mTBpQ.35bnOBeSBpJiX.lDqp4NxpKtmswYvsVPyzM2R164dnJR2	admin	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	t	2026-06-08 13:00:45.92	2026-06-11 14:38:12.892
2ab18278-557a-416c-a142-aae3cf6ea6d8	Developer	dev@b2game.uz	$2b$10$jISx75Srwpnxj.Kvr3S6jOQK7aMkXdrDuCRc3/tqcltia5krgbEYW	dev	\N	t	2026-06-16 10:57:04.917	2026-06-16 10:57:04.917
67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin.1@b2game.uz	$2b$10$mw5Ks7evfLORNMd8.S7sye3GCqR2ARvwJ8ZbP4oI3szkheBw6GH66	admin	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	t	2026-06-08 13:00:45.615	2026-06-17 16:18:13.036
22778489-a0f5-4640-87c1-b24ff009cb87	Dev Super Admin	devsuper@b2game.uz	$2b$10$qA5iw1xsKqPhoKb8a6w/LeVeL8n08VP20wIs6i7eR0jxqmFijZncW	dev_super_admin	\N	t	2026-06-16 11:57:45.649	2026-06-16 11:57:45.649
dac28a45-122f-47f0-85d2-9bd2ae523eff	Dev Admin	devadmin@b2game.uz	$2b$10$fEZlaWOVFR78ogONY1HaAuIJKNMXqhpS29sX6w1eMzJEKgL2hwlGG	dev_admin	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	t	2026-06-16 11:57:45.952	2026-06-16 11:57:45.952
7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	superadmin@b2game.uz	$2b$10$3UbxP8OoTWh0.LRgPl6LTOVHN8mps.Syi8KosFEcXCUUQLYlWxcS2	super_admin	\N	t	2026-06-08 13:00:44.927	2026-06-09 15:13:44.295
133cb49b-6696-44ee-b28e-92471d9156f4	Main Admin	admin.main@b2game.uz	$2b$10$hWgMH.hdkWmb/4qXfTtcX.rWpEnafVtUCn981acL6cZpiB2DjerhC	admin	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	t	2026-06-29 08:22:32.292	2026-06-29 08:22:32.292
cfd42b6f-980c-42f0-9c5a-c9c7d175763c	Main Admin	admin@b2game.uz	$2b$10$FILZ0WOZYtb7ldexEcvVceGavncYO1nnW8hUb7b8ooJevPIHnLnZO	admin	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	t	2026-06-29 08:22:32.695	2026-06-29 08:22:32.695
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin_deductions admin_deductions_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.admin_deductions
    ADD CONSTRAINT admin_deductions_pkey PRIMARY KEY (id);


--
-- Name: admin_penalty_payments admin_penalty_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.admin_penalty_payments
    ADD CONSTRAINT admin_penalty_payments_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: cash_withdrawal_requests cash_withdrawal_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.cash_withdrawal_requests
    ADD CONSTRAINT cash_withdrawal_requests_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: repair_requests repair_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_pkey PRIMARY KEY (id);


--
-- Name: rig_connections rig_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.rig_connections
    ADD CONSTRAINT rig_connections_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: shift_withdrawals shift_withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.shift_withdrawals
    ADD CONSTRAINT shift_withdrawals_pkey PRIMARY KEY (id);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: simulator_admins simulator_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.simulator_admins
    ADD CONSTRAINT simulator_admins_pkey PRIMARY KEY (simulator_id, admin_id);


--
-- Name: simulators simulators_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.simulators
    ADD CONSTRAINT simulators_pkey PRIMARY KEY (id);


--
-- Name: tariffs tariffs_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.tariffs
    ADD CONSTRAINT tariffs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: b2game_club_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: admin_deductions_admin_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX admin_deductions_admin_id_idx ON public.admin_deductions USING btree (admin_id);


--
-- Name: admin_deductions_branch_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX admin_deductions_branch_id_idx ON public.admin_deductions USING btree (branch_id);


--
-- Name: admin_deductions_expense_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX admin_deductions_expense_id_idx ON public.admin_deductions USING btree (expense_id);


--
-- Name: admin_deductions_shift_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX admin_deductions_shift_id_idx ON public.admin_deductions USING btree (shift_id);


--
-- Name: admin_deductions_type_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX admin_deductions_type_idx ON public.admin_deductions USING btree (type);


--
-- Name: admin_penalty_payments_admin_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX admin_penalty_payments_admin_id_idx ON public.admin_penalty_payments USING btree (admin_id);


--
-- Name: admin_penalty_payments_branch_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX admin_penalty_payments_branch_id_idx ON public.admin_penalty_payments USING btree (branch_id);


--
-- Name: admin_penalty_payments_shift_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX admin_penalty_payments_shift_id_idx ON public.admin_penalty_payments USING btree (shift_id);


--
-- Name: branches_code_key; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE UNIQUE INDEX branches_code_key ON public.branches USING btree (code);


--
-- Name: cash_withdrawal_requests_admin_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX cash_withdrawal_requests_admin_id_idx ON public.cash_withdrawal_requests USING btree (admin_id);


--
-- Name: cash_withdrawal_requests_branch_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX cash_withdrawal_requests_branch_id_idx ON public.cash_withdrawal_requests USING btree (branch_id);


--
-- Name: cash_withdrawal_requests_expense_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX cash_withdrawal_requests_expense_id_idx ON public.cash_withdrawal_requests USING btree (expense_id);


--
-- Name: cash_withdrawal_requests_purpose_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX cash_withdrawal_requests_purpose_idx ON public.cash_withdrawal_requests USING btree (purpose);


--
-- Name: cash_withdrawal_requests_shift_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX cash_withdrawal_requests_shift_id_idx ON public.cash_withdrawal_requests USING btree (shift_id);


--
-- Name: cash_withdrawal_requests_status_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX cash_withdrawal_requests_status_idx ON public.cash_withdrawal_requests USING btree (status);


--
-- Name: expenses_branch_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX expenses_branch_id_idx ON public.expenses USING btree (branch_id);


--
-- Name: expenses_shift_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX expenses_shift_id_idx ON public.expenses USING btree (shift_id);


--
-- Name: expenses_spent_by_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX expenses_spent_by_idx ON public.expenses USING btree (spent_by);


--
-- Name: inventory_branch_id_product_id_key; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE UNIQUE INDEX inventory_branch_id_product_id_key ON public.inventory USING btree (branch_id, product_id);


--
-- Name: payments_shift_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX payments_shift_id_idx ON public.payments USING btree (shift_id);


--
-- Name: products_barcode_key; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE UNIQUE INDEX products_barcode_key ON public.products USING btree (barcode);


--
-- Name: rig_connections_rig_id_key; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE UNIQUE INDEX rig_connections_rig_id_key ON public.rig_connections USING btree (rig_id);


--
-- Name: settings_branch_id_key_key; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE UNIQUE INDEX settings_branch_id_key_key ON public.settings USING btree (branch_id, key);


--
-- Name: shift_withdrawals_branch_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX shift_withdrawals_branch_id_idx ON public.shift_withdrawals USING btree (branch_id);


--
-- Name: shift_withdrawals_shift_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX shift_withdrawals_shift_id_idx ON public.shift_withdrawals USING btree (shift_id);


--
-- Name: shifts_one_open_per_branch; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE UNIQUE INDEX shifts_one_open_per_branch ON public.shifts USING btree (branch_id) WHERE (status = 'open'::text);


--
-- Name: simulator_admins_admin_id_idx; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE INDEX simulator_admins_admin_id_idx ON public.simulator_admins USING btree (admin_id);


--
-- Name: simulators_branch_id_code_key; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE UNIQUE INDEX simulators_branch_id_code_key ON public.simulators USING btree (branch_id, code);


--
-- Name: simulators_device_id_key; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE UNIQUE INDEX simulators_device_id_key ON public.simulators USING btree (device_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: b2game_club_user
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.armor(bytea) TO b2game_club_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.armor(bytea, text[], text[]) TO b2game_club_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.crypt(text, text) TO b2game_club_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.dearmor(text) TO b2game_club_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrypt(bytea, bytea, text) TO b2game_club_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrypt_iv(bytea, bytea, bytea, text) TO b2game_club_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.digest(bytea, text) TO b2game_club_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.digest(text, text) TO b2game_club_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.encrypt(bytea, bytea, text) TO b2game_club_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.encrypt_iv(bytea, bytea, bytea, text) TO b2game_club_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_random_bytes(integer) TO b2game_club_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_random_uuid() TO b2game_club_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_salt(text) TO b2game_club_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_salt(text, integer) TO b2game_club_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.hmac(bytea, bytea, text) TO b2game_club_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.hmac(text, text, text) TO b2game_club_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_armor_headers(text, OUT key text, OUT value text) TO b2game_club_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_key_id(bytea) TO b2game_club_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea) TO b2game_club_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text) TO b2game_club_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text) TO b2game_club_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea) TO b2game_club_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text) TO b2game_club_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO b2game_club_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea) TO b2game_club_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea, text) TO b2game_club_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea) TO b2game_club_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text) TO b2game_club_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text) TO b2game_club_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text, text) TO b2game_club_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text) TO b2game_club_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text) TO b2game_club_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text) TO b2game_club_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text, text) TO b2game_club_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text) TO b2game_club_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text) TO b2game_club_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO b2game_club_user;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO b2game_club_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO b2game_club_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO b2game_club_user;


--
-- PostgreSQL database dump complete
--

\unrestrict 00fq3w7oBJEZLdDtUUKyr2qCMXJAw14y9DdzLYjtu2e6hZgRnwYGdNAnkdm5j3D

