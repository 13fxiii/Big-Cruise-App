# BIG CRUISE〽️ UNO Authenticated Multiplayer Design

## Goal
Build a clean UNO game directly in the canonical `CRUISE-CONNECT-HUB/Big-Cruise-App` repository, using the BIG CRUISE Supabase login session as the single identity layer for the app and all games.

## Architecture
The app owns authentication. Supabase Auth creates the session; the game never creates its own account or password. UNO resolves the currently authenticated Supabase user on the server, maps that user to the BIG CRUISE profile, and uses that stable identity for room membership and game actions.

The UNO rules engine is pure and server-authoritative. Persistent multiplayer state lives in Supabase Postgres. Clients send intents, never authoritative state. Every mutating action verifies the authenticated user, room membership, turn, card ownership, and legal move before committing a new versioned snapshot.

## Scope
- App-level Supabase authentication/session provider.
- BIG CRUISE profile lookup/creation boundary.
- UNO room creation and join-by-code.
- 2–4 player multiplayer.
- Full standard UNO core rules: number cards, Skip, Reverse, Draw Two, Wild, Wild Draw Four, color selection, UNO call, win/rematch.
- Server-authoritative state and versioning.
- Private hands in server responses.
- Reconnect/rejoin support.
- Mobile-first BIG CRUISE〽️ UI using Midnight Black and Yellow; no gold/metallic treatment.
- Card/turn/draw/play motion.
- Unit and integration tests.
- Production deployment/configuration documentation.

## Non-goals
- Separate game authentication.
- Ludo implementation.
- X/Twitter OAuth.
- Spaces/live-audio functionality.
- Fake/demo merchandise data.

## Security requirements
1. No browser code receives a Supabase service-role key.
2. UNO server handlers derive identity from the authenticated Supabase session/token, never from a client-supplied user ID alone.
3. Player hands are filtered per authenticated player.
4. Room state writes are version-checked to prevent stale overwrites.
5. Room membership and action authorization are validated server-side.
6. Database tables used by the game are protected by appropriate RLS/server-only access boundaries.

## UX requirements
1. A signed-in BIG CRUISE user opens Games → UNO without another login.
2. If signed out, the app routes to the existing login surface.
3. The lobby supports create room and join room code.
4. Players see recognizable BIG CRUISE profile identity in seats.
5. The active player is obvious; legal playable cards are visually emphasized.
6. Draw, play, UNO, wild-color selection, win, and rematch have clear motion/feedback.
7. Refresh/reconnect restores the player's room state when possible.

## Success criteria
- An authenticated app user can enter UNO without re-authentication.
- Two or more authenticated users can join the same room and complete a real match.
- Illegal client intents are rejected server-side.
- A player's private hand is not exposed to other players.
- Concurrent/stale writes do not silently replace newer game state.
- Tests cover the rules engine and authoritative room behavior.
- The deployed app builds and the authenticated UNO flow is smoke-tested before claiming completion.
