import http from "http";
import { app } from "./app";
import { env } from "./config/env";
import { assertDbConnection } from "./config/db";
import { attachWebSocketServer } from "./websocket/websocket.server";
import { startRigMvpSync } from "./services/rigMvpSync.service";

async function main() {
  await assertDbConnection();
  const server = http.createServer(app);
  attachWebSocketServer(server);
  startRigMvpSync();
  server.listen(env.PORT, () => {
    console.log(`B2Game backend listening on http://localhost:${env.PORT}`);
    console.log(`Rig WebSocket: ws://localhost:${env.PORT}/ws/rig`);
    console.log(`Dashboard WebSocket: ws://localhost:${env.PORT}/ws/dashboard`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
