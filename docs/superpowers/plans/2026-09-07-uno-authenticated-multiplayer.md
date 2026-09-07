# BIG CRUISE〽️ UNO Authenticated Multiplayer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build production-ready UNO directly in the canonical BIG CRUISE〽️ app, reusing the app's single Supabase authentication session instead of creating game-specific authentication.

**Architecture:** Supabase Auth owns identity and session state. UNO consumes the authenticated identity, maps it to the BIG CRUISE profile, and uses server-authoritative game intents with versioned Supabase Postgres persistence. The client receives only the public room state plus the authenticated player's private hand.

**Tech Stack:** React/TypeScript application, Supabase Auth, Supabase Postgres, server-side game handlers, CSS/Tailwind-style UI as established by the eventual app scaffold, Node test runner where available.

**Spec:** `docs/superpowers/specs/2026-09-07-uno-authenticated-multiplayer-design.md`

## Global Constraints

- One BIG CRUISE〽️ authentication session is shared across the app and games.
- No game-specific login, password, or account model.
- No browser-side Supabase service-role credentials.
- Server derives player identity from the authenticated session/token.
- Player hands are private.
- Mutations are server-authoritative and version checked.
- BIG CRUISE〽️ visual palette is Midnight Black and Yellow; no gold/metallic treatment.
- Ludo is explicitly out of scope until UNO is shipped and verified.

---

### Task 1: Establish the canonical app scaffold and authentication boundary

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `src/lib/auth/types.ts`
- Create: `src/lib/auth/server.ts`
- Create: `src/lib/auth/client.ts`
- Create: `src/lib/profile/profile.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/app/page.tsx`
- Test: `src/lib/auth/auth.test.ts`

**Interfaces:**
- `getAuthenticatedUser(requestOrHeaders): Promise<{ id: string; email?: string } | null>` derives identity from the current Supabase session.
- `requireAuthenticatedUser(...): Promise<{ id: string; email?: string }>` rejects unauthenticated requests.
- `getOrCreateProfile(userId): Promise<{ id: string; displayName: string; avatarUrl?: string }>` is the app-profile boundary consumed by games.

- [ ] **Step 1: Write failing authentication tests** covering unauthenticated access, authenticated identity, and the rule that client-supplied IDs cannot replace the session identity.
- [ ] **Step 2: Run the auth tests and verify the expected failures.**
- [ ] **Step 3: Implement the minimal Supabase auth adapter and profile boundary using environment-based Supabase configuration.**
- [ ] **Step 4: Add the login route that creates/continues the single app session; do not add a UNO login.**
- [ ] **Step 5: Run auth tests again and verify they pass.**
- [ ] **Step 6: Commit with `feat: establish shared app authentication boundary`.**

### Task 2: Build the pure UNO rules engine

**Files:**
- Create: `src/lib/games/uno/types.ts`
- Create: `src/lib/games/uno/rules.ts`
- Create: `src/lib/games/uno/deck.ts`
- Create: `src/lib/games/uno/state.ts`
- Test: `src/lib/games/uno/rules.test.ts`

**Interfaces:**
- `createDeck(): UnoCard[]`
- `createGame(playerIds: string[]): UnoState`
- `getLegalPlays(state, playerId): UnoCard[]`
- `playCard(state, playerId, cardId, chosenColor?): UnoState`
- `drawCard(state, playerId): UnoState`
- `callUno(state, playerId): UnoState`
- `canPlayCard(card, topCard, currentColor): boolean`

- [ ] **Step 1: Write failing tests for deck composition, turn order, legal/illegal plays, draw, action cards, wild colors, UNO call, and win detection.**
- [ ] **Step 2: Run the focused rules tests and verify failures.**
- [ ] **Step 3: Implement the smallest deterministic rules engine satisfying the tests.**
- [ ] **Step 4: Run the focused tests and verify all rule cases pass.**
- [ ] **Step 5: Commit with `feat: add deterministic UNO rules engine`.**

### Task 3: Add Supabase UNO persistence and concurrency control

**Files:**
- Create: `migrations/0001_uno_rooms.sql`
- Create: `migrations/0002_uno_room_players.sql`
- Create: `migrations/0003_uno_room_snapshots.sql`
- Create: `src/lib/games/uno/persistence.ts`
- Test: `src/lib/games/uno/persistence.test.ts`

**Interfaces:**
- `createUnoRoom(ownerId): Promise<UnoRoomRecord>`
- `joinUnoRoom(roomCode, userId): Promise<UnoRoomRecord>`
- `loadUnoRoom(roomId): Promise<UnoRoomRecord>`
- `saveUnoSnapshot(roomId, expectedVersion, state): Promise<UnoRoomRecord>`
- `getPlayerRoom(roomId, userId): Promise<UnoPlayerRecord>`

- [ ] **Step 1: Write failing persistence tests for room membership limits, unique room codes, private player membership, and stale-version rejection.**
- [ ] **Step 2: Run the persistence tests and verify failures.**
- [ ] **Step 3: Implement migrations with RLS/server-only boundaries and an integer/UUID version guard for snapshots.**
- [ ] **Step 4: Implement persistence functions so stale writes fail instead of overwriting newer state.**
- [ ] **Step 5: Run persistence tests and verify they pass against the configured test database or deterministic mock boundary.**
- [ ] **Step 6: Commit with `feat: persist UNO rooms with versioned snapshots`.**

