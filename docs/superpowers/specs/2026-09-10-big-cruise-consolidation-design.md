# BIG CRUISE〽️ Consolidation Design

**Status:** Draft for user review
**Date:** 2026-09-10

## Goal

Consolidate the useful parts of the Cruise Connect Hub work into `13fxiii/Big-Cruise-App` without importing unrelated architecture, while turning Big Cruise into a mobile-first, game-first PWA with email authentication and an app-wide weekly theme engine.

## Product Architecture

The canonical consumer application has four primary navigation destinations:

- Home
- Games 🎮
- Community
  - Weekly Themes
- Profile

There is no Admin destination and no consumer-facing Space destination.

The existing Big Cruise React/Vite/Supabase stack remains the foundation. Cruise Connect repositories are treated as source material: useful UI patterns, components, assets, flows, and ideas may be selectively ported; their separate application shells and backend stacks are not merged wholesale.

## Authentication

Supabase Auth is the single authentication system.

The consumer app uses email/password authentication with:

- Sign up
- Email verification
- Login
- Logout
- Password reset
- Persistent Supabase sessions

X OAuth is explicitly out of scope for authentication.

## Game-First Experience

Games are the highest-priority product surface. The architecture must allow games to be added independently without creating separate account systems.

Target game catalog:

- UNO
- Codenames
- Word Guesses
- Ludo
- Werewolf
- Chess
- Draw It Out
- Karaoke
- Truth or Dare
- Kahoot

Existing UNO multiplayer infrastructure is preserved and treated as the first verified game experience. The README currently documents authenticated Supabase Edge Function handling and server-side room persistence for UNO.

## Weekly Theme Engine

Weekly Themes live under Community, but the selected weekly theme is an app-wide runtime design input.

Flow:

`Weekly Theme → Theme Engine → Design Tokens → UI Components → Games + Home + Community + Profile`

A theme can change:

- Color palette
- Background treatments
- UI accents
- In-app icons
- Buttons
- Cards
- Selected/active states
- Game UI accents
- Micro-interactions
- Decorative elements

The permanent BIG CRUISE identity remains recognizable underneath every theme: Danfo/Lagos commercial-bus-inspired midnight black and yellow, the approved official logo, typography, and brand personality. Theme palettes must not force the entire app into one black/yellow or gold treatment.

Initial weekly collections:

- DOMINION STATE — “Power is quiet. Power is earned”
- NO FILTER ENERGY
- SHE MOVES DIFFERENT
- ECHO ERA
- PLAY YOUR VIBE
- READ BETWEEN THE LINES
- CHAOS CULTURE

## PWA / Mobile Requirements

The app is a mobile-first PWA for iOS and Android.

Priorities:

- iPhone Safari compatibility
- Android Chrome compatibility
- Install-to-home-screen support
- Touch-first controls
- Safe-area handling
- Responsive layouts
- Fast startup and low-bandwidth behavior
- Offline-capable application shell where practical
- App-like navigation
- Mobile game performance

Desktop support is secondary and must not dictate the mobile interaction model.

## Merch

Merch remains a product area after the core game/community experience is stable. Merch graphics should be simple, mature, streetwear-oriented, print-ready, transparent-background assets based closely on the approved references. Avoid childish/cartoonish styling and avoid gold/metallic-gold branding.

## Cruise Connect Consolidation Rules

Do not merge all Cruise Connect repositories as independent applications.

Instead:

1. Audit each Cruise Connect repository.
2. Classify useful code/assets as Keep, Port, Rewrite, or Delete.
3. Port only reusable functionality that fits the Big Cruise architecture.
4. Replace Cruise Connect branding with BIG CRUISE〽️ where an asset/flow is retained.
5. Do not introduce a second authentication system, separate game accounts, or a competing backend architecture.
6. Keep administrative/management tooling outside the consumer PWA; do not expose an Admin feature in the app.

## Proposed Code Boundaries

The implementation should converge toward focused boundaries such as:

- `src/components/` — shared UI primitives and app shell
- `src/pages/` — Home, Games, Community, Profile, Auth
- `src/features/games/` — game-specific modules and shared game contracts
- `src/features/community/` — community and weekly theme presentation
- `src/features/themes/` — theme definitions, resolver, provider, and design tokens
- `src/features/auth/` — Supabase auth UI and session handling
- `src/features/merch/` — merch presentation and future commerce integration
- `src/lib/` — Supabase client and shared utilities
- `public/` — PWA/brand assets

Exact paths should follow the existing repository structure after audit rather than forcing unnecessary restructuring.

## Non-Goals

- X OAuth authentication
- A consumer Admin tab
- A separate Space feature
- Merging Cruise Connect's backend stack wholesale
- Replacing Supabase with another backend
- Building every listed game before the first game is stable
- Making desktop the primary UX
- Rebranding BIG CRUISE into Cruise Connect
- Using gold/metallic-gold as the permanent brand palette

## Success Criteria

The consolidation is successful when:

1. One Big Cruise PWA is the canonical consumer application.
2. Email/Supabase authentication is the only login system.
3. Navigation matches Home, Games, Community, Profile, with Weekly Themes nested in Community.
4. The selected weekly theme can change app-wide UI colors and icons through centralized tokens rather than scattered conditionals.
5. Games share the authenticated Big Cruise session and common game infrastructure.
6. No Admin feature appears in the consumer navigation or UI.
7. The PWA is usable on current iOS Safari and Android Chrome layouts.
8. Useful Cruise Connect functionality/assets are selectively retained without importing unnecessary dependency/backend complexity.
9. Existing UNO multiplayer security and server-side persistence remain intact while new game work is layered on top.
10. Builds and tests pass before each production deployment.
