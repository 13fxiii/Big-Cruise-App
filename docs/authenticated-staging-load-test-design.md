# BIG CRUISE Authenticated Staging Test Design

## Purpose

Validate the complete multiplayer path in an isolated Supabase staging project:

1. Authenticated player sign-in.
2. Edge Function room creation and joining.
3. Readiness and game actions.
4. Server-authoritative `game_sessions.state` and `game_sessions.version` writes.
5. Optimistic concurrency rejection for stale actions.
6. Supabase Realtime session updates.
7. Client pending-action persistence and reconnect behavior.
8. Cleanup of every staging room, session, player, and action-log row.

This is a **staging-only** test. It must never run against the production project or production user accounts.

## Current backend surfaces

| Game family | Edge Function | Actions | Expected authority |
|---|---|---|---|
| Tic-Tac-Toe, Connect Four, Draw It Out, Werewolf, Codenames, Word Guess, Karaoke, Truth or Dare, Kahoot | `onmuga` | `create`, `join`, `state`, `move`, `draw`, `guess`, `new-round`, `submit`, `replay`, `leave` | `game_sessions.state/version` |
| Chess | `chess` | `create`, `join`, `state`, `ready`, `start`, `move`, `rematch`, `leave` | `game_sessions.state/version` |
| Ludo | `ludo` | `create`, `join`, `state`, `ready`, `start`, `roll`, `move`, `rematch`, `leave` | `game_sessions.state/version` |

Edge Function URLs:

```text
https://<staging-project-ref>.supabase.co/functions/v1/onmuga
https://<staging-project-ref>.supabase.co/functions/v1/chess
https://<staging-project-ref>.supabase.co/functions/v1/ludo
```

## Required staging configuration

Use a separate Supabase project with the same migrations and Edge Function deployments as production.

The runner receives configuration only through environment variables:

```bash
STAGING_SUPABASE_URL=https://<staging-ref>.supabase.co
STAGING_SUPABASE_ANON_KEY=<staging-anon-key>
STAGING_SERVICE_ROLE_KEY=<staging-service-role-key>
STAGING_TEST_PASSWORD=<random-long-password>
STAGING_TEST_PREFIX=stg-load
STAGING_MAX_PLAYERS=4
STAGING_ACTIONS_PER_GAME=10
```

The service-role key is used only by the observer/cleanup client, never by simulated players. It must not be committed, logged, or sent to the browser.

## Test identities

Provision disposable users in staging before the run. Use one account per simulated player:

```text
stg-load-0001@example.invalid
stg-load-0002@example.invalid
...
```

Each user must have a matching `profiles` row with a deterministic display name. Provisioning options:

- Preferred: create users through the staging admin API before the run.
- Alternative: pre-create a fixed pool of staging accounts and sign in with password.

The test must verify that every player receives a valid access token through `signInWithPassword`. Anonymous Realtime Broadcast connections are not sufficient for this test.

## Isolation and cleanup

Every run has a unique identifier, for example:

```text
stg-load-20260927T152100Z-7f2c
```

The runner must tag disposable records through the room code prefix where supported and retain the returned `matchId`/session IDs. Cleanup runs in a `finally` block and verifies counts afterward:

1. Call the game function `leave` for each authenticated player.
2. Delete test `game_session_actions` by captured session IDs using the service-role observer.
3. Delete test `game_sessions` by captured session IDs.
4. Delete test `game_players` and `game_rooms` by captured room codes.
5. Delete disposable `profiles`/auth users only if the test provisioned them.
6. Assert zero remaining rows for all captured IDs.

Do not use an unrestricted `delete where created_at > ...` cleanup in a shared environment.

## Test phases

### Phase A — Authenticated connectivity

For each test identity:

- Sign in using the staging anon client.
- Record `user.id` and access token age.
- Verify the token can invoke the selected Edge Function.
- Open a Realtime channel with the authenticated client.
- Record sign-in, function invocation, and channel subscription latency.

Failure criteria:

- Any player cannot sign in.
- Any Edge Function returns `401` or `403`.
- Any authenticated Realtime channel fails to subscribe.

### Phase B — Room and lobby lifecycle

Run one complete lifecycle for each function family:

#### Chess

1. Player A calls `create`.
2. Player B calls `join` with the returned code.
3. Both call `ready` with `true`.
4. Player A calls `start`.
5. Observer verifies:
   - Exactly one `game_rooms` row.
   - Two `game_players` rows.
   - One `game_sessions` row.
   - Room status is `live`.
   - Session version advanced from `0` to `1`.
   - Session state is a valid initial chess state.

#### Ludo

1. Player A calls `create`.
2. Players B–D call `join` where four-player capacity is desired.
3. Every player calls `ready`.
4. Host calls `start`.
5. Observer verifies room, player, session, status, initial state, and version transitions.

#### Onmuga games

Run the same create/join lifecycle for at least one representative from each state shape:

- Board: `tictactoe`.
- Drawing: `draw`.
- Party: `werewolf` or `codenames`.

The test matrix should cover all supported `onmuga` games over repeated runs, but not necessarily all in one high-concurrency run.

### Phase C — Authoritative action and version checks

For every game under test:

