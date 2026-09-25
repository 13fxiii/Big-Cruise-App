# BIG CRUISE〽️ — Remaining Features

This list separates **implemented foundations** from work that still needs a production pass. It avoids presenting placeholders as finished functionality.

## Highest-priority product gaps

- **Strategy-game multiplayer:** Othello, Gomoku, Mancala and Word Hunt currently have solo Cruise Bot surfaces; they need authenticated room state, user join/reconnect behavior, server-validated moves and rematch handling.
- **Complete realtime coverage:** TTT, Connect Four, Draw It Out, UNO, party games and Kahoot have room flows, but each needs device-to-device acceptance testing on real mobile networks.
- **Public matchmaking:** The room system supports public/private intent, but a full queue, cancellation, timeout and matchmaking presence layer remains to be built.
- **Game result persistence:** Match history, wins, bot difficulty, streaks and player ratings need durable profile-linked storage.
- **Rankings:** Rankings screens are currently product surfaces; daily/weekly/all-time aggregation and anti-cheat scoring remain.

## Music and artiste platform

- **Spotify data sync:** The app uses the official playlist embed and public track metadata. Live stream-count ranking requires an approved Spotify API integration and user authorization; public playlist pages do not expose those private totals.
- **Booking backend:** Book Me currently prepares a local booking request state. It still needs a database table, notification destination, admin review queue, availability calendar and confirmation workflow.
- **Artiste verification:** Add verified profiles, media kits, genres, rates, location and availability.
- **Music player controls:** Add queue, favourites, recent plays and consent-aware analytics around the Spotify embed.

## Member identity and community

- **Profile persistence:** Connect Playzone rank, community rank, engagement metrics, avatar and achievements to real profile tables.
- **Cruise-ID live QR destination:** Replace the demo/statistics destination with an authenticated member profile route and permission-aware public view.
- **Community feed:** Posts, reactions, comments, moderation tools, reporting and notification preferences remain.
- **Presence and messaging:** Add online state, friend/follow relationships, direct messages and room invites.

## Platform hardening

- **Security:** Complete RLS review, rate limits, abuse prevention, bot/room flood controls, dependency alerts and audit logging.
- **Network resilience:** Add offline banners, reconnect backoff, stale-state messaging, room expiry and conflict resolution for all game rooms.
- **Performance:** Compress the current multi-megabyte artwork pack, lazy-load game art by route, split the large JavaScript bundle and measure Core Web Vitals on low-end phones.
- **Accessibility:** Add screen-reader descriptions for board state, keyboard alternatives, reduced-motion review and contrast checks across all day themes.
- **QA:** Add automated mobile browser coverage for all 16 catalogue entries, real two-device room tests and visual regression snapshots for the seven themes.

## Commerce and operations

- **Merch operations:** Inventory, order fulfilment, refunds, delivery status and admin tools need production workflows. Merch remains outside the current seven-day scope.
- **Payments:** Add payment failure recovery, webhook reconciliation, customer receipts and operations dashboards.
- **Analytics:** Product analytics, game funnel metrics, playlist clicks, booking conversions and privacy controls remain.
