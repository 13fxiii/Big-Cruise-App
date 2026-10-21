# Colyseus Multiplayer Rollout

## Guardrails
- This work is isolated on `feature/colyseus-multiplayer`; do not merge or deploy automatically.
- Preserve the existing React/Vite app, navigation, game catalogue, Supabase auth, and current session-sync code while integrating incrementally.
- Keep Supabase as identity and durable-record storage initially. Colyseus owns transient authoritative live room state.
- Never trust client-supplied user IDs, dice results, legal moves, turn ownership, winner claims, or scores. Resolve identity from a verified Supabase access token before production room access.
- Do not put Supabase service-role secrets in the browser or commit secrets to the repository.

## First milestone
1. Build a separately deployable Colyseus server with a health endpoint.
2. Establish room creation/join and state synchronization in a staging environment.
3. Reconcile the current Ludo rules and game-player identity contract.
4. Implement authoritative dice rolls, legal token moves, captures, turn transitions, and win conditions.
5. Add reconnect/resume with authenticated identity and room membership.
6. Verify two real clients, duplicate/stale action rejection, disconnects, and restart behavior.
7. Integrate a feature-flagged Ludo entry point without replacing current navigation.
8. Expand the shared room pattern to Draw It Out, Codenames, and Werewolf only after the first milestone passes.

## Deployment
- Frontend remains on Vercel.
- Colyseus runs on a persistent Node/WebSocket host, not a serverless function that cannot maintain long-lived connections.
- Set `PORT` from the host environment and configure the frontend's public WebSocket endpoint via a Vite environment variable.
- Use staging secrets and a staging Supabase project during validation.

## Current scaffold limitations
The first room is only a lobby/state-sync scaffold. It is not yet a playable Ludo implementation. Authentication, matchmaking policy, reconnection tokens, turn rules, dice generation, move validation, rate limiting, integration tests, and production deployment are not complete. Do not expose this server publicly for real gameplay until those controls exist.
