# BIG CRUISE〽️ Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `13fxiii/Big-Cruise-App` into the canonical BIG CRUISE〽️ mobile-first, game-first PWA while selectively harvesting useful Cruise Connect work, preserving UNO multiplayer security, adding email/Supabase auth, and making Weekly Themes an app-wide runtime design system.

**Architecture:** Keep React 19 + Vite + TypeScript + Supabase as the foundation. Refactor the current monolithic `src/main.tsx` only where needed into focused app, auth, theme, community, games, and merch boundaries; preserve existing UNO Edge Function contracts and server-side persistence. Cruise Connect repositories are audited as source material and only compatible UI/assets/flows are ported.

**Tech Stack:** React 19, TypeScript, Vite 7, Supabase Auth/Postgres/Edge Functions, CSS, Vercel, browser PWA APIs. Add dependencies only when a concrete requirement cannot be met cleanly with the existing stack.

**Spec:** `docs/superpowers/specs/2026-09-10-big-cruise-consolidation-design.md`

## Global Constraints

- One canonical consumer app: `13fxiii/Big-Cruise-App`.
- Navigation is exactly Home, Games 🎮, Community, Profile; Weekly Themes is nested under Community.
- No consumer Admin destination and no separate Space destination.
- Supabase Auth is the only authentication system; use email/password, verification, login, logout, reset, and persistent sessions.
- X OAuth is out of scope.
- Games are the highest-priority product surface; UNO is the first verified multiplayer game.
- Existing UNO server-side validation, private-hand protection, room persistence, and authenticated Edge Function flow must remain intact.
- Weekly Themes are app-wide runtime design input: theme → tokens → shared UI → Home/Games/Community/Profile.
- Permanent BIG CRUISE identity remains Danfo/Lagos commercial-bus-inspired midnight black/yellow, approved official logo, typography, and personality; do not turn every theme into black/yellow or gold.
- Initial themes are DOMINION STATE, NO FILTER ENERGY, SHE MOVES DIFFERENT, ECHO ERA, PLAY YOUR VIBE, READ BETWEEN THE LINES, and CHAOS CULTURE.
- PWA is mobile-first for iPhone Safari and Android Chrome with touch controls, safe areas, responsive layouts, install support, fast startup, low-bandwidth behavior, and offline shell where practical.
- Desktop is secondary and must not dictate the interaction model.
- Merch follows core game/community stabilization and uses simple mature streetwear-oriented transparent-background graphics; no childish/cartoonish styling and no gold/metallic-gold branding.
- Do not wholesale-merge Cruise Connect backend stacks, introduce separate game accounts, or replace Supabase.
- Run tests and a production build before claiming a milestone is complete.

---

### Task 1: Audit the current Big Cruise app and Cruise Connect source repositories

**Files:**
- Read: `src/main.tsx`
- Read: `src/styles.css`
- Read: `src/lib/theme.ts`
- Read: `src/lib/theme.test.ts`
- Read: `src/lib/theme-css.test.ts`
- Read: `src/lib/cruise/catalog.ts`
- Read: `src/lib/cruise/store.ts`
- Read: `src/lib/cruise/payments.ts`
- Read: `src/lib/games/uno/`
- Read: `README.md`
- Read: `package.json`
- Read: `vercel.json`
- Read: `migrations/`
- Read: `CRUISE-CONNECT-HUB/cruise-connect-hub-uz`
- Read: `CRUISE-CONNECT-HUB/replit-cruise-connect-hub`
- Read: `CRUISE-CONNECT-HUB/cruise.connect.hub`
- Read: `CRUISE-CONNECT-HUB/cruise-connect-hub`
- Create: `docs/superpowers/audits/2026-09-10-cruise-connect-consolidation-audit.md`

**Interfaces:**
- Produces: a Keep/Port/Rewrite/Delete inventory that later tasks use to decide what enters Big Cruise.

- [ ] **Step 1: Inventory the Big Cruise tree and identify all current runtime surfaces.**
  Record the current entrypoint, styling, theme system, catalog/store/payment helpers, UNO modules, migrations, deployment config, and test entrypoints.

