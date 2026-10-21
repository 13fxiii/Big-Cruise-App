import { Client, Room } from "@colyseus/core";
import { Schema, MapSchema, type } from "@colyseus/schema";

class LudoPlayer extends Schema {
  @type("string") userId = "";
  @type("string") displayName = "";
  @type("boolean") ready = false;
}

class LudoState extends Schema {
  @type("string") phase: "lobby" | "playing" | "finished" = "lobby";
  @type("string") currentTurnSessionId = "";
  @type({ map: LudoPlayer }) players = new MapSchema<LudoPlayer>();
}

export class LudoRoom extends Room {
  maxClients = 4;
  state = new LudoState();

  onCreate() {
    this.onMessage("ready", (client, payload: { ready?: boolean }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || this.state.phase !== "lobby") return;
      player.ready = payload?.ready === true;
    });

    // Gameplay actions will be added only after existing Ludo rules and
    // player identity contracts have been reconciled with the current app.
    this.onMessage("ping", (client) => client.send("pong", { serverTime: Date.now() }));
  }

  onJoin(client: Client, options: { userId?: string; displayName?: string }) {
    const player = new LudoPlayer();
    player.userId = typeof options?.userId === "string" ? options.userId : "";
    player.displayName = typeof options?.displayName === "string" ? options.displayName.slice(0, 24) : "Player";
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    // Preserve the slot for reconnection until a reconnect policy is implemented.
    const player = this.state.players.get(client.sessionId);
    if (player) player.ready = false;
  }
}
