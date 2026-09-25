# BIG CRUISE〽️ — Next Game Sprint Plan

Date: 2026-09-25

## QA finding that changes the plan

The live mobile preview was tested at **390×844**.

- Games catalogue loaded successfully.
- Tic-Tac-Toe entry loaded successfully.
- Solo Cruise Bot mode loaded successfully.
- A mobile tap placed an `X`; the Cruise Bot answered with `O`.
- Preview correctly rejected a multiplayer room creation attempt because it is read-only and unauthenticated.
- The current Onmuga multiplayer client uses HTTP `POST` calls plus a `setInterval(..., 1400)` state poll. It is **not websocket sync** and does not yet use a Supabase Realtime channel for these games.

A real two-user multiplayer test requires two authenticated browser sessions or two physical devices with separate BIG CRUISE accounts. Do not create fake accounts or treat preview mode as multiplayer evidence.

## Current catalogue gaps

The source branch still marks these games as coming soon:

1. Werewolf
2. Codenames
3. Word Guess
4. Karaoke
5. Truth or Dare
6. Kahoot

The live deployment has additional game-card work beyond the local branch, so the catalogue should be reconciled before the next release. A card labeled **PLAY NOW** must have a real `ENTER → PLAY → COMPLETE → RESULT → EXIT/REMATCH` path, or it must be labeled honestly as coming soon.

## Sprint priority

### P0 — Replace polling with genuine realtime game transport

**Scope:** Tic-Tac-Toe, Connect Four, Draw It Out, then Chess/Ludo/UNO where needed.

- Add a Supabase Realtime channel or a single shared server event layer for session updates.
- Keep server-authoritative mutation validation.
- Broadcast committed `game_sessions` version changes.
- Subscribe on room entry; unsubscribe on exit/unmount.
- Hydrate state after refresh/reconnect.
- Detect version gaps and refetch authoritative state.
- Add presence/leave handling.
- Test with two authenticated sessions.

**Acceptance gate:** a move made in Session A appears in Session B without waiting for a timer poll, with no stale or duplicated state after reconnect.

### P0 — Complete Draw It Out multiplayer integrity

- Realtime stroke broadcast instead of polling for drawing data.
- Drawer-only stroke authorization on the server.
- Secret word redaction for every non-drawer response.
- Host-controlled or server-validated round rotation.
- Timer and round completion state.
- Duplicate winning guesses must resolve to one winner.
- Mobile canvas pointer capture and resize verification.

### P1 — Build Werewolf as the next full game

Why next: it has high social value and reuses the room, player, hidden-state, voting, result, and reconnect patterns.

Required P0 gameplay:

- Lobby and ready state
- Server-assigned private roles
- Night/day phase state machine
- Werewolf kill choice
- Detective/doctor abilities
- Day discussion state
- Vote and elimination
- Win-condition evaluation
- Private role/action projections
- Result and rematch

Do not show hidden roles or night actions in public session state.

### P1 — Connect game results to platform systems

For every completed game:

- `game_results`
- `game_matches`
- `game_stats`
- BIG CRUISE ID/profile
- Challenges
- Rewards
- Leaderboards

Use one shared result writer. Do not create per-game duplicate stats tables.

### P2 — Build Codenames

- Team assignment
- Spymaster-only board projection
- Clue submission
- Team guesses
- Assassin card
- Turn progression
- Win/loss result
- Rematch

### P2 — Build Word Guess

- Server-selected protected word
- Attempt validation
- Hint/letter state
- Timer
- Scoring
- Completion/result/rematch

### P3 — Build casual/social surfaces

1. Truth or Dare
2. Karaoke
3. Kahoot

These should only be promoted from coming soon after their result, persistence, moderation, and reconnect paths are real.

## Quality gate for the next sprint

- Two authenticated sessions
- Mobile portrait viewport
- Create room
- Join room
- Ready/start
- Valid action sync
- Invalid action rejected server-side
- Refresh recovery
- Disconnect/reconnect
- Match completion
- Result persisted
- Rematch
- Exit
- No hidden state leakage
- No card labeled PLAY NOW without a real playable flow
