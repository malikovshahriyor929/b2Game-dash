--
-- PostgreSQL database dump
--

\restrict dW09AROwXJirm7sZTVNqUR30mJjKEwZBn1xDKKFVzce6hneMhHOrpsVnOjSBJFm

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
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
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    balance numeric(65,30) DEFAULT 0 NOT NULL,
    bonus numeric(65,30) DEFAULT 0 NOT NULL,
    total_spent numeric(65,30) DEFAULT 0 NOT NULL,
    sessions_count integer DEFAULT 0 NOT NULL,
    last_visit_at timestamp(3) without time zone,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: logs; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
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
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: repair_requests; Type: TABLE; Schema: public; Owner: -
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
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: rig_connections; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: sales; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
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
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid,
    key text NOT NULL,
    value jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: -
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
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: simulators; Type: TABLE; Schema: public; Owner: -
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
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tariffs; Type: TABLE; Schema: public; Owner: -
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
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
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


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ade84108-ccc4-4d96-8dba-83e7d34eadd9	94424e6816ca54aaa003acc605d011726ef5be20c352d16b81d6b51e48bf7c43	2026-06-08 12:52:05.971318+00	20260608125203_db_push	\N	\N	2026-06-08 12:52:04.472455+00	1
ff1ffb39-ae76-47d7-b851-96c00f3d0ae7	f1e4f1f56d7547d0d02eeaf25c1274acbe6170193becedd2c8a1f358a72653f7	2026-06-09 15:01:19.515153+00	20260609090000_add_simulator_map_position	\N	\N	2026-06-09 15:01:18.108622+00	1
89b62c98-f0ba-4a7a-b588-e4203e306c83	b806c8b036b104ab675833bb42bb871a65939ef714591e3feb5b7d84a2af5e08	2026-06-10 12:23:51.315864+00	20260610094714_db	\N	\N	2026-06-10 12:23:49.974061+00	1
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, branch_id, simulator_id, booking_type, customer_id, customer_name, phone, repair_request_id, start_time, end_time, status, note, created_by, created_at, updated_at) FROM stdin;
3b9bcf86-c14f-4c42-a6cd-dc1b0510faff	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	ede5fe11-f029-4f7b-b355-938347c2dedd	customer_booking	\N	Bekzod	998901234567	\N	2026-06-08 15:00:41.554	2026-06-08 16:00:41.554	confirmed	Two players	06ad4ebc-1250-4a6d-94ca-605bd0871581	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branches (id, name, code, address, phone, status, created_at, updated_at) FROM stdin;
21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	B2 Main Arena	MAIN	Main Arena	+998900000000	active	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
eb31d71a-6ede-496d-9851-542b42b8e2f9	B2 Yunusabad	YUNUSABAD	Yunusabad	+998900000000	active	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
09b2a6f7-90c0-4d54-a054-a5282277dda2	B2 Chilonzor	CHILONZOR	Chilonzor	+998900000000	active	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
b051a52a-b76e-40fc-8929-6d31f05c006e	B2 Sergeli	SERGELI	Sergeli	+998900000000	active	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	B2 Samarqand	SAMARQAND	Samarqand	+998900000000	active	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, branch_id, name, phone, balance, bonus, total_spent, sessions_count, last_visit_at, status, created_at, updated_at) FROM stdin;
b172db10-871c-4988-93d1-9c69c2906154	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Aziz	998901112233	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	1	2026-06-08 13:00:41.554	active	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory (id, branch_id, product_id, stock_quantity, low_stock_threshold, created_at, updated_at) FROM stdin;
551b0fb6-347e-4023-a241-ab29603e53b8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7063cda0-36d5-49bc-8f5f-6c4c0c0594c4	48	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
db141904-4fdb-405a-b9a8-da76f029b574	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	1d3178da-38ca-4660-9f27-ec30dcd75239	80	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
5a06d402-c13b-485d-b2eb-96dd4929fca3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f171db85-4db0-4b65-950e-53dc3852890c	12	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
557df262-d94b-4f61-8efd-c95a9bd22d8d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	393cd93f-4b0c-49a9-a040-2c9f5024179f	25	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
d9c8efc7-4d7f-42bf-9ef7-70616f19540b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	89f8f31b-c725-4d9b-9e7c-eb546be23570	35	5	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
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
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_movements (id, branch_id, product_id, type, quantity, before_quantity, after_quantity, reason, created_by, created_at) FROM stdin;
95a592f4-1ee7-4c29-80d5-253b792cec2e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	5384e0c0-1630-48cb-99c4-da396559f5dc	sale	3	10	7	sale paid	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-09 14:51:06.007
03d5e164-02ad-47e7-8436-119d6b1b2e53	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	37e42e81-2b80-43b4-8ad4-9de1327c91e3	sale	2	24	22	sale paid	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-09 15:14:12.141
08e2b6a5-2796-4517-8b95-521d30ccb1c2	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	5384e0c0-1630-48cb-99c4-da396559f5dc	sale	1	7	6	sale paid	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-09 15:14:12.227
\.