- [ ] **Step 2: Audit `cruise-connect-hub-uz` for reusable UI, flows, assets, and product behavior.**
  Do not import its Next.js/Radix application shell merely because it exists.

- [ ] **Step 3: Audit `replit-cruise-connect-hub` and record it as empty or otherwise non-source material if no usable implementation is present.**

- [ ] **Step 4: Audit `cruise.connect.hub` for reusable concepts while explicitly excluding its Vite/Express/tRPC/Drizzle/MySQL/S3/JWT backend architecture from wholesale import.**

- [ ] **Step 5: Audit `cruise-connect-hub` for reusable UI/components/assets/flows and exclude unrelated application infrastructure.**

- [ ] **Step 6: Write `docs/superpowers/audits/2026-09-10-cruise-connect-consolidation-audit.md` using four decisions for every candidate: Keep, Port, Rewrite, Delete.**
  Each entry must name the source repository/path, destination area, reason, dependency impact, and whether branding/assets need adaptation.

- [ ] **Step 7: Run the existing test command and production build before modifying application code.**
  Run: `npm test`
  Expected: existing tests pass or the audit records the exact baseline failures.
  Run: `npm run build`
  Expected: production build succeeds or the audit records the exact baseline failure.

- [ ] **Step 8: Commit the audit.**
  Commit message: `docs: audit Cruise Connect sources for consolidation`

---

