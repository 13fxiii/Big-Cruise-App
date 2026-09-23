# Cruise Connect UI Patterns → BIG CRUISE Game Surfaces

## Purpose

This guide defines how to adapt the visual and interaction patterns found in `CRUISE-CONNECT-HUB/cruise-connect-hub` into the existing `13fxiii/Big-Cruise-App` Vite/React/Supabase application. It is a **restyling plan**, not a framework migration. BIG CRUISE remains the canonical product, and its authentication, Supabase integration, game logic, multiplayer sessions, and result recording remain unchanged.

The selected Cruise Connect repository is a small Next.js/v0 scaffold. It contains a large set of generic Radix/shadcn-style UI primitives, Tailwind tokens, legal pages, and typography conventions, but it does not contain a complete community home page, game catalogue, authentication flow, or backend. The useful material is therefore **visual and component-level**, not application-level.

> **Guiding rule:** copy the interaction intent and visual discipline, not the Next.js shell or dependency tree.

## Executive decision

The current BIG CRUISE app already has a strong game-oriented visual language: dark flat-screen surfaces, yellow accent actions, large touch targets, compact cards, mobile safe-area handling, and game-specific states. Cruise Connect should influence the system in four areas:

1. **Component consistency:** establish reusable buttons, cards, fields, badges, dialogs, and feedback patterns.
2. **Layout rhythm:** use clearer content widths, spacing tiers, headings, and responsive composition.
3. **Interaction states:** make loading, empty, error, selected, disabled, success, and destructive states explicit.
4. **Accessibility baseline:** preserve focus visibility, keyboard access, labels, contrast, and reduced-motion behavior.

The plan intentionally avoids importing Cruise Connect’s light/dark token system unchanged. BIG CRUISE needs a dark-first, energetic game surface rather than a generic neutral dashboard.

## Source-to-target visual comparison

| Visual area | Cruise Connect source pattern | Current BIG CRUISE pattern | Restyling decision |
|---|---|---|---|
| Application shell | Next.js root layout, Geist typography, generic body wrapper | Vite root, `main.tsx`, dark mobile-first shell | Keep BIG CRUISE shell; adopt a clearer token layer and consistent content container |
| Typography | Geist and Geist Mono through `next/font` | System/Inter/SF-oriented stack with compact heavy headings | Keep the existing game voice; optionally add a local/system display stack without Next font loading |
| Color system | Neutral OKLCH tokens with a generic primary/secondary model | Black background, white text, BIG CRUISE yellow, game accent colors | Keep BIG CRUISE palette; add semantic surface, text, border, focus, success, warning, and danger tokens |
| Buttons | Radix/shadcn variants with focus and disabled states | Native button styles plus `.primary`, `.ghost`, `.link` | Replace ad hoc variants with a small local button vocabulary |
| Cards | Generic card primitives | Game cards, promo rows, room surfaces, product cards | Preserve game-specific cards; consolidate border, radius, surface, and focus treatment |
| Inputs | Generic labeled input/form primitives | Compact auth and room-code inputs | Add labels, error association, input modes, and a reusable room-code field |
| Feedback | Alert, toast, sonner, skeleton, spinner primitives available | Inline `.error` text and busy/disabled states | Add a lightweight toast and status system only where it improves game flow |
| Navigation | Generic navigation/sidebar primitives, not used by a complete home route | Sticky header and fixed bottom navigation | Keep BIG CRUISE navigation; refine selected state and safe-area behavior |
| Dialogs | Dialog, drawer, sheet, alert-dialog primitives | UNO wild-color modal and game-specific overlays | Create one accessible modal primitive and reuse it for game actions |
| Data display | Table, badge, progress, tabs, chart primitives | Seats, statuses, cards, game results | Use only compact game-relevant data displays; do not introduce dashboard density |
| Responsive behavior | Tailwind responsive utilities | Explicit mobile breakpoints and `100svh`/safe-area rules | Keep the explicit mobile strategy; add container and orientation checks |
| Decorative assets | Placeholder images and generic icons | Emoji/game symbols and flat-color game art | Do not import placeholders; keep deterministic game icons and accents |

