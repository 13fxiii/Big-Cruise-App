import http from "node:http";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { HealthRoom } from "./rooms/HealthRoom.js";

const port = Number(process.env.PORT ?? 2567);
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const httpServer = http.createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true, service: "big-cruise-multiplayer" }));
    return;
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "not_found" }));
});

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer,
    verifyClient: (info: { origin?: string }, callback: (result: boolean) => void) => {
      // During local development, no allow-list means localhost-only app setup.
      // Production must set ALLOWED_ORIGINS explicitly.
      const origin = info.origin ?? "";
      const localOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      callback(allowedOrigins.length > 0 ? allowedOrigins.includes(origin) : localOrigin);
    }
  })
});

gameServer.define("health", HealthRoom);

httpServer.listen(port, () => {
  console.log(`BIG CRUISE multiplayer listening on :${port}`);
});

async function shutdown(signal: string) {
  console.log(`Received ${signal}; shutting down Colyseus`);
  await gameServer.gracefullyShutdown(false);
  httpServer.close(() => process.exit(0));
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
