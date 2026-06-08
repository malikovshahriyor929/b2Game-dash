# B2Game Platform

The project is split into two independent apps:

- `frontend/` - Next.js dashboard
- `backend/` - Express API, WebSocket server, PostgreSQL, Prisma

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Default local URL: `http://localhost:3000`

Frontend environment example: `frontend/.env.example`

## Backend

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

Default API URL: `http://localhost:4000`

Backend environment example: `backend/.env.example`

## Root Shortcuts

```bash
npm run dev:frontend
npm run dev:backend
npm run build:frontend
npm run build:backend
```

Postman files are in `backend/postman/`.