## Target architecture

### Keep the existing application boundaries

The restyling should remain inside the existing Vite entrypoint and stylesheet until repeated patterns justify extraction. The first pass may introduce a small UI directory, but it must not move game rules or Supabase code into visual components.

Recommended target structure:

```text
src/
├── main.tsx                         # Existing route/tab composition
├── styles.css                       # Global tokens and responsive baseline
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Field.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── StatusMessage.tsx
│   │   └── Spinner.tsx
│   ├── shell/
│   │   ├── Header.tsx
│   │   └── BottomNav.tsx
│   └── games/
│       ├── GameCard.tsx
│       ├── RoomEntry.tsx
│       ├── RoomHeader.tsx
│       └── PlayerSeat.tsx
└── lib/
    ├── cruise/                     # Existing catalogue/store/payments
    ├── games/                      # Existing UNO/Ludo logic and sessions
    └── supabase.ts                 # Existing client
```

This is a target shape, not an instruction to perform a large file move. Extract only after a component has at least two real consumers or its accessibility behavior is difficult to maintain inline.

## Component-by-component migration guide

### 1. Root shell and page container

**Source pattern:** Cruise Connect uses a root layout with a centered body and utility classes.

**Target:** Keep the Vite root and existing `.app` shell. Add a reusable `PageContainer` only if the home, games, rankings, community, and merch views need the same width and horizontal padding.

**Adaptation:**

- Preserve `100svh`, safe-area padding, and the fixed bottom navigation.
- Define a maximum content width once instead of repeating `max-width` rules.
- Keep game tables wider than marketing or profile content when necessary.
- Add `data-page` or a page class only for layout differences; do not couple page layout to game rules.

**Acceptance criteria:** navigating between tabs does not shift the header, content does not sit under the bottom navigation, and a 320px-wide viewport has no horizontal overflow.

### 2. Header and brand mark

**Source pattern:** The source root layout establishes typography and metadata but has no usable product header.

**Target:** Preserve the existing `Header` in `src/main.tsx`.

**Adaptation:**

- Keep BIG CRUISE〽️ as the home control.
- Keep the weekly theme badge as contextual information.
- Move sign-out into a consistent compact action with an accessible label.
- Add a visible focus ring that is distinct from the yellow selected state.
- Do not add a desktop sidebar unless the catalogue later proves that bottom navigation is insufficient.

**Acceptance criteria:** the header remains usable one-handed, the brand button has an accessible name, and the sign-out action is reachable by keyboard and touch.

### 3. Bottom navigation

**Source pattern:** Cruise Connect provides generic navigation primitives but no completed product navigation.

**Target:** Keep the current five-destination BIG CRUISE bottom navigation.

**Adaptation:**

- Use a single selected-state treatment: yellow text/icon plus a low-contrast yellow surface.
- Include a non-color indicator such as a small underline or filled icon state.
- Keep labels visible; do not rely on icon recognition.
- Respect `env(safe-area-inset-bottom)`.
- Prevent navigation changes while a destructive game action is awaiting confirmation.

**Acceptance criteria:** each destination is at least 44px high, the active tab is understandable without color, and the game table remains usable above the nav bar.

### 4. Buttons

**Source pattern:** `components/ui/button.tsx` uses variant-driven Radix/shadcn conventions.

**Target:** Replace scattered button styling with a small local variant system, either as a React `Button` component or a CSS class contract.

Recommended variants:

| Variant | Use |
|---|---|
| `primary` | Start, roll, ready, submit, rematch |
| `secondary` | Non-primary room and navigation actions |
| `ghost` | Exit, cancel, low-priority actions |
| `danger` | Leave room or destructive action when confirmation is needed |
| `icon` | Compact controls with an accessible label |

**Adaptation:**

- Keep the BIG CRUISE yellow primary action.
- Keep minimum height at 44px.
- Add `:focus-visible` styling rather than relying on browser defaults.
- Make loading state preserve button width and announce busy status.
- Avoid gradients and glass effects that obscure game state.

