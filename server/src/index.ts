import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import express from "express";
import { createServer } from "node:http";
import { LudoRoom } from "./rooms/LudoRoom.js";

const port = Number(process.env.PORT ?? 2567);
const app = express();
app.get("/health", (_req, res) => res.json({ ok: true, service: "big-cruise-colyseus", time: new Date().toISOString() }));

const httpServer = createServer(app);
const gameServer = new Server({ transport: new WebSocketTransport({ server: httpServer }) });
gameServer.define("ludo", LudoRoom);

httpServer.listen(port, () => {
  console.log(`BIG CRUISE Colyseus server listening on :${port}`);
});

async function shutdown() {
  await gameServer.gracefullyShutdown(false);
  process.exit(0);
}
process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
