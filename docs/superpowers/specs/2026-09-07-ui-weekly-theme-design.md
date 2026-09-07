# BIG CRUISE〽️ UI + Weekly Theme Design

## Goal
Upgrade the app shell and UNO experience with a polished iPhone-calibrated glass UI while making the active weekly theme a first-class visual layer that changes accent color, typography treatment, icons, labels, and subtle decorative motion without losing BIG CRUISE identity.

## Architecture
The base design system remains Midnight Black and Yellow. A small client-side weekly-theme resolver returns a stable theme token for the current weekday; UI surfaces consume CSS custom properties and theme metadata rather than hard-coding theme colors. Theme metadata is extensible so future admin/server-driven themes can replace the calendar resolver without rewriting the UI.

## Weekly theme behavior
- The current weekly theme is resolved once from the user's local calendar date and applied at the app shell level.
- Theme tokens include id, short label, display name, accent color, accent-strong color, soft background tint, icon set, and typography class.
- Monday is `mcm` / Men Crush Monday and visibly switches the UI into the MCM treatment.
- MCM uses a distinct non-gold accent family, MCM-style portrait/heart/spark visual language, and MCM labels where theme context is shown.
- The default BIG CRUISE black/yellow treatment remains the fallback and brand anchor.
- Theme colors may tint controls, glass borders, glows, badges, active states, and decorative gradients, but must not turn the product into a generic themed template.
- No metallic, shiny, or gold treatment is permitted.

## UI requirements
- iPhone-first spacing, safe-area padding, dynamic viewport sizing, system font stack, and 44px minimum touch targets.
- Liquid Glass-inspired surfaces: translucent dark glass, backdrop blur, soft inner highlights, restrained borders, depth, and layered gradients.
- Game board remains dominant; decorative effects must not obscure gameplay.
- Cards and controls have tactile press/hover motion with reduced-motion support.
- Replace the browser `window.prompt` wild-color selector with an in-app branded modal.
- Keep the single BIG CRUISE login/session; games never introduce a second authentication flow.
- Preserve the existing game-first product hierarchy: Games, then weekly theme, then merch.

## CI requirements
- Add a committed `package-lock.json` compatible with the existing npm scripts so `npm ci` can execute in GitHub Actions.
- Keep GitHub Actions pinned to full commit SHAs.

## Deployment and QA
- Deploy the canonical `CRUISE-CONNECT-HUB/Big-Cruise-App` repository to a fresh/current Vercel project rather than relying on the legacy deployment.
- Verify the production build and provide a preview URL that can be opened on iPhone.
- Smoke-test login, room creation/join, ready/start, play/draw, UNO, wild-color selection, finish, rematch, refresh/reconnect, and theme switching across at least Monday/MCM and the default treatment.

## Success criteria
- On Monday the app visibly speaks MCM through accent colors, theme iconography, labels, and subtle visual treatment.
- On other days the correct theme token is applied without breaking BIG CRUISE black/yellow branding.
- UNO is comfortably usable on iPhone with glass surfaces and tactile interactions.
- CI reaches npm test and npm build instead of failing on the missing lockfile.
- Canonical code is deployed and the resulting preview can be opened from an iPhone.