**Acceptance criteria:** disabled, focus, hover, pressed, and busy states are visually distinct; rapid taps cannot submit the same action twice.

### 5. Game cards

**Source pattern:** Cruise Connect has generic card primitives but no game catalogue.

**Target:** Keep the existing `GameCard` and `GAMES` catalogue contract.

**Adaptation:**

- Preserve each game’s accent color and icon.
- Use a consistent card anatomy: art, name, availability, action affordance.
- Make the entire card the hit target, but keep the status text explicit.
- Separate `playable`, `coming-soon`, and `locked` states semantically; do not make unavailable cards appear clickable.
- Use `aria-disabled` or a non-button element for genuinely unavailable entries.

**Acceptance criteria:** a user can distinguish playable from unavailable games without opening a card, and the card works with keyboard activation.

### 6. Room-entry surface

**Source pattern:** Generic form and input primitives can inform field spacing and errors.

**Target:** Extract a shared `RoomEntry` visual component for UNO and Ludo while keeping each game’s request function separate.

Suggested props:

```ts
type RoomEntryProps = {
  gameLabel: string;
  description: string;
  roomCode: string;
  onRoomCodeChange: (value: string) => void;
  onCreate: () => void;
  onJoin: () => void;
  busy: boolean;
  error?: string;
};
```

**Adaptation:**

- Use a labeled room-code field, not placeholder-only identification.
- Normalize codes to uppercase in the presentation layer.
- Set `inputMode="text"`, `autoCapitalize="characters"`, and an appropriate `maxLength`.
- Keep create and join actions visually separate.
- Show server errors close to the field or action that caused them.

**Acceptance criteria:** invalid or incomplete codes are prevented locally, server errors are readable, and the form remains usable when the mobile keyboard is open.

### 7. Room header

**Source pattern:** Badge and heading primitives provide a useful hierarchy model.

**Target:** Extract a shared `RoomHeader` from the existing UNO and Ludo room headers.

**Adaptation:**

- Show room code, game name, and match status in a consistent order.
- Keep Exit visible but visually secondary.
- Add a compact copy-code control only if it does not compete with the primary game action.
- Use a status badge for `lobby`, `playing`, and `finished`.
- Never display protected state such as private cards or roles in the shared header.

**Acceptance criteria:** a player can identify the room, game, and current phase at a glance on a portrait phone.

### 8. Player seats and presence

**Source pattern:** Avatar, badge, skeleton, and empty-state primitives are reusable concepts.

**Target:** Create a `PlayerSeat` component for UNO seats and Ludo lobby players.

**Adaptation:**

- Use display name and a short identity marker.
- Show `READY`, `WAITING`, or `TURN` as text, not color alone.
- Keep seat order deterministic so multiplayer views do not jump as state updates.
- Use a skeleton or “joining” state during a transient fetch.
- Do not show hidden hand contents, secret roles, or protected state.

**Acceptance criteria:** presence changes are understandable, the active player is marked with both text and visual emphasis, and missing avatars do not create layout shifts.

### 9. Status, error, and success feedback

**Source pattern:** Alert, toast, sonner, spinner, and skeleton primitives are available in the source.

**Target:** Start with a local `StatusMessage` and `Spinner`; add a toast only for short-lived confirmations.

**Adaptation:**

- Keep game-rule errors inline near the action area.
- Use a persistent status for reconnecting, waiting for players, and server recovery.
- Use a toast for low-risk confirmations such as “Room code copied.”
- Do not hide a failed move inside a toast.
- Use `role="status"` for non-error progress and `role="alert"` for actionable errors.

**Acceptance criteria:** a player can tell whether an action succeeded, is pending, or was rejected without relying on console output.

### 10. Modal and confirmation surfaces

**Source pattern:** Dialog, drawer, sheet, and alert-dialog primitives provide accessible overlay patterns.

**Target:** Extract one accessible `Modal` for the existing UNO color picker and future confirmation flows.

**Adaptation:**

