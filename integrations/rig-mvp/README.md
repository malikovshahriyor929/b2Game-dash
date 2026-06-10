# RIG-MVP ↔ b2Game integration

RIG-MVP stays a separate service. b2Game talks to it over HTTP only (no webhook).

## b2Game backend `.env`

```env
RIG_MVP_API_URL=http://127.0.0.1:8000
RIG_MVP_SYNC_INTERVAL_MS=1000
RIG_DEFAULT_BRANCH_CODE=MAIN
```

## How sync works

| Trigger | Latency |
|---------|---------|
| Admin lock/unlock/start session/notify | **Instant** — `triggerRigMvpSync()` after each command |
| Rig connects/disconnects on its own | **≤ 1s** — background poll to `GET /api/rigs` |
| DB persist | On change, at most every `RIG_MVP_DB_SYNC_INTERVAL_MS` (60s) |

Dashboard WebSocket (`/ws/dashboard`) broadcasts after each sync — no separate rig webhook.

## RIG-MVP requirements

`admin_server.py` must expose:

```
POST /api/rigs/{rig_id}/command
```

`rig_agent.py` must handle `start_session` messages.

## Run

```bash
# Terminal 1 — RIG-MVP
cd "Rig-MVP 3" && python admin_server.py

# Terminal 2 — b2Game
cd backend && npm run dev
```