--
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.logs (id, branch_id, actor_id, actor_name, actor_role, action_type, entity_type, entity_id, simulator_id, session_id, amount, details, created_at) FROM stdin;
dede9c53-ebd1-49df-a233-4656fe324993	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Main Admin	admin	start_session	session	01b08c39-3500-42bf-a9a4-2aaad0d7746a	b967ae2c-2207-4d47-b41a-5e27192e0bad	01b08c39-3500-42bf-a9a4-2aaad0d7746a	50000.000000000000000000000000000000	{"seeded": true}	2026-06-08 13:00:41.554
56ae6bc4-6254-475c-bb37-024383ec4c36	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Main Admin	admin	repair_requested	repair_request	c21671d4-9129-4b67-bda6-bf752bc184ff	ede5fe11-f029-4f7b-b355-938347c2dedd	\N	\N	{"seeded": true}	2026-06-08 13:00:41.554
5a7aaff1-b2a3-42a4-819d-89a58b719e17	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	97a5ac70-0187-49dd-a127-ac16bcd9369e	Samarqand Admin	admin	login	user	97a5ac70-0187-49dd-a127-ac16bcd9369e	\N	\N	\N	{"seeded": true}	2026-06-08 13:00:41.554
682fcc33-6bcc-4f4e-82a3-1db12a3111b1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:40:05.635
04b51fa6-4eb7-4f6a-87f9-28ca674ec0c4	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:41:57.438
5321e2a6-860e-4ead-a0fb-62a4d25ec1c5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:04.036
2b780792-e88d-4050-bedc-15684b5d1bbc	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:04.734
eea57a7e-7393-483f-99a9-5b27e143095b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:04.734
bd101d89-db1c-44f5-96d7-287dccd63da7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:05.435
e331b32d-2a35-49ea-8200-df64fa239f12	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:10.134
5f3cd122-2cf1-4832-9c6a-14eea3b4d91a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:10.836
6aa179f9-c4ef-400d-8ffb-a7ad20a5e43e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:11.734
9040390a-7811-49da-8cfa-59a97d195f70	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:12.737
fe765c9e-87aa-4cdb-88c8-749bfe465f17	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:15.232
3f5fb400-0028-414a-ab13-9cf43f3c684e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:16.734
c0e24201-cb13-4489-a334-e20a65e31fa6	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:18.235
ed3db98c-cdd7-4328-ab90-2e301d04a70f	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:20.336
1cfd01f5-8b52-4900-8166-ddd8ff3fec79	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:21.738
d2c8eaa6-3112-455c-a068-5d60b308d60e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:23.032
0d6dd8b9-7b83-455d-9fd9-d49d2c9942a1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:25.035
07f88db9-d4b4-46a3-9d15-28224e2091a9	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:26.341
fcf09b9e-0467-478f-a187-1ef70b81d240	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:27.838
1d97601f-c27e-4595-bd7f-9aa766597f91	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:28.432
bf08f0ae-ad1b-4520-a41c-f275d55bc219	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:29.348
9fb29b6f-5186-4921-9959-c4c4d6cdbfeb	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:42:49.444
69b92f24-f718-4f6f-b707-cb87b5ee4057	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:43:17.144
a5d7d341-41bb-4a3c-9c81-c9183d998499	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:43:36.334
4b7356e5-5286-4427-a66b-361d97a8e868	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 15:43:57.139
417c7dca-6b57-4880-8f5f-053cf367e0ab	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-08 16:12:18.915
c6d9f27b-e8f8-4c3a-b654-091427e30614	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:09.592
3a92e2b5-df62-43a4-ad41-474efe96c4d4	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:09.794
98ffcc95-d58a-4f8c-9e34-2410bf7ed31b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:09.899
23f0883f-2ab5-4725-ae2d-98f3b30eeee7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:16.592
e663949c-09d8-46e4-8252-d9ef8760572c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:20.992
4cf580e4-5ac7-4057-ad9f-83af6bcbc810	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:21.291
af35b9fb-da13-49d8-922d-1e89fa9ee82b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:24.412
0826bf72-9294-40f5-8994-ed1fd97ff238	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:24.811
c3b9ddaa-7910-457e-a76b-6a906838c337	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:24.811
cd41ab92-b0b3-4c77-acc4-6254ad70e179	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:25.695
626c64dc-bca0-42a2-9bee-1d8ad744d805	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:28.795
523646e2-6e2c-40f4-8b5f-91a3e0141054	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:29.793
504116a9-ebe5-47d1-975c-de8250edcec1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:30.797
6103d9a8-ed7f-4ccb-a487-cf8d6e808a0c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:32.102
40993b5e-59f6-426c-8d85-bdc6afc65fc5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:34.694
accd6b16-ac5e-4280-9e7f-d138a67fa9b0	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:37.496
a7d35196-bb7b-4b92-9f22-ee56e68512e1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:37.593
7c74875f-6890-4a9d-afff-20f3e7e49262	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:38.093
7d7b404b-bbe6-4a21-8d2d-67a32e6f49a2	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:39.592
e09da8c3-c714-4860-8a8b-13a2c86ddb7c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:16:40.693
b8bafedb-0fb0-4b04-a8f9-c82be995a4b3	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:24:41.703
f791513d-5137-4b76-a329-40b0c0923da4	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:18.492
4de7428d-487d-47fe-a617-5ff009d9c13c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:20.29
3cc1aa45-133a-461e-9461-c063e28c0f62	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:20.597
9efde2bf-8bfc-413a-9e86-1e9026162bcc	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:22.295
91c15110-6b20-4872-a2c1-0888bbfe4e3a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:25.111
af8a4631-c02a-4d60-951c-af6558590672	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:26.393
d32bcd5b-7e8f-4314-964b-17f63b4b5c95	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:26.693
8fd05963-d2e0-485c-819f-e7f8ea80faf1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:29.89
2a3c9ff1-5dad-48df-b01a-66c6fdd6d0aa	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:31.891
9ba6f7cd-5328-492e-ad97-f70a7bb33e36	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:32.294
11baad25-96b8-4b8c-af5f-87ca95d6c0b1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:34.59
57c39af2-7263-4694-bde4-378254411914	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:35.19
f2ae0359-04e3-4007-853f-f67fc424f5c6	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:38.291
b1621cac-a7aa-47c6-9750-57457a29df75	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:38.491
7caf6bba-6ef2-46f7-b2fc-7b834932e206	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:40.39
4ecbc6ca-6b5c-46a7-8d62-d7316c895b0a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:40.991
37c4b026-36a9-4354-9cae-b6487b1129a8	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:43.492
88395b81-8dfb-420d-b94c-e89e7805922a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:45.898
8cc2de66-ad71-4490-abc7-c91a06cf6fa2	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:46.194
ce2e6b87-ad89-4b34-b09a-7832711d5f38	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:48.293
66e55437-e347-43cc-b917-65b854b677ae	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:50.692
0b35c99d-da1c-4d9c-9784-fd0deae66553	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:52.195
6af78a0d-bc37-4502-bc53-177004cd218d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:52.594
45aa4cd5-db49-4506-bb45-c1842dfd5da3	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:53.499
96a5561a-c34c-45fa-9a4f-d022c299274a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:54
5f350c31-7140-445d-8264-566189c8ef77	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:33:57.405
ee773cf2-9849-4176-b1af-2e32d64c80b7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:43:18.508
897a9654-2501-41a7-bb9d-bccbf0d6a614	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:45:46.837
9df54827-4913-4c9b-8a1d-9e717c82f3a7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:45:46.86
1344fc99-06ca-4956-808f-e01c91b8ea46	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:45:46.928
4e7927c2-3f73-4351-8485-b59985086498	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:45:46.938
f04a6418-86c4-4e82-879c-b56da0a6e72a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:45:47.003
b4f80fe9-357c-4893-85ab-7a1d629c17a0	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:45:47.03
bf3a892f-9210-44b4-b01a-adb17337d534	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:45:49.703
4e1df02e-c2ac-480f-b866-449c585bbff9	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:45:55.955
2d68773c-759f-4e1a-a5a2-18de0b473af1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 06:52:54.606
8e9fed2e-ffac-46c6-a06a-06caa5764983	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:04:32.492
fa658999-84a2-4caa-9185-5bdd2d79f320	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:16:41.6
699788e1-e2ec-4baa-b345-81914ae70981	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:28:49.6
cc898a2e-cd70-4000-b88b-b5888f6f8955	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:35:15.705
101a84f5-6aba-4e9a-b438-6ce0472475d6	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:39:19.605
0c7baf24-d0f0-433b-a14b-f6e74498a65d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:49:51.393
f94bc91b-c856-4bbe-96d1-cc14ce6dedc6	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:49:52.595
eed36b9f-b50b-4d21-b0a0-c9a6ce7d4fd1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:49:53.491
27930a10-e1e3-450d-bd75-2ce43f6f23a0	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:49:53.494
207d49ee-6833-4f85-a79d-e944e5eed320	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:49:57.892
681f36cf-df63-4412-bf78-5de49e1173e9	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:49:58.594
a7e7bc74-3bbd-4afa-bfd5-570fdd44f4e3	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:49:59.292
1b9ae085-2adc-4140-bd42-b280d73d4dca	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:50:01.593
9c9dd26c-627a-4177-9a47-eb5072624e6d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:50:03.491
4838cd48-5759-43a1-a5a0-a391e7a864d5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:50:04.192
310f0910-41a9-4fab-bfb0-b25e211030b8	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:50:05.991
6b54ab65-59b9-4570-9760-8f8cbba0a4d5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:50:08.193
8f8e3bd5-4de4-4433-b986-dae893e3e3dd	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:50:09.493
83855743-79ff-4e88-a7c3-217eadcfca62	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:50:10.794
b469bb61-f68f-4af4-ac6c-71495415f424	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:50:10.893
1b7fa986-1995-4345-bf67-17046f1ae7d7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:50:11.503
55391a7c-7f87-4437-9d67-11c033d08da6	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 07:50:19.7
b81a6706-667e-48a5-b246-14c907de79da	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:12.502
d0596d9c-9a93-4940-8e30-7f099f42d1e2	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:20.898
454cad6b-4c48-4ad3-9b78-a9a14d28285d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:21.097
45c06713-db01-4d7b-a783-10c62f9cc815	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:21.796
9e2e2fc3-84d3-482b-936d-d52cabe209a8	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:23.297
2d22d44b-4549-4596-9a27-5f15f55009d2	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:26.798
953e7db5-6900-4b56-93dc-e8837044edcc	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:27.602
36940f2c-fa75-4cc5-b87f-2acf40688072	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:29.097
a39d3d66-044d-41a5-8616-b163e7b2522e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:29.502
5397a737-99f4-4a28-9c7d-37d1a0189a6a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:34.495
cb08af50-0ba5-4ac6-b4ce-c1dc5bf1356d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:35.495
22fb0c7a-42d0-48db-aee8-5a77cd7fdd6c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:35.695
18d14107-dda1-4e66-adc9-65ae319b6f33	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:36.098
bb987fe0-a725-4672-a65a-470f96ec77a2	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:40.8
d330e01a-4113-4089-9f68-c97bb62cff35	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:40.9
55526e75-fde4-4fb5-9de9-5326eabc3e4d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:41.508
94c0ebdc-0b59-4c16-b335-11faff6b54ef	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 09:53:40.8
da2d76f9-2954-4e1f-8eb6-ba7ac274123d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:10:37.844
de4ec1e9-0b2a-447e-9275-774e2eb40c5b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:10:38.936
1ea760b1-464c-4ed1-b838-0c27da2518e1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:10:40.636
7515520c-cd19-44d8-8e95-d1889f587ccc	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:10:40.938
2a846b87-508e-436a-a506-3b777b387493	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:10:43.937
63f47e2e-9090-4079-88f3-719e0583d657	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:10:46.139
8b1977a1-bd0e-4d40-9568-5e1f58649df3	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:10:46.139
d8fa2925-e62c-438c-b0a5-142fe5b6b6f3	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:10:47.642
99294919-fc58-4975-8b7a-57a1721934ee	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:10:50.238
fef9542d-87a2-4305-98ea-701385a5ac8c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:10:51.739
1df0e791-1c1e-4ce5-93fe-2ac41089cee9	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:10:53.041
399e98f4-b74d-4546-acac-537e1f93396e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:10:55.441
699f603a-d82a-4e1c-9117-c39353e303fa	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:10:57.239
ceab9a27-87f9-45fe-be2e-9f3699032a21	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:10:58.24
e320722d-8f67-47e9-8ad5-35cddd75e5a7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:10:58.741
426177d9-0dba-49fd-bdce-1e4a8a7b7f2f	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:11:00.337
67b5dadc-a826-4996-a3e1-190382b7d9c5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:11:04.336
40383bec-8ec4-4801-8661-d5d5a4c1786e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:11:04.836
555c6a2b-00a4-47de-a51a-c92d8ce68a20	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:11:05.74
d1ac1d8f-38a6-473e-9a18-d9847802441c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:11:05.936
35a3cd29-4180-4e21-aa75-3a7a60d2e7e4	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:11:09.238
46807b9e-384b-4914-8912-297cbb3af570	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:11:10.039
d5c572cf-5a9e-4bd1-ab6e-40da7088282b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 11:11:10.144
92c99fc4-4011-4d5f-8756-15e76b3c3691	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 13:02:54.557
3a40d01c-7fd4-485e-8463-e01a97e38d3b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 13:02:56.861
0af44d75-df0a-46f1-8fba-d59530c10768	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 13:02:56.862
1b802f39-5939-454d-bfdd-878a7f23461c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 13:02:56.856
cf1a9d67-b9da-498c-99f9-e7c3c18aee05	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 13:03:00.854
0f3dcb47-fb9d-4695-8952-bf71ebe985ee	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 13:03:01.353
25fa61b1-3299-4fd0-91c8-50ea794e0e84	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 13:03:01.357
589275a3-9df9-4dc1-bf63-a334e7bfba20	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 13:03:01.563
ae2af088-cf7d-4364-9fbf-5dada65b06a8	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:35.338
c738e163-7403-4863-ae4b-72d8300afe3e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:36.94
71343e00-aaab-4632-81dd-ee517e07a06b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:37.241
ea571645-d860-4a03-bad8-fb544d759362	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:38.738
712cdcf1-2c01-46b5-b7ab-f1d31c9531a5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:43.242
b015fca5-0ef2-4824-8452-ef6c8e6ecf1e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:43.641
f2b6f763-0e26-4673-9f1c-a25b2b43ac3b	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:44.141
f2d71e8d-6080-4190-87e8-52bbd5afe817	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:45.343
f1470831-8973-4b7c-ac9e-a6e4a5e331a5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:48.042
43d0d8f8-fca3-4593-96ac-e114708dbd2a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:48.847
9a659084-7599-49d4-a0c0-6ed9e0fa0d15	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:51.043
bd51bcfd-811d-4625-8a6d-10f28b9d878a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:53.446
c4a6fb7d-c7c9-4795-a94e-395d7e6b92ee	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:54.511
167f8d43-2a8e-453d-a6b6-8938c143af07	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:54.741
a77b8d1a-e890-428a-ad55-25074f005ce5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:57.243
ab552170-1102-4d5f-8800-07e8728c77aa	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:48:58.741
fefb8a91-3b23-4d84-adf5-fc183153638c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:00.442
e1dc9529-a46d-4e39-b51a-e3a3aee232ab	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:01.842
32a0b28c-b114-4226-b4a7-0199958b3fa1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:04.044
9d0efcea-d469-4627-8c0c-a69be7834fe7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:05.544
6c91e680-6b3a-4672-837a-4bf59762bed7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:06.042
138a6f83-8948-4dd9-b2c8-f1aa70039d21	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:07.744
318b8d89-365a-4df0-93a1-9bf3907d7145	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:10.541
6a3e7741-e6c2-4c18-8456-feda7f7acf72	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:11.344
3edf499e-7c66-4be0-ac11-cf4c5ab031a7	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:13.346
f2c61959-8c8c-4f96-b425-f1c349caa808	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:14.645
40120344-cdbd-47c0-9012-4cd465463d5e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:17.143
119b5523-f0b8-490b-91df-de58f0545c6e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:18.738
768c7068-fd1c-49fc-b8b5-6e97af5e95f3	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:19.938
6cb6c938-f67b-498c-9398-7da9caa5620d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:23.145
9bf89757-d040-4193-8db8-a2ddd6c27493	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:23.249
3e62b7a1-48ef-4563-9ad8-df7987052922	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:25.537
a486321d-4dcf-4048-94f6-f315bee72765	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:26.138
920a9900-7348-4a7c-b507-2bba6cfc3be8	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:29.439
b8ef61c1-c19f-4a08-b88f-0efca472f083	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:30.539
81335a16-a545-48f6-92b3-45a344a8fc9f	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:30.644
38921286-dc91-45c5-9fd3-282f68791c9a	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:31.242
e0053a14-5b37-4b63-b2f5-9282c7e0aaa8	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:31.843
2d6d6b9d-3795-4658-a25c-2fac7fc97620	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:49:32.849
c42dd0d1-bef4-4520-9df3-b9fffc61227e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_created	product	5384e0c0-1630-48cb-99c4-da396559f5dc	\N	\N	\N	{}	2026-06-09 14:49:46.793
77f334e1-9db3-40ed-b890-368a557fb3da	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_inventory_created	product	5384e0c0-1630-48cb-99c4-da396559f5dc	\N	\N	\N	{"cost": 8000, "icon": "coffee", "name": "Flash", "price": 10000, "barcode": "1234", "category": "Ichimliklar", "stock_after": 10}	2026-06-09 14:49:46.891
73983143-071a-4668-9061-bafb7da80d2c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	5384e0c0-1630-48cb-99c4-da396559f5dc	\N	\N	\N	{"barcode": "1234"}	2026-06-09 14:50:25.01
ec8fcede-428d-4a47-9d89-5156e72ad8de	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	5384e0c0-1630-48cb-99c4-da396559f5dc	\N	\N	\N	{"barcode": "1234"}	2026-06-09 14:50:28.598
9a73ea34-c716-4edf-a7d7-463a7ac42bf8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	sale_created	sale	8530352f-de49-43df-b719-3a2b107e7539	\N	\N	30000.000000000000000000000000000000	{"items": [{"name": "Flash", "barcode": "1234", "quantity": 3, "product_id": "5384e0c0-1630-48cb-99c4-da396559f5dc", "unit_price": 10000, "total_price": 30000}], "profit": 6000, "discount": 0, "subtotal": 30000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-06-09 14:51:05.112
6484181b-00ad-4dec-9df7-7135dc2e9b39	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	payment_created	sale	8530352f-de49-43df-b719-3a2b107e7539	\N	\N	30000.000000000000000000000000000000	{"items": [{"name": "Flash", "barcode": "1234", "quantity": 3, "product_id": "5384e0c0-1630-48cb-99c4-da396559f5dc", "unit_price": 10000, "total_price": 30000}], "method": "cash", "payment_id": "851eb1f0-e87a-4c63-a6f6-e95502918fd3", "card_amount": 0, "cash_amount": 30000, "customer_id": null, "balance_after": null, "change_amount": 20000, "customer_type": "guest", "balance_amount": 0, "balance_before": null, "received_amount": 50000}	2026-06-09 14:51:06.139
2c3dd9ae-6ee7-48ed-9685-85740755e79c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	add_time	session	01b08c39-3500-42bf-a9a4-2aaad0d7746a	\N	01b08c39-3500-42bf-a9a4-2aaad0d7746a	40000.000000000000000000000000000000	{}	2026-06-09 14:51:38.729
b00650ba-fabd-4411-991b-8a0c45daebb1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:54:55.468
7a4cf30f-cf5f-415e-956f-135d838ae349	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:54:55.539
99044463-ccbd-4a39-b93f-8082c79fc13f	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:54:56.144
c154e84b-bc27-47b9-8829-6592a0c018e5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:54:56.345
20b53043-9b43-463c-892f-0022f253010d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:01.746
2136cf27-d2df-4671-8f5d-b65f6425e871	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:02.843
1321c210-3c9f-40a0-81bc-36096904e9c0	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:04.544
a9f2ebd3-7458-4f1f-930e-65993fb48152	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:06.74
4faf13aa-7b53-40c7-b4d8-0f1e3291ff94	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:08.339
e0c4865e-93c8-41f5-9413-4a8c1375e39f	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:08.439
1aed623b-3097-4b7a-aa1b-f33cae2bd8e5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:10.041
3aa29022-17a3-42c5-8eb5-32b87b4e1b58	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:12.743
00a3b5b1-7f87-442d-a759-f17fed186ebd	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:13.643
dbd6e2ae-9c91-4287-9e08-b8497b48ef98	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:14.01
a0c6e44f-5444-423c-b59a-1c1b2ac653df	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:14.742
58d4ec9b-25b8-4ce5-a8a8-4bc580c95c5e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:20.868
e32adb6d-318b-4e44-8030-39d1292c0b78	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:23.514
35bc0b06-7761-496d-ba02-300c1840f121	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:24.111
d85fbb49-17bb-4af3-9e99-dea15ee16c2d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:26.012
84eb3e13-17e6-406e-821b-443e672bcfc2	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:26.113
6d45cefd-fb5f-471e-88fc-f7c388aa79a0	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:55:27.211
ec335333-cba3-48cd-8fd8-638198304985	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:56:27.02
a7bc186e-41fc-4816-b078-6135119318d0	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 14:56:36.02
0aec5b8a-c5f2-42bd-83b5-ef67a7450aeb	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:05:05.427
34911d10-f56a-4c27-895a-d74fbc1985e9	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	tariff_created	tariff	35ef29bf-4253-4f09-87f9-d6e50b60b3b1	\N	\N	\N	{}	2026-06-09 15:06:04.824
2d81a5ec-b322-4129-9cb7-540d39eb979d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:06:16.117
54a33a4e-0993-4886-a0e3-0d59cef39ee9	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:06:17.518
fa2d6ffa-17e5-41c3-9341-8bd3ca02901f	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:06:18.025
40f76700-4e75-43e7-83a8-152ebb198d52	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:10:36.319
caf230ec-1acb-47f4-9611-aa0251ff60b5	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:10:36.812
165a10d1-5223-4099-a72b-242609d652dc	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:10:38.313
0132bd95-2da9-40a3-bcb5-4a77c79da563	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:10:40.216
1ca30498-5e7a-4085-b90a-c08966fdda2d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:10:43.314
a4b2061a-e842-46d0-9235-94b0781bb934	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:10:43.317
981a0931-0dda-4255-8b17-c0f6972598c1	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:10:43.412
53ff5474-768e-4ef5-91cc-034dce511696	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:11:27.413
15c76fdc-b7a8-4027-8f3d-4a96a15756fd	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:11:28.915
57e9b5fc-c4e3-4dcd-9193-4b27fb6cd132	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:11:29.214
50102bda-40ce-4205-bc39-b0d44aee469e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:11:29.824
996a36f0-8fce-4f72-97ff-fd6786463be1	eb31d71a-6ede-496d-9851-542b42b8e2f9	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	login	user	67005460-527d-4723-915f-8ff20067e42d	\N	\N	\N	{}	2026-06-09 15:12:26.722
030f75ce-3c40-4d57-b81c-63e253ac5b57	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:12:30.416
22b4a6b7-0d2e-451a-88d8-a639ec651b7c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_created	product	37e42e81-2b80-43b4-8ad4-9de1327c91e3	\N	\N	\N	{}	2026-06-09 15:12:33.361
9295837a-200c-485d-8e51-70d0240a7f30	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_inventory_created	product	37e42e81-2b80-43b4-8ad4-9de1327c91e3	\N	\N	\N	{"cost": 15500, "icon": "drink", "name": "Redbull", "price": 22000, "barcode": "777123", "category": "Ichimliklar", "stock_after": 24}	2026-06-09 15:12:33.448
1fabd3d8-3e3f-450a-819e-3e5d8b24cd60	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	37e42e81-2b80-43b4-8ad4-9de1327c91e3	\N	\N	\N	{"barcode": "777123"}	2026-06-09 15:12:52.666
8b1a51bc-4c25-413b-9fc3-7d4d9d82b1fb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	37e42e81-2b80-43b4-8ad4-9de1327c91e3	\N	\N	\N	{"barcode": "777123"}	2026-06-09 15:13:01.151
36815326-9bb7-4872-8cc7-7953156c9e4f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	product_scanned	product	5384e0c0-1630-48cb-99c4-da396559f5dc	\N	\N	\N	{"barcode": "1234"}	2026-06-09 15:13:08.719
aabbd0a2-13c4-478e-bd4b-a186e77e6fbf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	sale_created	sale	15fea797-cb76-4ba6-b731-fe7ca340b60f	\N	\N	54000.000000000000000000000000000000	{"items": [{"name": "Redbull", "barcode": "777123", "quantity": 2, "product_id": "37e42e81-2b80-43b4-8ad4-9de1327c91e3", "unit_price": 22000, "total_price": 44000}, {"name": "Flash", "barcode": "1234", "quantity": 1, "product_id": "5384e0c0-1630-48cb-99c4-da396559f5dc", "unit_price": 10000, "total_price": 10000}], "profit": 15000, "discount": 0, "subtotal": 54000, "customer_id": null, "customer_name": null, "customer_type": "guest", "customer_phone": null}	2026-06-09 15:14:11.247
a65ea3b1-8013-4419-9715-10aa3b8d2d34	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	payment_created	sale	15fea797-cb76-4ba6-b731-fe7ca340b60f	\N	\N	54000.000000000000000000000000000000	{"items": [{"name": "Redbull", "barcode": "777123", "quantity": 2, "product_id": "37e42e81-2b80-43b4-8ad4-9de1327c91e3", "unit_price": 22000, "total_price": 44000}, {"name": "Flash", "barcode": "1234", "quantity": 1, "product_id": "5384e0c0-1630-48cb-99c4-da396559f5dc", "unit_price": 10000, "total_price": 10000}], "method": "cash", "payment_id": "d971227c-0903-4812-9c40-39acfbd53df6", "card_amount": 0, "cash_amount": 54000, "customer_id": null, "balance_after": null, "change_amount": 6000, "customer_type": "guest", "balance_amount": 0, "balance_before": null, "received_amount": 60000}	2026-06-09 15:14:12.367
d44811a7-5bc0-4123-bcb6-9c6021bfdaec	eb31d71a-6ede-496d-9851-542b42b8e2f9	67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin	login	user	67005460-527d-4723-915f-8ff20067e42d	\N	\N	\N	{}	2026-06-09 15:48:02.72
426ebdba-9a00-4f77-bdf1-0a5fceb61b57	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-09 15:54:34.533
e7e4af85-ad3e-493f-afa0-244dfb0f06b3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_unlocked	rig_mvp	\N	\N	\N	\N	{"rig_id": "bm-pc"}	2026-06-09 15:56:41.321
7990611f-d3df-4990-bf2f-a150c7a2c607	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	\N	{"rig_id": "bm-pc"}	2026-06-09 15:56:50.034
0512f432-aae7-483c-b69a-f2bb4c7cfe2e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	simulator_locked	rig_mvp	\N	\N	\N	\N	{"rig_id": "home-pc"}	2026-06-09 15:56:52.846
ef9c65a4-ea24-4e63-a560-7ea11ee91a3e	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-10 09:07:05.014
c033290b-78c3-4d68-924a-c4f38a8914f4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	\N	{}	2026-06-10 09:11:36.324
4acd8cb7-0e31-4643-8a5e-ac7631826e64	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	\N	{}	2026-06-10 09:11:37.029
6e10dab6-debb-4fe8-aae6-e1bd5a68e912	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	\N	{}	2026-06-10 09:34:54.134
0acc1291-0594-43cc-8f0b-3967a72d1f6d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	settings_updated	settings	\N	\N	\N	\N	{"simulator_map_layout": {"facilities": {"wc": {"col": 22, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 23, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 21, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-10 09:41:17.871
59e5369c-d5d6-4511-8300-ca83777874d4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	settings_updated	settings	\N	\N	\N	\N	{"simulator_map_layout": {"facilities": {"wc": {"col": 22, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 23, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 21, "row": 5, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-10 09:41:44.393
46a8b55c-319e-457f-8903-29acfd269383	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	settings_updated	settings	\N	\N	\N	\N	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 4, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-10 09:42:05.874
0902212a-7125-4674-a5dc-c39c38e76844	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	00000000-0000-0000-0000-000000000001	Super Admin	super_admin	settings_updated	settings	\N	\N	\N	\N	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 4, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 8, "row": 3, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-10 09:43:08.116
3b407aec-f0a5-4cce-b9e7-7c278a300379	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-10 10:09:11.258
9559c4b1-bc4d-4e90-8d34-df0619c2f1e7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	\N	{}	2026-06-10 10:09:55.985
fbfb9384-8412-4b39-8a2f-a07c6521b3a3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	repair_requested	repair_request	ec15df27-d1e6-40b2-bed2-44d546e01f37	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	\N	{}	2026-06-10 10:10:15.803
a8e65f60-ef89-4379-89ec-79b844ec9171	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	\N	{}	2026-06-10 10:28:31.504
6c19bb27-2444-4516-8e52-3f6a51282b4f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	\N	{"rig_id": "bm-pc"}	2026-06-10 10:28:50.058
5e43b84e-5ad9-4a91-8de0-a6b008b9b7c3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_unlocked	rig_mvp	\N	\N	\N	\N	{"rig_id": "bm-pc"}	2026-06-10 10:29:16.225
a423f8bc-b8d2-4a58-8d10-9e219f1597b1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	\N	{"rig_id": "home-pc"}	2026-06-10 10:30:16.623
13243fef-3d43-49cc-b207-d9428e9733b0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	546a3a1d-fad3-4aea-a8c4-b3b35caa713f	7560ac62-9494-4ba7-95c8-23d3e3313943	546a3a1d-fad3-4aea-a8c4-b3b35caa713f	0.000000000000000000000000000000	{}	2026-06-10 10:31:45.404
aaf7824e-801c-4de9-a020-a30d89a7389c	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-10 10:43:33.812
93d7b8f5-2c3b-4f34-8e15-9c9e722d1cf4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	login	user	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	\N	{}	2026-06-10 10:58:38.857
4b92198f-37bf-4b5b-a8fb-d92b8860a287	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	93a97756-772d-4e44-9d07-3dadeac19ddb	Main Admin	admin	login	user	93a97756-772d-4e44-9d07-3dadeac19ddb	\N	\N	\N	{}	2026-06-10 11:06:35.815
cae04b91-9078-47e9-801e-8f3955afa686	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	93a97756-772d-4e44-9d07-3dadeac19ddb	Main Admin	admin	login	user	93a97756-772d-4e44-9d07-3dadeac19ddb	\N	\N	\N	{}	2026-06-10 11:32:29.868
d88c9a22-b1d4-4b1e-91d4-8044e591a14a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	stop_session	session	59ce53ba-01a7-4b7d-8f9c-bd5c063e69fb	f7db86e9-4c80-4f1c-a1d4-6f78b93e5bba	59ce53ba-01a7-4b7d-8f9c-bd5c063e69fb	\N	{}	2026-06-10 12:01:27.377
7ef1f599-ce81-4065-b0bc-343680a04eb8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	\N	{"rig_id": "bm-pc"}	2026-06-10 12:01:29.027
fb6a703e-6a6f-43b6-a58c-bef46d545dbf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	settings_updated	settings	\N	\N	\N	\N	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 4, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 12, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-10 12:01:54.944
2ac0c7c1-7e25-4578-8fc1-b8f42a86e08e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	stop_session	session	546a3a1d-fad3-4aea-a8c4-b3b35caa713f	7560ac62-9494-4ba7-95c8-23d3e3313943	546a3a1d-fad3-4aea-a8c4-b3b35caa713f	\N	{}	2026-06-10 12:02:39.033
b3a5dc78-eb67-43f1-9ee4-32fb1d8fa78a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	\N	{"rig_id": "home-pc"}	2026-06-10 12:02:41.072
147fb16f-9310-4e04-bde1-6b2b60e38986	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-10 12:05:58.509
a2cc8e91-8d12-4cb9-95ef-ea3a49fd1b84	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	37a131d1-32c6-4920-92aa-00757cda5cc4	7560ac62-9494-4ba7-95c8-23d3e3313943	37a131d1-32c6-4920-92aa-00757cda5cc4	40000.000000000000000000000000000000	{}	2026-06-10 12:07:48.867
7caf2733-22d5-4136-beb6-ab8136c29c3c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	\N	{"rig_id": "home-pc"}	2026-06-10 12:07:54.149
ed566c42-0fd4-49a2-8710-c4e565e34cb8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	51c5f428-20a4-4beb-9eaf-c23c2764bfc0	7560ac62-9494-4ba7-95c8-23d3e3313943	51c5f428-20a4-4beb-9eaf-c23c2764bfc0	25000.000000000000000000000000000000	{}	2026-06-10 12:08:49.528
c6a67eac-682e-480d-8486-8f316fc42f84	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	stop_session	session	51c5f428-20a4-4beb-9eaf-c23c2764bfc0	7560ac62-9494-4ba7-95c8-23d3e3313943	51c5f428-20a4-4beb-9eaf-c23c2764bfc0	\N	{}	2026-06-10 12:08:54.732
a995645d-c1ee-4a34-995d-2a000b9942bd	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	\N	{"rig_id": "home-pc"}	2026-06-10 12:09:01.029
ae328bc3-d7d4-47ae-bb1e-aadd393ee831	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	c398e987-9ba8-4d72-8411-695adc0a2ba1	7560ac62-9494-4ba7-95c8-23d3e3313943	c398e987-9ba8-4d72-8411-695adc0a2ba1	25000.000000000000000000000000000000	{}	2026-06-10 12:09:39.14
c877fa29-15ac-41a6-bdc1-171d3b02c663	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	settings_updated	settings	\N	\N	\N	\N	{"simulator_map_layout": {"facilities": {"wc": {"col": 8, "row": 4, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 13, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}}	2026-06-10 12:09:48.472
11d68e7a-3314-4588-93c0-8ef401194a3a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	\N	stop_session	session	01b08c39-3500-42bf-a9a4-2aaad0d7746a	b967ae2c-2207-4d47-b41a-5e27192e0bad	01b08c39-3500-42bf-a9a4-2aaad0d7746a	\N	{"source": "system", "expired": true}	2026-06-10 12:14:26.866
0ca7fd40-4b99-4de9-a0d0-911364d188d8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	stop_session	session	c398e987-9ba8-4d72-8411-695adc0a2ba1	7560ac62-9494-4ba7-95c8-23d3e3313943	c398e987-9ba8-4d72-8411-695adc0a2ba1	\N	{}	2026-06-10 12:14:35.668
383c7948-bdd8-423a-b276-4bc3cb7760aa	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	simulator_locked	rig_mvp	\N	\N	\N	\N	{"rig_id": "home-pc"}	2026-06-10 12:14:39.83
2220f123-b280-4f6a-bcff-d5080b5554e7	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	7fb11c41-5907-417c-a002-4bc192039d65	7560ac62-9494-4ba7-95c8-23d3e3313943	7fb11c41-5907-417c-a002-4bc192039d65	25000.000000000000000000000000000000	{}	2026-06-10 12:14:53.495
2b417f99-f7e5-45d4-8698-700443a15d52	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	95dbea80-82f9-4c03-8934-52a34ec1d71f	7560ac62-9494-4ba7-95c8-23d3e3313943	95dbea80-82f9-4c03-8934-52a34ec1d71f	25000.000000000000000000000000000000	{}	2026-06-10 12:17:51.822
da0ea7ed-066f-4dc9-b438-10ced7679238	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin	start_session	session	18cf73c3-7643-4667-baed-d193e73c8ada	7560ac62-9494-4ba7-95c8-23d3e3313943	18cf73c3-7643-4667-baed-d193e73c8ada	25000.000000000000000000000000000000	{}	2026-06-10 12:21:35.914
974ad535-8f91-40a6-a438-54ca7f12e33d	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	super_admin	login	user	7307199d-28dd-4935-85f9-53b7d7cabd3b	\N	\N	\N	{}	2026-06-10 12:30:16.843
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, branch_id, session_id, sale_id, customer_id, amount, method, cash_amount, card_amount, qr_amount, balance_amount, received_amount, change_amount, status, paid_by_admin_id, paid_at, created_at) FROM stdin;
08043011-3dd9-4f8a-b267-f4a5974a3de1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	01b08c39-3500-42bf-a9a4-2aaad0d7746a	\N	b172db10-871c-4988-93d1-9c69c2906154	40000.000000000000000000000000000000	card	0.000000000000000000000000000000	40000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	06ad4ebc-1250-4a6d-94ca-605bd0871581	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
973b0ca4-ee35-43d5-981a-9bda64e5468c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	f2a6204a-bfa0-44b6-bd6c-135c404cb53d	b172db10-871c-4988-93d1-9c69c2906154	18000.000000000000000000000000000000	cash	18000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	06ad4ebc-1250-4a6d-94ca-605bd0871581	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
851eb1f0-e87a-4c63-a6f6-e95502918fd3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	8530352f-de49-43df-b719-3a2b107e7539	\N	30000.000000000000000000000000000000	cash	30000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.00	20000.00	paid	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-09 14:51:06.11	2026-06-09 14:51:06.11
d971227c-0903-4812-9c40-39acfbd53df6	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	15fea797-cb76-4ba6-b731-fe7ca340b60f	\N	54000.000000000000000000000000000000	cash	54000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	60000.00	6000.00	paid	7307199d-28dd-4935-85f9-53b7d7cabd3b	2026-06-09 15:14:12.34	2026-06-09 15:14:12.34
1cdc7f78-f6ac-4ee1-88a6-ca24fa90ae2e	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	59ce53ba-01a7-4b7d-8f9c-bd5c063e69fb	\N	b172db10-871c-4988-93d1-9c69c2906154	40000.000000000000000000000000000000	cash	40000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	06ad4ebc-1250-4a6d-94ca-605bd0871581	2026-06-10 10:29:11.161	2026-06-10 10:29:11.161
8bc0c811-876a-418e-a3f9-d3c208e74cc8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	37a131d1-32c6-4920-92aa-00757cda5cc4	\N	b172db10-871c-4988-93d1-9c69c2906154	40000.000000000000000000000000000000	cash	40000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	06ad4ebc-1250-4a6d-94ca-605bd0871581	2026-06-10 12:07:41.736	2026-06-10 12:07:41.736
03cb0f7d-4c5c-40e7-b1fa-3502c4f0a1c3	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	51c5f428-20a4-4beb-9eaf-c23c2764bfc0	\N	\N	25000.000000000000000000000000000000	cash	25000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	06ad4ebc-1250-4a6d-94ca-605bd0871581	2026-06-10 12:08:45.226	2026-06-10 12:08:45.226
f50db82a-3c01-4304-a820-f520ae9d36c8	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	c398e987-9ba8-4d72-8411-695adc0a2ba1	\N	b172db10-871c-4988-93d1-9c69c2906154	25000.000000000000000000000000000000	cash	25000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	06ad4ebc-1250-4a6d-94ca-605bd0871581	2026-06-10 12:09:36.269	2026-06-10 12:09:36.269
2b81dd56-d1bf-4923-9ab6-c4b09415c4d0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7fb11c41-5907-417c-a002-4bc192039d65	\N	b172db10-871c-4988-93d1-9c69c2906154	25000.000000000000000000000000000000	cash	25000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	06ad4ebc-1250-4a6d-94ca-605bd0871581	2026-06-10 12:14:50.641	2026-06-10 12:14:50.641
61cf4152-9688-422d-a1fe-aaa744015712	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	95dbea80-82f9-4c03-8934-52a34ec1d71f	\N	b172db10-871c-4988-93d1-9c69c2906154	25000.000000000000000000000000000000	cash	25000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	06ad4ebc-1250-4a6d-94ca-605bd0871581	2026-06-10 12:17:47.811	2026-06-10 12:17:47.811
c93f8484-404c-4e7e-97fd-70e2fb9d371d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	18cf73c3-7643-4667-baed-d193e73c8ada	\N	b172db10-871c-4988-93d1-9c69c2906154	25000.000000000000000000000000000000	cash	25000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	0.00	paid	06ad4ebc-1250-4a6d-94ca-605bd0871581	2026-06-10 12:21:29.441	2026-06-10 12:21:29.441
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, category, barcode, price, cost, icon, is_active, created_at, updated_at) FROM stdin;
7063cda0-36d5-49bc-8f5f-6c4c0c0594c4	Coca-Cola 0.5	Drinks	4780001000011	9000.000000000000000000000000000000	6000.000000000000000000000000000000	snack	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
1d3178da-38ca-4660-9f27-ec30dcd75239	Water 0.5	Drinks	4780001000028	5000.000000000000000000000000000000	2500.000000000000000000000000000000	snack	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
f171db85-4db0-4b65-950e-53dc3852890c	Burger	Food	4780001000035	25000.000000000000000000000000000000	17000.000000000000000000000000000000	snack	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
393cd93f-4b0c-49a9-a040-2c9f5024179f	Energy Drink	Drinks	4780001000042	15000.000000000000000000000000000000	10000.000000000000000000000000000000	snack	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
89f8f31b-c725-4d9b-9e7c-eb546be23570	Chips	Snacks	4780001000059	12000.000000000000000000000000000000	8000.000000000000000000000000000000	snack	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
07fef28a-f6f4-42ba-a26c-f23f6176a9d3	Snickers	Snacks	4780001000066	10000.000000000000000000000000000000	6500.000000000000000000000000000000	snack	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
5384e0c0-1630-48cb-99c4-da396559f5dc	Flash	Ichimliklar	1234	10000.000000000000000000000000000000	8000.000000000000000000000000000000	coffee	t	2026-06-09 14:49:46.478	2026-06-09 14:49:46.478
37e42e81-2b80-43b4-8ad4-9de1327c91e3	Redbull	Ichimliklar	777123	22000.000000000000000000000000000000	15500.000000000000000000000000000000	drink	t	2026-06-09 15:12:33.331	2026-06-09 15:12:33.331
\.


--
-- Data for Name: repair_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.repair_requests (id, branch_id, simulator_id, requested_by, approved_by, confirmed_by, title, description, error_type, priority, status, admin_note, super_admin_note, requested_at, approved_at, fixing_started_at, marked_fixed_at, confirmed_at, revenue_impact, created_at, updated_at) FROM stdin;
c21671d4-9129-4b67-bda6-bf752bc184ff	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	ede5fe11-f029-4f7b-b355-938347c2dedd	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	Wheel calibration error	Wheel calibration fails on launch	device_error	high	requested	\N	\N	2026-06-08 13:00:41.554	\N	\N	\N	\N	50000.000000000000000000000000000000	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
ec15df27-d1e6-40b2-bed2-44d546e01f37	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	\N	jhk	hjk	device_error	medium	requested	jkl	\N	2026-06-10 10:10:13.69	\N	\N	\N	\N	0.000000000000000000000000000000	2026-06-10 10:10:13.69	2026-06-10 10:10:13.69
\.


--
-- Data for Name: rig_connections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rig_connections (id, rig_id, simulator_id, branch_id, hostname, label, version, latest_version, locked, lock_message, online, update_status, first_seen_at, last_seen_at, created_at, updated_at) FROM stdin;
28adb0ea-0ea7-4525-86fe-b328cbe1cb16	bm-pc	f7db86e9-4c80-4f1c-a1d4-6f78b93e5bba	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	BM-PC	BM-ngrok	1.0.17	1.0.17	t	\N	f		2026-06-09 07:41:22.493	2026-06-10 12:10:05.015	2026-06-09 15:37:55.792	2026-06-10 12:30:24.811
aff2c7f6-9c45-4a7b-ab18-d7d879232176	home-pc	7560ac62-9494-4ba7-95c8-23d3e3313943	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	HOME-PC	Rig-1	1.0.17	1.0.17	t	\N	t		2026-06-09 15:14:20.212	2026-06-10 12:22:40.258	2026-06-09 15:37:55.821	2026-06-10 12:30:25.11
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sale_items (id, sale_id, product_id, product_name, barcode, quantity, unit_price, unit_cost, total_price, total_cost, profit) FROM stdin;
c2cc9e97-60ef-49c2-a39f-2a3a181be7ae	f2a6204a-bfa0-44b6-bd6c-135c404cb53d	7063cda0-36d5-49bc-8f5f-6c4c0c0594c4	Coca-Cola 0.5	4780001000011	2	9000.000000000000000000000000000000	6000.000000000000000000000000000000	18000.000000000000000000000000000000	12000.000000000000000000000000000000	6000.000000000000000000000000000000
336b4f15-3ece-4315-87aa-b8178c553bb4	8530352f-de49-43df-b719-3a2b107e7539	5384e0c0-1630-48cb-99c4-da396559f5dc	Flash	1234	3	10000.000000000000000000000000000000	8000.000000000000000000000000000000	30000.000000000000000000000000000000	24000.000000000000000000000000000000	6000.000000000000000000000000000000
bb873cfd-0bea-4dd1-a840-7745938b58bd	15fea797-cb76-4ba6-b731-fe7ca340b60f	37e42e81-2b80-43b4-8ad4-9de1327c91e3	Redbull	777123	2	22000.000000000000000000000000000000	15500.000000000000000000000000000000	44000.000000000000000000000000000000	31000.000000000000000000000000000000	13000.000000000000000000000000000000
c7718a66-8417-4eb4-93e8-9277f6088ccb	15fea797-cb76-4ba6-b731-fe7ca340b60f	5384e0c0-1630-48cb-99c4-da396559f5dc	Flash	1234	1	10000.000000000000000000000000000000	8000.000000000000000000000000000000	10000.000000000000000000000000000000	8000.000000000000000000000000000000	2000.000000000000000000000000000000
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales (id, branch_id, session_id, customer_id, sold_by, subtotal, discount, total, total_cost, profit, payment_status, payment_method, created_at, paid_at) FROM stdin;
f2a6204a-bfa0-44b6-bd6c-135c404cb53d	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	01b08c39-3500-42bf-a9a4-2aaad0d7746a	b172db10-871c-4988-93d1-9c69c2906154	06ad4ebc-1250-4a6d-94ca-605bd0871581	18000.000000000000000000000000000000	0.000000000000000000000000000000	18000.000000000000000000000000000000	12000.000000000000000000000000000000	6000.000000000000000000000000000000	paid	cash	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
8530352f-de49-43df-b719-3a2b107e7539	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	30000.000000000000000000000000000000	0.000000000000000000000000000000	30000.000000000000000000000000000000	24000.000000000000000000000000000000	6000.000000000000000000000000000000	paid	cash	2026-06-09 14:51:04.806	2026-06-09 14:51:06.058
15fea797-cb76-4ba6-b731-fe7ca340b60f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	\N	\N	7307199d-28dd-4935-85f9-53b7d7cabd3b	54000.000000000000000000000000000000	0.000000000000000000000000000000	54000.000000000000000000000000000000	39000.000000000000000000000000000000	15000.000000000000000000000000000000	paid	cash	2026-06-09 15:14:10.921	2026-06-09 15:14:12.285
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, branch_id, simulator_id, customer_id, customer_name, phone, tariff_id, status, payment_mode, started_at, ended_at, duration_minutes, added_minutes, remaining_seconds, session_amount, added_time_amount, shop_amount, total_amount, paid_amount, debt_amount, created_by, stopped_by, created_at, updated_at) FROM stdin;
59ce53ba-01a7-4b7d-8f9c-bd5c063e69fb	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	f7db86e9-4c80-4f1c-a1d4-6f78b93e5bba	b172db10-871c-4988-93d1-9c69c2906154	Aziz	998901112233	67cf0bc6-1a18-48ee-83fd-1c04f6187d03	stopped	prepaid	2026-06-10 10:29:10.204	2026-06-10 12:01:24.966	60	0	3600	40000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	40000.000000000000000000000000000000	40000.000000000000000000000000000000	0.000000000000000000000000000000	06ad4ebc-1250-4a6d-94ca-605bd0871581	06ad4ebc-1250-4a6d-94ca-605bd0871581	2026-06-10 10:29:10.204	2026-06-10 10:29:10.204
546a3a1d-fad3-4aea-a8c4-b3b35caa713f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	Guest	998990324234	44e14a32-75f9-43f3-ab1f-abab497ccae4	stopped	postpaid	2026-06-10 10:31:39.369	2026-06-10 12:02:37.058	300	0	18000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	06ad4ebc-1250-4a6d-94ca-605bd0871581	06ad4ebc-1250-4a6d-94ca-605bd0871581	2026-06-10 10:31:39.369	2026-06-10 10:31:39.369
37a131d1-32c6-4920-92aa-00757cda5cc4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	b172db10-871c-4988-93d1-9c69c2906154	Aziz	998901112233	67cf0bc6-1a18-48ee-83fd-1c04f6187d03	active	prepaid	2026-06-10 12:07:40.775	\N	60	0	3600	40000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	40000.000000000000000000000000000000	40000.000000000000000000000000000000	0.000000000000000000000000000000	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	2026-06-10 12:07:40.775	2026-06-10 12:07:40.775
51c5f428-20a4-4beb-9eaf-c23c2764bfc0	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	\N	Guest		35ef29bf-4253-4f09-87f9-d6e50b60b3b1	stopped	prepaid	2026-06-10 12:08:44.496	2026-06-10 12:08:54.031	60	0	3600	25000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	25000.000000000000000000000000000000	25000.000000000000000000000000000000	0.000000000000000000000000000000	06ad4ebc-1250-4a6d-94ca-605bd0871581	06ad4ebc-1250-4a6d-94ca-605bd0871581	2026-06-10 12:08:44.496	2026-06-10 12:08:44.496
01b08c39-3500-42bf-a9a4-2aaad0d7746a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	b967ae2c-2207-4d47-b41a-5e27192e0bad	b172db10-871c-4988-93d1-9c69c2906154	Aziz	998901112233	67cf0bc6-1a18-48ee-83fd-1c04f6187d03	stopped	prepaid	2026-06-08 13:00:41.554	2026-06-10 12:14:24.208	60	60	7200	40000.000000000000000000000000000000	40000.000000000000000000000000000000	0.000000000000000000000000000000	80000.000000000000000000000000000000	80000.000000000000000000000000000000	0.000000000000000000000000000000	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
c398e987-9ba8-4d72-8411-695adc0a2ba1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	b172db10-871c-4988-93d1-9c69c2906154	Aziz	998901112233	35ef29bf-4253-4f09-87f9-d6e50b60b3b1	stopped	prepaid	2026-06-10 12:09:35.297	2026-06-10 12:14:34.953	2	0	120	25000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	25000.000000000000000000000000000000	25000.000000000000000000000000000000	0.000000000000000000000000000000	06ad4ebc-1250-4a6d-94ca-605bd0871581	06ad4ebc-1250-4a6d-94ca-605bd0871581	2026-06-10 12:09:35.297	2026-06-10 12:09:35.297
7fb11c41-5907-417c-a002-4bc192039d65	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	b172db10-871c-4988-93d1-9c69c2906154	Aziz	998901112233	35ef29bf-4253-4f09-87f9-d6e50b60b3b1	stopped	prepaid	2026-06-10 12:14:49.406	2026-06-10 12:16:51.3	2	0	120	25000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	25000.000000000000000000000000000000	25000.000000000000000000000000000000	0.000000000000000000000000000000	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	2026-06-10 12:14:49.406	2026-06-10 12:14:49.406
95dbea80-82f9-4c03-8934-52a34ec1d71f	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	b172db10-871c-4988-93d1-9c69c2906154	Aziz	998901112233	35ef29bf-4253-4f09-87f9-d6e50b60b3b1	stopped	prepaid	2026-06-10 12:17:47.344	2026-06-10 12:20:50.95	1	0	60	25000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	25000.000000000000000000000000000000	25000.000000000000000000000000000000	0.000000000000000000000000000000	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	2026-06-10 12:17:47.344	2026-06-10 12:17:47.344
18cf73c3-7643-4667-baed-d193e73c8ada	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	7560ac62-9494-4ba7-95c8-23d3e3313943	b172db10-871c-4988-93d1-9c69c2906154	Aziz	998901112233	35ef29bf-4253-4f09-87f9-d6e50b60b3b1	stopped	prepaid	2026-06-10 12:21:28.502	2026-06-10 12:22:29.008	1	0	60	25000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	25000.000000000000000000000000000000	25000.000000000000000000000000000000	0.000000000000000000000000000000	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	2026-06-10 12:21:28.502	2026-06-10 12:21:28.502
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, branch_id, key, value, created_at, updated_at) FROM stdin;
9b2edb88-c496-4983-8f44-712834a80654	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	simulator_map_layout	{"facilities": {"wc": {"col": 8, "row": 4, "floor": "1", "colSpan": 1, "rowSpan": 1}, "shop": {"col": 13, "row": 1, "floor": "1", "colSpan": 1, "rowSpan": 1}, "cashier": {"col": 8, "row": 2, "floor": "1", "colSpan": 1, "rowSpan": 1}}}	2026-06-10 09:41:16.294	2026-06-10 12:09:46.957
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shifts (id, branch_id, opened_by, closed_by, status, starting_cash, expected_cash, actual_cash, card_total, qr_total, product_sales, session_sales, refunds, difference, notes, opened_at, closed_at, created_at, updated_at) FROM stdin;
5493e30d-a71c-4d6d-abc0-4f99d08e3aaf	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	06ad4ebc-1250-4a6d-94ca-605bd0871581	\N	open	200000.000000000000000000000000000000	218000.000000000000000000000000000000	\N	50000.000000000000000000000000000000	0.000000000000000000000000000000	18000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	\N	2026-06-08 13:00:41.554	\N	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
\.


--
-- Data for Name: simulators; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.simulators (id, branch_id, name, code, zone, simulator_type, status, device_id, ip_address, ws_rig_id, is_online, current_session_id, last_seen_at, created_at, updated_at) FROM stdin;
f7db86e9-4c80-4f1c-a1d4-6f78b93e5bba	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	BM-ngrok	bm-pc	main	main	offline	bm-pc	BM-PC	bm-pc	f	\N	2026-06-10 12:10:05.015	2026-06-09 15:37:55.252	2026-06-10 12:30:24.511
7560ac62-9494-4ba7-95c8-23d3e3313943	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Rig-1	home-pc	main	main	ready_to_play	home-pc	HOME-PC	home-pc	t	\N	2026-06-10 12:22:40.258	2026-06-09 15:37:55.311	2026-06-10 12:30:24.812
\.


--
-- Data for Name: tariffs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tariffs (id, branch_id, name, simulator_zone, duration_minutes, price, weekday_price, weekend_price, weekday_bonus, weekend_bonus, type, is_active, created_at, updated_at) FROM stdin;
67cf0bc6-1a18-48ee-83fd-1c04f6187d03	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 1 soat	main	60	40000.000000000000000000000000000000	40000.00	50000.00	\N	\N	time	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
5067410d-6490-4d32-9723-97be39fa279b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 3 soat	main	180	100000.000000000000000000000000000000	100000.00	130000.00	\N	\N	package	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
44e14a32-75f9-43f3-ab1f-abab497ccae4	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 5 soat	main	300	150000.000000000000000000000000000000	150000.00	200000.00	\N	energetik	package	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
3ee98413-b22f-45e2-b23f-7151b1190693	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech night	main	480	250000.000000000000000000000000000000	250000.00	350000.00	\N	energetik	night	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
32fe8dc0-9751-4fe9-a9f8-12e886b9dd1c	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza VIP 1 soat	vip	60	80000.000000000000000000000000000000	80000.00	100000.00	\N	\N	vip	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
7589f1c4-dcc9-45e0-8aae-d0f8fce28956	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza VIP 3 soat	vip	180	200000.000000000000000000000000000000	200000.00	250000.00	\N	energetik	vip	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
264eea7d-24a5-405a-8ecf-5c0fbf04020a	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza VIP 5 soat	vip	300	300000.000000000000000000000000000000	300000.00	300000.00	\N	energetik + chips	vip	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
b59778db-317d-42a4-b0e9-40fa6b39845b	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Moza VIP night	vip	480	500000.000000000000000000000000000000	500000.00	500000.00	energetik	energetik	night	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
495eab23-b1ab-4485-be1d-7469c13ab718	eb31d71a-6ede-496d-9851-542b42b8e2f9	Logitech 1 soat	main	60	40000.000000000000000000000000000000	40000.00	50000.00	\N	\N	time	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
d9c83e28-73bb-4c13-82a7-052585e97cac	eb31d71a-6ede-496d-9851-542b42b8e2f9	Logitech 3 soat	main	180	100000.000000000000000000000000000000	100000.00	130000.00	\N	\N	package	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
7e3e7913-2d51-49b5-b76f-572b7a6a2daa	eb31d71a-6ede-496d-9851-542b42b8e2f9	Logitech 5 soat	main	300	150000.000000000000000000000000000000	150000.00	200000.00	\N	energetik	package	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
3f94a2f7-f0e4-4908-96c9-c3934fd996be	eb31d71a-6ede-496d-9851-542b42b8e2f9	Logitech night	main	480	250000.000000000000000000000000000000	250000.00	350000.00	\N	energetik	night	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
4fa5dfdb-add5-47bc-841a-9391cb50294c	eb31d71a-6ede-496d-9851-542b42b8e2f9	Moza VIP 1 soat	vip	60	80000.000000000000000000000000000000	80000.00	100000.00	\N	\N	vip	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
71d73830-fa1b-4e5a-bbfd-628151c47cac	eb31d71a-6ede-496d-9851-542b42b8e2f9	Moza VIP 3 soat	vip	180	200000.000000000000000000000000000000	200000.00	250000.00	\N	energetik	vip	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
fc4b4ec3-7a51-4aa6-9f8a-f38d11994d53	eb31d71a-6ede-496d-9851-542b42b8e2f9	Moza VIP 5 soat	vip	300	300000.000000000000000000000000000000	300000.00	300000.00	\N	energetik + chips	vip	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
b57d6dad-0077-4ded-8fc2-250abe352416	eb31d71a-6ede-496d-9851-542b42b8e2f9	Moza VIP night	vip	480	500000.000000000000000000000000000000	500000.00	500000.00	energetik	energetik	night	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
a4c8df89-badf-46d4-b70d-264984ac6f01	09b2a6f7-90c0-4d54-a054-a5282277dda2	Logitech 1 soat	main	60	40000.000000000000000000000000000000	40000.00	50000.00	\N	\N	time	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
0eaca459-3ddd-42bf-8818-773ff20cdbfe	09b2a6f7-90c0-4d54-a054-a5282277dda2	Logitech 3 soat	main	180	100000.000000000000000000000000000000	100000.00	130000.00	\N	\N	package	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
9547c380-c5a4-4bbd-8def-707154eae6ba	09b2a6f7-90c0-4d54-a054-a5282277dda2	Logitech 5 soat	main	300	150000.000000000000000000000000000000	150000.00	200000.00	\N	energetik	package	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
3e4c5195-6ea1-4381-8a58-815e7e2f3ff2	09b2a6f7-90c0-4d54-a054-a5282277dda2	Logitech night	main	480	250000.000000000000000000000000000000	250000.00	350000.00	\N	energetik	night	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
c34b6553-9c24-4b74-8d39-33a8ea3d8182	09b2a6f7-90c0-4d54-a054-a5282277dda2	Moza VIP 1 soat	vip	60	80000.000000000000000000000000000000	80000.00	100000.00	\N	\N	vip	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
f61530c3-53a2-4e1c-8446-a63176e8ce14	09b2a6f7-90c0-4d54-a054-a5282277dda2	Moza VIP 3 soat	vip	180	200000.000000000000000000000000000000	200000.00	250000.00	\N	energetik	vip	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
86d3906e-6687-40e3-a744-f08d3ee5cf56	09b2a6f7-90c0-4d54-a054-a5282277dda2	Moza VIP 5 soat	vip	300	300000.000000000000000000000000000000	300000.00	300000.00	\N	energetik + chips	vip	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
25546eba-26d2-4ceb-b6df-7c3f1317f247	09b2a6f7-90c0-4d54-a054-a5282277dda2	Moza VIP night	vip	480	500000.000000000000000000000000000000	500000.00	500000.00	energetik	energetik	night	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
6a5c8a3f-972f-4564-a8c5-4435cbe12902	b051a52a-b76e-40fc-8929-6d31f05c006e	Logitech 1 soat	main	60	40000.000000000000000000000000000000	40000.00	50000.00	\N	\N	time	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
7cf567be-38e7-4fb4-a426-dfe1d4bdef7a	b051a52a-b76e-40fc-8929-6d31f05c006e	Logitech 3 soat	main	180	100000.000000000000000000000000000000	100000.00	130000.00	\N	\N	package	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
f81a8d56-252e-4cb3-8e66-1aa5babc1c37	b051a52a-b76e-40fc-8929-6d31f05c006e	Logitech 5 soat	main	300	150000.000000000000000000000000000000	150000.00	200000.00	\N	energetik	package	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
f4a9634a-0e5a-496a-82a1-6a7fd2e03328	b051a52a-b76e-40fc-8929-6d31f05c006e	Logitech night	main	480	250000.000000000000000000000000000000	250000.00	350000.00	\N	energetik	night	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
6d7aa7ac-aa1a-4997-9988-b63376ff5e15	b051a52a-b76e-40fc-8929-6d31f05c006e	Moza VIP 1 soat	vip	60	80000.000000000000000000000000000000	80000.00	100000.00	\N	\N	vip	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
0bdfe6b5-c2e2-4772-bc0d-69264c49fe79	b051a52a-b76e-40fc-8929-6d31f05c006e	Moza VIP 3 soat	vip	180	200000.000000000000000000000000000000	200000.00	250000.00	\N	energetik	vip	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
319efdca-2f94-487e-812c-3df5501779c7	b051a52a-b76e-40fc-8929-6d31f05c006e	Moza VIP 5 soat	vip	300	300000.000000000000000000000000000000	300000.00	300000.00	\N	energetik + chips	vip	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
9acda39a-659f-4612-999c-2fb5630e701c	b051a52a-b76e-40fc-8929-6d31f05c006e	Moza VIP night	vip	480	500000.000000000000000000000000000000	500000.00	500000.00	energetik	energetik	night	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
f641216b-2761-4584-a22e-407ebfff2c07	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	Logitech 1 soat	main	60	40000.000000000000000000000000000000	40000.00	50000.00	\N	\N	time	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
e1235a7b-c379-4953-bec7-de4b3bf4d885	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	Logitech 3 soat	main	180	100000.000000000000000000000000000000	100000.00	130000.00	\N	\N	package	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
d83e2065-c3d8-4c95-a264-46f3aedaec92	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	Logitech 5 soat	main	300	150000.000000000000000000000000000000	150000.00	200000.00	\N	energetik	package	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
bf6dc921-ec61-4e15-b829-b39ffdf18953	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	Logitech night	main	480	250000.000000000000000000000000000000	250000.00	350000.00	\N	energetik	night	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
5daae1e8-1e26-42a6-a8a5-664c2376023f	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	Moza VIP 1 soat	vip	60	80000.000000000000000000000000000000	80000.00	100000.00	\N	\N	vip	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
a270e48b-c4fc-4743-94fc-c1fcaa437845	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	Moza VIP 3 soat	vip	180	200000.000000000000000000000000000000	200000.00	250000.00	\N	energetik	vip	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
aa8cb59c-7a9d-47f8-abb6-aadbe60770f0	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	Moza VIP 5 soat	vip	300	300000.000000000000000000000000000000	300000.00	300000.00	\N	energetik + chips	vip	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
ab68310a-4704-4821-b68e-a8c5fff31489	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	Moza VIP night	vip	480	500000.000000000000000000000000000000	500000.00	500000.00	energetik	energetik	night	t	2026-06-08 13:00:41.554	2026-06-08 13:00:41.554
35ef29bf-4253-4f09-87f9-d6e50b60b3b1	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	Logitech 1 min - test	main	1	25000.000000000000000000000000000000	25000.00	25000.00	\N	\N	time	t	2026-06-09 15:06:04.536	2026-06-10 12:23:26.024
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password_hash, role, branch_id, is_active, created_at, updated_at) FROM stdin;
b220b04e-7972-4cfb-8357-5406b301d8d1	Sergeli Admin	admin.sergeli@b2game.uz	$2b$10$8r0KS.KXHs4gnwgkVDHopuF3dyqmgI/VKTYexa6yxJa/ZAFiuGY4e	admin	b051a52a-b76e-40fc-8929-6d31f05c006e	t	2026-06-08 13:00:46.232	2026-06-08 13:00:46.232
97a5ac70-0187-49dd-a127-ac16bcd9369e	Samarqand Admin	admin.samarqand@b2game.uz	$2b$10$bvd2n1uG.qaJ6Uq7Qost7eo9T4nZL0ox0CJaVrjafLBqqb06E3uE6	admin	7cfaa2f9-6c7e-4eb6-805e-cd371257d4b3	t	2026-06-08 13:00:46.544	2026-06-08 13:00:46.544
3b87f36b-3c07-4ac8-8686-3e76ce91f43f	Admin-2	admin.2@b2game.uz	$2a$12$61mTBpQ.35bnOBeSBpJiX.lDqp4NxpKtmswYvsVPyzM2R164dnJR2	admin	09b2a6f7-90c0-4d54-a054-a5282277dda2	t	2026-06-08 13:00:45.92	2026-06-09 15:09:34.358
06ad4ebc-1250-4a6d-94ca-605bd0871581	Admin-3	admin.3@b2game.uz	$2a$12$8cxcMc4TjxhN7Qc2vyAUzeoHjfz5/r40kagjI8RGi9q.1fvF.s2Aa	admin	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	t	2026-06-08 13:00:45.248	2026-06-09 15:09:34.358
67005460-527d-4723-915f-8ff20067e42d	Admin-1	admin.1@b2game.uz	$2a$12$b2R9GdDkwWgiERWDGvbzHOh/uqgSsZcIolIFT6c1n3KnHYZl07WPu	admin	eb31d71a-6ede-496d-9851-542b42b8e2f9	t	2026-06-08 13:00:45.615	2026-06-09 15:09:34.358
7307199d-28dd-4935-85f9-53b7d7cabd3b	Super Admin	superadmin@b2game.uz	$2a$12$7mvUI2rW2LJJRvZCf/e1Cu2CEGtctJBptY9gGd91ndY8chdS2T6Au	super_admin	\N	t	2026-06-08 13:00:44.927	2026-06-09 15:13:44.295
93a97756-772d-4e44-9d07-3dadeac19ddb	Main Admin	admin.main@b2game.uz	$2b$10$/t.QUWdV3l7NNbiR6NNXBePmez8Fzwu.Pmc96bCM2hkLqb8LdllMq	admin	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	t	2026-06-10 10:25:36.728	2026-06-10 10:25:36.728
146fcbc5-9c48-4c10-a943-fd397bc1af49	Main Admin	admin@b2game.uz	$2b$10$/t.QUWdV3l7NNbiR6NNXBePmez8Fzwu.Pmc96bCM2hkLqb8LdllMq	admin	21eb7b7f-dcf5-45f4-b307-8ac5fcc9ccfd	t	2026-06-10 10:25:36.97	2026-06-10 10:25:36.97
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: repair_requests repair_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_pkey PRIMARY KEY (id);


--
-- Name: rig_connections rig_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rig_connections
    ADD CONSTRAINT rig_connections_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: simulators simulators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulators
    ADD CONSTRAINT simulators_pkey PRIMARY KEY (id);


--
-- Name: tariffs tariffs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tariffs
    ADD CONSTRAINT tariffs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: branches_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX branches_code_key ON public.branches USING btree (code);


--
-- Name: inventory_branch_id_product_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX inventory_branch_id_product_id_key ON public.inventory USING btree (branch_id, product_id);


--
-- Name: products_barcode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_barcode_key ON public.products USING btree (barcode);


--
-- Name: rig_connections_rig_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX rig_connections_rig_id_key ON public.rig_connections USING btree (rig_id);


--
-- Name: settings_branch_id_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX settings_branch_id_key_key ON public.settings USING btree (branch_id, key);


--
-- Name: simulators_branch_id_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX simulators_branch_id_code_key ON public.simulators USING btree (branch_id, code);


--
-- Name: simulators_device_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX simulators_device_id_key ON public.simulators USING btree (device_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- PostgreSQL database dump complete
--

\unrestrict dW09AROwXJirm7sZTVNqUR30mJjKEwZBn1xDKKFVzce6hneMhHOrpsVnOjSBJFm

