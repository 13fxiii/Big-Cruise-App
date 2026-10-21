# BIG CRUISE〽️ Multiplayer Server

Isolated Colyseus service for real-time multiplayer. This folder is additive: the existing Vite frontend, Supabase schema, game catalogue, and navigation remain unchanged until a tested client adapter is integrated.

## Intended responsibilities

- Colyseus is authoritative for live room membership, turns, game actions, and in-room state.
- Supabase remains the identity and durable persistence layer (profiles, match history, final results).
- The browser frontend connects over WebSocket using the Colyseus SDK.
- Do not put Supabase service-role secrets in the browser or commit secrets.

## Rollout

1. Deploy this service to a persistent Node.js host; do not deploy the WebSocket server as a Vercel serverless function.
2. Configure `PORT`, `ALLOWED_ORIGINS`, and the server-side Supabase credentials only when auth/persistence integration is implemented.
3. Add a frontend adapter behind a feature flag, without replacing existing game routes.
4. Verify two authenticated browsers can create/join a room, observe the same server-owned state, reject invalid moves, and reconnect after a dropped connection.
5. Pilot one game (recommended: Ludo) before migrating Draw It Out, Codenames, or Werewolf.

## Current scaffold status

This branch establishes the service boundary only. No production frontend wiring, schema migrations, or deployment has been performed. Game-specific room rules must be added only after the existing rule modules and Supabase project are verified.