### Task 2: Establish the app shell and navigation boundaries

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/styles.css`
- Create: `src/app/App.tsx`
- Create: `src/app/navigation.ts`
- Create: `src/pages/HomePage.tsx`
- Create: `src/pages/GamesPage.tsx`
- Create: `src/pages/CommunityPage.tsx`
- Create: `src/pages/ProfilePage.tsx`
- Create: `src/pages/AuthPage.tsx`
- Test: `src/app/navigation.test.ts`

**Interfaces:**
- `navigation.ts` exports `type AppRoute = 'home' | 'games' | 'community' | 'profile' | 'auth'` and navigation metadata.
- `App.tsx` consumes the route/session/theme providers and renders one of the four consumer destinations or Auth.

- [ ] **Step 1: Write failing navigation tests for the five internal routes and assert that Admin and Space are not valid consumer routes.**
- [ ] **Step 2: Run the navigation test and confirm it fails because the new route contract does not exist.**
- [ ] **Step 3: Implement the route contract and app shell using the existing Vite entrypoint.**
- [ ] **Step 4: Move Home, Games, Community, and Profile presentation out of the monolithic entrypoint without changing UNO behavior yet.**
- [ ] **Step 5: Replace current top-level `rankings` and `merch` navigation destinations with their intended placement: rankings become a Community section and merch is presented only as a later product surface, not a fifth primary tab.**
- [ ] **Step 6: Run the focused navigation tests and `npm run build`.**
- [ ] **Step 7: Commit: `refactor: establish Big Cruise app shell and navigation`.**

---

### Task 3: Build the Supabase email authentication flow

**Files:**
- Modify: `src/lib/supabase.ts`
- Create: `src/features/auth/auth.ts`
- Create: `src/features/auth/AuthProvider.tsx`
- Create: `src/features/auth/AuthPage.tsx`
- Create: `src/features/auth/auth.test.ts`
- Modify: `src/app/App.tsx`
- Modify: `.env.example`
- Test: `src/features/auth/auth.test.ts`

**Interfaces:**
- `auth.ts` exports `signUp(email, password)`, `signIn(email, password)`, `signOut()`, `sendPasswordReset(email)`, and `getSession()` wrappers around the single Supabase client.
- `AuthProvider` exposes `{ user, session, loading, signOut }` and subscribes to `supabase.auth.onAuthStateChange`.

- [ ] **Step 1: Write failing tests for auth input validation and wrapper behavior using mocked Supabase calls.**
- [ ] **Step 2: Run the focused auth test and verify failure.**
- [ ] **Step 3: Implement the auth wrappers with email/password only.**
- [ ] **Step 4: Implement `AuthProvider` so refresh restores the Supabase session and auth state changes propagate to the app shell.**
- [ ] **Step 5: Implement signup, verification messaging, login, logout, and password-reset UI with mobile-safe controls.**
- [ ] **Step 6: Ensure no X OAuth control or X OAuth code path remains in the consumer auth UI.**
- [ ] **Step 7: Run focused tests and `npm run build`.**
- [ ] **Step 8: Commit: `feat: add Supabase email authentication`.**

---

### Task 4: Convert Weekly Themes into the app-wide runtime theme engine

**Files:**
- Modify: `src/lib/theme.ts`
- Modify: `src/styles.css`
- Modify: `src/lib/theme.test.ts`
- Modify: `src/lib/theme-css.test.ts`
- Create: `src/features/themes/theme-types.ts`
- Create: `src/features/themes/theme-provider.tsx`
- Create: `src/features/themes/theme-resolver.ts`
- Create: `src/features/themes/themes.ts`
- Create: `src/features/themes/theme-engine.test.ts`
- Modify: `src/app/App.tsx`

**Interfaces:**
- `ThemeDefinition` contains stable theme id, display name, short label, icon, palette tokens, surface/background tokens, accent tokens, and feature metadata.
- `resolveWeeklyTheme(date: Date): ThemeDefinition` returns the active weekly theme deterministically.
- `ThemeProvider` exposes the active `ThemeDefinition` and applies CSS variables to the app root.

- [ ] **Step 1: Write failing tests asserting all seven initial theme IDs exist, resolve deterministically, and expose required token groups.**
- [ ] **Step 2: Run the theme tests and verify failure.**
- [ ] **Step 3: Implement the seven theme definitions and resolver while retaining the permanent BIG CRUISE black/yellow identity as base tokens.**
- [ ] **Step 4: Implement `ThemeProvider` and CSS-variable application so components consume semantic tokens instead of checking theme names in JSX.**
- [ ] **Step 5: Replace scattered hard-coded theme-dependent styles in the shared shell and UNO surface with semantic variables.**
- [ ] **Step 6: Add tests proving switching themes changes token values without changing the navigation contract or game state contract.**
- [ ] **Step 7: Run all theme tests and `npm run build`.**
- [ ] **Step 8: Commit: `feat: make weekly themes app-wide runtime design tokens`.**

---

### Task 5: Move Community and Weekly Themes into the correct product hierarchy

**Files:**
- Create: `src/features/community/WeeklyThemes.tsx`
- Create: `src/features/community/community-model.ts`
- Create: `src/features/community/community-model.test.ts`
- Modify: `src/pages/CommunityPage.tsx`
- Modify: `src/features/themes/themes.ts`
- Modify: `src/styles.css`

**Interfaces:**
- `community-model.ts` exports the weekly collection metadata and `getWeeklyCollections()`.
- `WeeklyThemes` consumes the theme provider and displays the seven collections under Community.

- [ ] **Step 1: Write failing tests asserting the seven collections and their exact names/taglines.**
- [ ] **Step 2: Implement the community model and Weekly Themes presentation.**
- [ ] **Step 3: Show the active theme plus the remaining collections without exposing an Admin editing surface.**
- [ ] **Step 4: Verify theme selection is a presentation of the same runtime theme state rather than a second theme system.**
- [ ] **Step 5: Run focused tests and build.**
- [ ] **Step 6: Commit: `feat: add Community weekly themes surface`.**

---

### Task 6: Isolate the game architecture and preserve UNO multiplayer

**Files:**
- Modify: `src/lib/cruise/catalog.ts`
- Modify: `src/lib/cruise/catalog.test.ts`
- Create: `src/features/games/types.ts`
- Create: `src/features/games/game-registry.ts`
- Create: `src/features/games/game-registry.test.ts`
- Create: `src/features/games/uno/UnoGame.tsx`
- Move/retain: existing `src/lib/games/uno/*`
- Modify: `src/pages/GamesPage.tsx`
- Modify: `README.md`

**Interfaces:**
- `GameDefinition` contains `id`, `name`, `status`, `icon`, `accent`, and a renderer/entry identifier.
- `GameRegistry` returns all ten target games and identifies UNO as the only initially playable game unless another engine already exists and passes verification.
- UNO continues to call the existing authenticated Edge Function endpoint and uses the existing response/session/rules/view-model helpers.

- [ ] **Step 1: Write failing registry tests asserting exactly the ten target game IDs and UNO as the first playable game.**
- [ ] **Step 2: Run the registry tests and verify failure.**
- [ ] **Step 3: Implement the shared game contract and registry without adding separate game accounts or backend clients.**
- [ ] **Step 4: Move the UNO presentation into its game feature boundary while keeping `extractUnoState`, session persistence, rules, view-model, and Edge Function request flow intact.**
- [ ] **Step 5: Add an explicit integration test around the UNO client request contract so authenticated bearer tokens are still sent and private state is not rendered from opponent payloads.**
- [ ] **Step 6: Verify existing UNO tests and any available Supabase migration/function checks before changing the UNO backend.**
- [ ] **Step 7: Run focused tests and build.**
- [ ] **Step 8: Commit: `refactor: isolate game registry and preserve UNO multiplayer`.**

---

### Task 7: Port only approved Cruise Connect UI/assets/flows

**Files:**
- Modify/Create: only paths named Keep/Port/Rewrite in `docs/superpowers/audits/2026-09-10-cruise-connect-consolidation-audit.md`
- Modify: affected Big Cruise feature/page files
- Modify: `src/styles.css` or add focused feature styles when necessary
- Add: approved assets under `public/`
- Test: focused tests for each ported behavior

**Interfaces:**
- Every imported feature must consume the Big Cruise session, theme tokens, and existing app/game contracts rather than introducing a second app shell, auth system, or backend.

- [ ] **Step 1: Port only items classified Keep/Port by the audit.**
- [ ] **Step 2: Rewrite any item classified Rewrite so it fits React/Vite/Supabase instead of copying its source framework or backend.**
- [ ] **Step 3: Replace Cruise Connect naming and branding in every retained user-facing surface with BIG CRUISE〽️ identity.**
- [ ] **Step 4: Delete or omit every item classified Delete, including admin-only consumer UI and standalone Space UI.**
- [ ] **Step 5: Run focused tests for each retained flow and `npm run build`.**
- [ ] **Step 6: Commit: `feat: consolidate approved Cruise Connect functionality`.**

---

### Task 8: Implement the mobile-first PWA shell

**Files:**
- Modify: `index.html`
- Modify: `src/styles.css`
- Modify: `vite.config.ts` only if required by the chosen PWA implementation
- Create: `public/manifest.webmanifest`
- Create: `public/icons/` approved app icons
- Create: `src/pwa/register.ts`
- Create: `src/pwa/pwa.test.ts`
- Modify: `src/main.tsx`

**Interfaces:**
- `registerPwa()` registers the service worker only in production and does not block app startup.
- Manifest defines BIG CRUISE〽️ app metadata, standalone display, mobile theme/background colors, and installed-app icons.

- [ ] **Step 1: Write failing tests for manifest metadata and PWA registration guard behavior.**
- [ ] **Step 2: Implement the manifest and production-only registration path.**
- [ ] **Step 3: Add safe-area CSS using `env(safe-area-inset-*)`, touch target sizing, responsive navigation, and viewport handling.**
- [ ] **Step 4: Add an offline-capable application shell only for static app resources; never cache private game data or auth tokens in an unsafe way.**
- [ ] **Step 5: Verify the app remains usable when the network is unavailable after the shell has been cached.**
- [ ] **Step 6: Run PWA tests and production build.**
- [ ] **Step 7: Commit: `feat: add mobile-first Big Cruise PWA shell`.**

---

### Task 9: Harden Profile and shared session-aware UI

**Files:**
- Create: `src/features/profile/ProfilePanel.tsx`
- Create: `src/features/profile/profile-model.ts`
- Create: `src/features/profile/profile-model.test.ts`
- Modify: `src/pages/ProfilePage.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Profile consumes the authenticated Supabase user and displays only data available to the current user/session.
- Logout delegates to the single auth provider.

- [ ] **Step 1: Write failing tests for authenticated and signed-out profile states.**
- [ ] **Step 2: Implement the profile panel with account state and logout.**
- [ ] **Step 3: Keep profile free of admin controls, backend-management controls, and Space controls.**
- [ ] **Step 4: Run focused tests and build.**
- [ ] **Step 5: Commit: `feat: add session-aware profile surface`.**

---

### Task 10: Keep merch behind the core game/community milestone

**Files:**
- Create/Modify: `src/features/merch/` only after Tasks 1–9 pass
- Modify: existing `src/lib/cruise/store.ts` and `src/lib/cruise/payments.ts` only when needed
- Modify: `src/pages/` only to expose merch from a non-primary surface
- Add: approved merch assets under `public/`

**Interfaces:**
- Merch uses the existing store/payment abstractions and authenticated Big Cruise identity; it does not become a new navigation pillar.

- [ ] **Step 1: Verify Tasks 1–9 are green before starting merch.**
- [ ] **Step 2: Port only audited merch functionality and approved simple transparent-background graphics.**
- [ ] **Step 3: Keep product copy and UI mature, streetwear-oriented, and concise; reject childish/cartoonish and gold/metallic-gold treatments.**
- [ ] **Step 4: Verify cart, product selection, and Paystack flow without exposing payment secrets to the client.**
- [ ] **Step 5: Run focused merch tests and production build.**
- [ ] **Step 6: Commit: `feat: finalize Big Cruise merch surface`.**

---

### Task 11: End-to-end mobile/game verification and deployment readiness

**Files:**
- Modify: `README.md`
- Create: `docs/superpowers/verification/2026-09-10-big-cruise-release-checklist.md`
- Modify: CI/deployment files only if verification exposes a real gap

**Interfaces:**
- Release checklist covers auth, navigation, theme switching, UNO multiplayer, PWA install/shell, mobile layouts, and production build.

- [ ] **Step 1: Run `npm test`.**
  Expected: all unit/integration tests pass.
- [ ] **Step 2: Run `npm run build`.**
  Expected: TypeScript compilation and Vite production build pass.
- [ ] **Step 3: Verify email signup, verification, login, refresh persistence, logout, and password reset against the configured Supabase project.**
- [ ] **Step 4: Verify Home, Games, Community → Weekly Themes, and Profile are the only primary consumer destinations.**
- [ ] **Step 5: Verify changing the active weekly theme changes semantic UI tokens across Home, Games, Community, Profile, and UNO without scattered theme-name conditionals.**
- [ ] **Step 6: Verify UNO with at least two authenticated players: create room, join room, ready, start, legal move, draw, wild color selection, UNO call, rematch, leave, refresh/reconnect, and error recovery.**
- [ ] **Step 7: Verify no opponent can receive another player's private UNO hand through the client-facing response path.**
- [ ] **Step 8: Verify PWA install metadata and safe-area/touch behavior on iPhone Safari and Android Chrome test environments.**
- [ ] **Step 9: Record results in `docs/superpowers/verification/2026-09-10-big-cruise-release-checklist.md`.**
- [ ] **Step 10: Update `README.md` so it describes the actual final architecture, commands, environment variables, UNO backend requirements, and deployment flow.**
- [ ] **Step 11: Commit: `docs: add Big Cruise release verification checklist`.**

---

## Final Acceptance Gate

The implementation is ready for production only when all of these are true:

1. `npm test` passes.
2. `npm run build` passes.
3. Consumer navigation is Home, Games, Community, Profile, with Weekly Themes inside Community.
4. No Admin or Space destination exists in the consumer app.
5. Email/Supabase authentication is the only login system.
6. Weekly Themes drive app-wide semantic design tokens.
7. UNO multiplayer still uses authenticated server-side validation/persistence and protects private hands.
8. Cruise Connect material has been selectively consolidated according to the audit rather than wholesale merged.
9. PWA behavior is mobile-first and verified for iPhone Safari and Android Chrome.
10. Merch remains secondary to the core game/community experience and meets the approved visual direction.
