import { Room, type Client } from "colyseus";

interface HealthState {
  connectedPlayers: number;
}

export class HealthRoom extends Room {
  maxClients = 10;
  state: HealthState = { connectedPlayers: 0 };

  onCreate() {
    this.onMessage("ping", (client: Client, payload: unknown) => {
      client.send("pong", { ok: true, payload, serverTime: Date.now() });
    });
  }

  onJoin() {
    this.state.connectedPlayers += 1;
  }

  onLeave() {
    this.state.connectedPlayers = Math.max(0, this.state.connectedPlayers - 1);
  }
}