1. Read the session row as observer: `(state_0, version_0)`.
2. Send one legal action through the authenticated Edge Function.
3. Read the session row again.
4. Assert:
   - `version_1 = version_0 + 1`.
   - `state_1` contains the legal action result.
   - The Edge Function response agrees with `state_1`.
   - Realtime delivered the changed session version to every subscribed player.
5. Send the same action twice with two clients using the same captured starting version.
6. Assert exactly one authoritative update succeeds and the stale update returns the expected conflict response (`Game changed; refresh and try again`, or the function-specific equivalent).
7. Assert the session version advanced exactly once for that pair.

Use valid deterministic actions:

- Chess: two legal opening moves from the initial board, sent concurrently from the correct players.
- Ludo: host/player roll once, then use the returned state to select a legal piece.
- Tic-Tac-Toe: two clients concurrently submit different cells from the same version.
- Connect Four: two clients concurrently submit different columns from the same version.
- Party game: two players submit valid options concurrently; verify only the accepted server state is reflected.
- Draw It Out: drawer submits a valid stroke; guesser submits a valid guess.

### Phase D — Realtime fan-out

Each authenticated client subscribes to:

```text
postgres_changes: public.game_sessions, id = <session-id>
postgres_changes: public.game_session_actions, session_id = <session-id>
```

For each accepted action, record:

- Function request start/end.
- Observer database commit timestamp.
- Realtime event receipt timestamp per player.
- Session version in the event.

Assertions:

- Every accepted session version is observed in monotonic order.
- No client receives a version lower than its last applied version.
- All subscribed players receive the final authoritative version within the staging SLA.
- Duplicate action-log records are not created when the same `action_id` is retried.

Suggested initial staging thresholds:

| Measure | Target | Hard failure |
|---|---:|---:|
| Authenticated function p95 | < 750 ms | > 2,000 ms |
| Session commit p95 | < 500 ms | > 1,500 ms |
| Realtime fan-out p95 | < 1,000 ms | > 3,000 ms |
| Version gaps | 0 | Any unexplained gap |
| Accepted-action duplication | 0 | Any duplicate state transition |
| Stale-action protection | 100% | Any double-commit |

### Phase E — Disconnect, rollback, and replay

This phase tests the browser adapter and the server together.

1. Start a live room with two authenticated browser/client instances.
2. Capture session state and version.
3. Disconnect Player B's Realtime channel and network transport.
4. Dispatch a legal mobile action optimistically.
5. Assert Player B immediately renders the optimistic state and persists one pending action in its local queue.
6. Reconnect Player B.
7. Reconcile from the authoritative session snapshot.
8. Replay the pending action using its original action executor and `base_version`.
9. If the action was not already committed, assert it commits once.
10. If another player committed a conflicting version, assert the pending action rolls back and the client adopts the authoritative server state.
11. Assert the pending queue is empty after either successful commit or explicit conflict discard.
12. Assert no duplicate `game_session_actions` record exists for a replayed `action_id`.

### Execute-hook replay contract

The `useSessionSync` adapter now supports an optional authoritative executor:

- Persists pending actions.
- Executes the action immediately when online and an executor is provided.
- Re-executes queued actions against the original Edge Function after reconnect.
- Applies returned authoritative state/version data.
- Discards a resolved conflict after adopting the refreshed authoritative state.
- Retains the action in the queue when the executor is unavailable or temporarily fails.
- Rolls back optimistic local state when the executor reports a failure and a rollback function is supplied.

Each game adapter should provide an executor such as:

```ts
useSessionSync({
  roomCode,
  game,
  actorId,
  execute: async (action) => callGameFunction(action.type, action.payload),
});
```

The staging runner should still mark “action-log replay” and “authoritative action replay” as separate checks. The authoritative replay check is now unblocked, but it remains a failure if a game surface does not supply its Edge Function executor.

## Runner result schema

Each run should emit JSON with this shape:

```json
{
  "runId": "stg-load-...",
  "environment": "staging",
  "players": 4,
  "games": ["chess", "ludo", "tictactoe"],
  "roomsCreated": 3,
  "actionsAttempted": 30,
  "actionsAccepted": 28,
  "staleActionsRejected": 2,
  "sessionVersionGaps": 0,
  "realtimeDeliveryRatio": 1,
  "duplicateTransitions": 0,
  "replay": {
    "actionLogReplay": "pass",
    "authoritativeActionReplay": "blocked_until_executor_hook"
  },
  "latencyMs": {
    "authP95": 0,
    "functionP95": 0,
    "sessionCommitP95": 0,
    "realtimeFanoutP95": 0
  },
  "cleanup": "pass",
  "pass": false
}
```

`pass` must be false when the executor hook is not enabled, even if transport and action-log tests pass.

## Safe execution order

1. Create or select a dedicated staging Supabase project.
2. Apply all repository migrations.
3. Deploy the three Edge Functions to staging.
4. Provision disposable test accounts.
5. Run one-player auth smoke test.
6. Run one room per function family.
7. Run conflict and Realtime assertions.
8. Implement and enable the action executor hook.
9. Run disconnect/replay tests.
10. Run concurrent multi-room load.
11. Verify cleanup.
12. Only then compare staging results with production-like thresholds.