- Trap focus while open.
- Close on Escape when safe.
- Return focus to the triggering control.
- Use a bottom-sheet presentation on narrow screens only when it improves thumb reach.
- Confirm leaving an active match; do not confirm harmless navigation from a lobby.
- Keep the overlay flat and high contrast rather than glassy.

**Acceptance criteria:** keyboard users can enter, use, and exit the modal; screen readers receive the title and purpose; the modal does not expose private game state.

### 11. UNO table

**Source pattern:** Cruise Connect contributes generic cards, badges, and dialog patterns only.

**Target:** Preserve UNO rules, Edge Function, private-hand projection, session recovery, and room lifecycle.

**Restyling sequence:**

1. Apply the shared `RoomHeader`.
2. Apply `PlayerSeat` to the four-seat area.
3. Apply shared status and button variants.
4. Preserve the center table, discard pile, draw pile, hand, and wild-color modal.
5. Keep private hand rendering and server action payloads unchanged.

**Acceptance criteria:** visual changes do not alter card visibility, legal move handling, reconnect behavior, or server validation.

### 12. Ludo lobby and board

**Source pattern:** Cruise Connect’s generic cards, badges, buttons, dialog, and responsive spacing are useful; no Ludo implementation exists in the source.

**Target:** Preserve the Ludo rules module, Edge Function, authoritative session state, and result/stat writes.

**Restyling sequence:**

1. Apply `RoomEntry` to create/join.
2. Apply `RoomHeader` and `PlayerSeat` to the lobby.
3. Keep the board as a game-specific component because its grid geometry and piece hit targets are not generic UI.
4. Use shared button and status variants for dice, ready, start, exit, and rematch.
5. Keep legal piece highlighting, turn state, dice state, and winner state explicit.

**Acceptance criteria:** the board remains readable in portrait mode, movable pieces remain at least 44px where practical, and visual state cannot imply a legal move that the server will reject.

### 13. Results and rematch

**Source pattern:** Card, badge, separator, and button primitives suggest a compact result summary.

**Target:** Create a shared `MatchResult` surface only after UNO and Ludo have two confirmed consumers.

**Adaptation:**

- Show winner or draw state in plain language.
- Show each player’s result and score when available.
- Provide Rematch and Exit as separate actions.
- Confirm that rematch is a new match state, not a visual reset.
- Keep result recording in Supabase and Edge Functions.

**Acceptance criteria:** the result view clearly separates completed match data from the next-match action, and refresh does not fabricate a result.

### 14. Forms and authentication

**Source pattern:** Cruise Connect form components provide labels, descriptions, and error placement.

**Target:** Keep BIG CRUISE’s existing Supabase authentication flow. Do not port Next.js form actions or create a second auth layer.

**Adaptation:**

- Add explicit labels and `autocomplete` attributes to email/password fields.
- Keep authentication errors close to the form.
- Preserve the existing BIG CRUISE ID/profile relationship.
- Use the same button variants as game actions.
- Treat authentication loading as a page state, not a generic spinner overlay.

**Acceptance criteria:** login, sign-up, sign-out, and session restoration continue to use the current Supabase client and retain the current user identity.

### 15. Legal and utility pages

**Source pattern:** Cruise Connect has polished legal-page layouts with a centered reading column and strong heading hierarchy.

**Target:** Port the layout rhythm only if BIG CRUISE needs policy pages.

**Adaptation:**

- Rewrite names, URLs, dates, and claims for BIG CRUISE.
- Use the existing Vite routing approach rather than importing Next `Link`.
- Reuse the BIG CRUISE header and typography tokens.
- Have legal text reviewed before publication.

**Acceptance criteria:** legal pages contain no Cruise Connect references, stale URLs, or unsupported claims.

## Token migration plan

Add a semantic token layer to `src/styles.css` before extracting components. The tokens should describe meaning instead of component-specific colors.

```css
:root {
  --bc-bg: #050505;
  --bc-surface: #101010;
  --bc-surface-raised: #171717;
  --bc-surface-muted: #ffffff08;
  --bc-text: #f7f7f2;
  --bc-text-muted: #999;
  --bc-text-subtle: #777;
  --bc-accent: #ffd400;
  --bc-focus: #fff0a3;
  --bc-success: #35d07f;
  --bc-danger: #ff7272;
  --bc-border: #ffffff16;
  --bc-radius-card: 22px;
  --bc-radius-control: 16px;
  --bc-tap-size: 44px;
}
```