### Task 4: Implement authoritative UNO server intents

**Files:**
- Create: `src/lib/games/uno/server.ts`
- Create: `src/lib/games/uno/public-state.ts`
- Test: `src/lib/games/uno/server.test.ts`

**Interfaces:**
- `createRoom(request): Promise<PublicUnoState>`
- `joinRoom(request, roomCode): Promise<PublicUnoState>`
- `handleUnoIntent(request, intent): Promise<PublicUnoState>`
- `publicUnoState(state, playerId): PublicUnoState`

Supported intents: `join`, `leave`, `ready`, `start`, `play`, `draw`, `call_uno`, `rematch`.

- [ ] **Step 1: Write failing tests for authenticated identity enforcement, membership checks, turn checks, card ownership, legal-play validation, and private-hand filtering.**
- [ ] **Step 2: Run the server tests and verify failures.**
- [ ] **Step 3: Implement server intent handling by resolving the current app session and ignoring forged client user IDs.**
- [ ] **Step 4: Implement public-state projection so opponents cannot receive another player's hand.**
- [ ] **Step 5: Add optimistic version retry/failure behavior for concurrent writes.**
- [ ] **Step 6: Run server tests and verify they pass.**
- [ ] **Step 7: Commit with `feat: add authoritative UNO server intents`.**

### Task 5: Build the UNO lobby and game UI

**Files:**
- Create: `src/app/games/uno/page.tsx`
- Create: `src/components/games/uno/UnoLobby.tsx`
- Create: `src/components/games/uno/UnoBoard.tsx`
- Create: `src/components/games/uno/UnoCard.tsx`
- Create: `src/components/games/uno/PlayerSeat.tsx`
- Create: `src/components/games/uno/WildColorPicker.tsx`
- Create: `src/components/games/uno/UnoMotion.css`

**Interfaces:**
- UI consumes `PublicUnoState` only.
- UI sends server intents; it never mutates authoritative game state locally.

- [ ] **Step 1: Build the lobby with create-room and room-code join controls.**
- [ ] **Step 2: Build the board, player seats, hand, discard pile, draw pile, turn state, and action controls.**
- [ ] **Step 3: Add responsive motion for card draw/play, turn changes, UNO call, and win/rematch states.**
- [ ] **Step 4: Apply BIG CRUISE〽️ Midnight Black + Yellow styling without gold/metallic effects.**
- [ ] **Step 5: Verify the signed-out route sends users to the shared login rather than a game login.**
- [ ] **Step 6: Commit with `feat: build BIG CRUISE UNO multiplayer UI`.**

### Task 6: Reconnect, polling/realtime transport, and failure UX

**Files:**
- Create: `src/lib/games/uno/client.ts`
- Create: `src/lib/games/uno/transport.ts`
- Modify: `src/components/games/uno/UnoBoard.tsx`
- Test: `src/lib/games/uno/client.test.ts`

- [ ] **Step 1: Write failing tests for reconnect, duplicate intent, stale state, and server error handling.**
- [ ] **Step 2: Implement authenticated transport using the existing app session.**
- [ ] **Step 3: Add polling or Supabase realtime only for receiving fresh public snapshots; keep all mutations server-authoritative.**
- [ ] **Step 4: Restore the player's room after refresh when membership still exists.**
- [ ] **Step 5: Run client/transport tests and verify they pass.**
- [ ] **Step 6: Commit with `feat: add resilient UNO multiplayer transport`.**

### Task 7: Security and database hardening

**Files:**
- Modify: `migrations/0001_uno_rooms.sql`
- Modify: `migrations/0002_uno_room_players.sql`
- Modify: `migrations/0003_uno_room_snapshots.sql`
- Create: `docs/UNO-SECURITY.md`

- [ ] **Step 1: Verify no client bundle imports service-role credentials or server-only persistence modules.**
- [ ] **Step 2: Verify RLS denies unauthorized direct access to private game data.**
- [ ] **Step 3: Verify every server mutation derives identity from the app session.**
- [ ] **Step 4: Document the trust boundary and production environment variables without committing secrets.**
- [ ] **Step 5: Commit with `security: harden UNO multiplayer boundaries`.**

### Task 8: End-to-end verification and production deployment

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Create: `docs/UNO-OPERATIONS.md`

- [ ] **Step 1: Run the complete unit/integration test suite.**
- [ ] **Step 2: Run TypeScript/build verification.**
- [ ] **Step 3: Deploy the canonical app to the existing Vercel project with the existing Supabase environment configuration.**
- [ ] **Step 4: Smoke-test signed-out → login → Games → UNO → create room.**
- [ ] **Step 5: Smoke-test two authenticated users joining the same room and completing a real match.**
- [ ] **Step 6: Verify refresh/reconnect and rematch.**
- [ ] **Step 7: Verify production logs for runtime/database errors.**
- [ ] **Step 8: Only after fresh verification, record UNO as shipped and leave Ludo untouched.**
- [ ] **Step 9: Commit with `chore: verify UNO production release`.**
