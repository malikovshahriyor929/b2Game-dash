# B2 Game Club Backend

Express + TypeScript + Prisma + PostgreSQL + JWT + WebSocket backend for the B2 Game Club dashboard.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Create PostgreSQL database:

```bash
createdb b2_game_club
```

Then run:

```bash
npm run prisma:generate
npm run migrate
npm run seed
npm run dev
```

Server runs on `http://localhost:4000`.

## Environment

`DATABASE_URL` must point to PostgreSQL:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/b2_game_club
JWT_ACCESS_SECRET=change_me_access
JWT_REFRESH_SECRET=change_me_refresh
FRONTEND_URL=http://localhost:3000
```

## Test Users

- `superadmin@b2game.uz` / `superadmin123` / `super_admin`
- `admin.main@b2game.uz` / `admin123` / `admin`
- `admin.yunusabad@b2game.uz` / `admin123` / `admin`
- `admin.chilonzor@b2game.uz` / `admin123` / `admin`
- `admin.sergeli@b2game.uz` / `admin123` / `admin`
- `admin.samarqand@b2game.uz` / `admin123` / `admin`

## REST Auth

```http
POST /api/auth/login
POST /api/auth/refresh
GET /api/auth/me
POST /api/auth/logout
```

Use `Authorization: Bearer <access_token>` for protected routes.

## Main API Surface

- Dashboard: `GET /api/dashboard/summary`
- Simulators: `GET /api/simulators/map`, `GET /api/simulators`, `PATCH /api/simulators/:id/status`
- Rig commands: `POST /api/simulators/:id/lock`, `/unlock`, `/timed-unlock`, `/notify`, `/reboot`, `/request-status`, `POST /api/simulators/push-update`
- Sessions: `POST /api/sessions/start`, `POST /api/sessions/:id/add-time`, `/pause`, `/resume`, `/stop`, `GET /api/sessions/active`
- Cashier: `GET /api/cashier/products`, `POST /api/cashier/scan`, `POST /api/cashier/sales`, `POST /api/cashier/sales/:id/pay`
- Products: `GET/POST/PATCH/DELETE /api/products`
- Inventory: `GET /api/inventory`, `GET /api/inventory/low-stock`, `POST /api/inventory/restock`, `POST /api/inventory/adjust`
- Bookings: `GET/POST/PATCH /api/bookings`, `POST /api/bookings/:id/cancel|arrived|complete`
- Customers: `GET/POST/PATCH /api/customers`, `GET /api/customers/:id/sessions`, `/sales`
- Tariffs: `GET/POST/PATCH/DELETE /api/tariffs`
- Repairs: `GET/POST /api/repair-requests`, approval/fix workflow action endpoints
- Shifts: `GET /api/shifts`, `POST /api/shifts/open`, `POST /api/shifts/:id/close`
- Logs: `GET /api/logs`
- Reports: `/api/reports/revenue`, `/shop-sales`, `/product-profit`, `/simulator-usage`, `/vip-usage`, `/repairs`, `/admin-activity`, `/shifts`, `/unpaid`, `/inventory`
- Analytics: `/api/analytics/overview`, `/branch-comparison`, `/peak-hours`, `/top-products`, `/top-simulators`, `/repeat-customers`
- Monitoring: `/api/monitoring/overview`, `/branches`, `/admin-actions`, `/repair-timeline`, `/sales-live`, `/simulator-live`
- Settings: `GET /api/settings`, `PATCH /api/settings`

## Branch Scope

- `admin` is always forced to their assigned `branch_id`.
- `super_admin` can pass `branch_id=<uuid>` or `branch_id=all`.
- Monitoring routes are Super Admin only.

## Repair Workflow

Admin creates request -> Super Admin approves/rejects -> Admin starts fixing -> Admin marks fixed -> Super Admin confirms fixed. Admin cannot directly move broken/fixed simulator back to `ready_to_play`.

## WebSocket

Rig agent:

```text
ws://localhost:4000/ws/rig
```

Hello:

```json
{
  "type": "hello",
  "rig_id": "MAIN-01-RIG",
  "simulator_code": "MAIN-01",
  "branch_code": "MAIN",
  "hostname": "b2-main-01",
  "label": "MAIN-01",
  "version": "1.0.0",
  "locked": true,
  "lock_message": "LOCKED - see staff"
}
```

Dashboard:

```text
ws://localhost:4000/ws/dashboard?token=<jwt>&branch_id=all
```

Events include `simulator_updated`, `simulator_online`, `simulator_offline`, `session_started`, `session_stopped`, `payment_created`, `sale_created`, `inventory_updated`, `repair_requested`, `repair_status_changed`, `shift_opened`, `shift_closed`, `log_created`.

## Frontend Proxy

The Next.js app now has:

```text
/api/backend/*
```

It forwards to `BACKEND_URL` (`http://127.0.0.1:4000` by default). During local development it logs in using `BACKEND_PROXY_EMAIL` and `BACKEND_PROXY_PASSWORD`.

## FLIGHT

Seed creates exactly 5 branches with 20 simulators each: 16 `MAIN-*` and 4 `VIP-*`. It does not create `FLIGHT`, `FLIGHT-01`, or any flight simulator.