The exact values may remain close to the current stylesheet. The benefit is that future visual tuning changes a semantic token instead of searching through game markup.

## Implementation order

### Phase 0: Baseline capture

Capture screenshots and accessibility snapshots for these existing states:

- Signed-out login
- Home tab
- Games catalogue
- UNO room entry
- UNO lobby
- UNO playing table
- Ludo room entry
- Ludo lobby
- Ludo playing board
- Finished match/result state
- Mobile viewport at 320px, 390px, and 430px widths

Record console errors and network failures. Do not change the UI before these snapshots exist.

### Phase 1: Shared visual foundations

Implement only semantic CSS tokens, focus states, button variants, field states, and a consistent card border/radius contract. This phase should not change Supabase calls, game rules, or route behavior.

### Phase 2: Shared room surfaces

Extract or standardize `RoomEntry`, `RoomHeader`, `PlayerSeat`, `StatusMessage`, and `Modal`. Apply them first to UNO and then to Ludo. Verify that the existing room and session flows still work after each game is updated.

### Phase 3: Game-specific restyling

Restyle UNO and Ludo one at a time. Preserve their existing state shape, action names, server endpoints, private-state projection, and result recording. Avoid a shared abstraction for board/card gameplay unless the code has a real repeated behavior.

### Phase 4: Catalogue and navigation

Refine game cards, selected navigation states, empty states, and unavailable-game presentation. Keep catalogue status driven by `src/lib/cruise/catalog.ts`.

### Phase 5: Verification and polish

Run targeted tests, production build, keyboard checks, touch checks, refresh checks, and authenticated two-player checks. Only after those pass should decorative motion, score effects, or victory polish be added.

## Visual quality gate

A restyled game surface passes only when all of the following are true:

- The game remains usable at 320px width.
- Primary controls meet the 44px touch target baseline.
- Focus is visible without relying on color alone.
- Loading, error, disabled, reconnecting, lobby, playing, and finished states are distinct.
- No game state is hidden behind a decorative animation.
- UNO private hands remain private.
- Ludo legal-piece emphasis matches server-accepted moves.
- Header and bottom navigation respect safe areas.
- Reduced-motion preferences disable nonessential animation.
- A hard refresh does not lose a recoverable match session.
- The production build and targeted game tests pass.

## Explicit non-goals

This migration guide does not authorize:

- Replacing Vite with Next.js.
- Replacing Supabase authentication.
- Rebuilding the game platform.
- Importing the Cruise Connect dependency tree.
- Replacing UNO or Ludo rules.
- Adding fake multiplayer or client-trusted outcomes.
- Building a generic dashboard.
- Adding rewards, challenges, or leaderboards before match completion is stable.

## Recommended first implementation slice

Start with a **shared room-entry and room-header restyle** applied to UNO and Ludo. It has high visual leverage, low gameplay risk, and clear reuse potential. Do not begin by importing all Cruise Connect UI primitives. Implement only the button, field, card, badge, modal, and status behaviors required by the two existing multiplayer games.

The first slice should be considered successful when a player can still complete the following flows with the new visual system:

```text
Sign in → Open Games → Enter UNO/Ludo → Create or Join → Ready → Play → Finish → Rematch or Exit
```

## References

[1]: https://github.com/CRUISE-CONNECT-HUB/cruise-connect-hub "Cruise Connect Hub source repository"
[2]: https://github.com/13fxiii/Big-Cruise-App "BIG CRUISE application source repository"
[3]: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html "WCAG 2.2 Target Size Minimum"
[4]: https://developer.mozilla.org/en-US/docs/Web/CSS/env "CSS env() function and safe-area insets"
[5]: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion " prefers-reduced-motion media feature"

**Author:** Manus AI
**Status:** Planning document; no application files were changed by this guide.
