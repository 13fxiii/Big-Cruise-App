# BIG CRUISE〽️ UI + Weekly Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved iPhone-calibrated Liquid Glass-inspired UI, dynamic weekly-theme styling, branded UNO interactions, CI fix, and a canonical preview deployment.

**Architecture:** Keep the existing React/Vite/Supabase architecture. Add a pure weekly-theme resolver and expose its metadata to the React shell through CSS custom properties; keep the base BIG CRUISE Midnight Black/Yellow identity as the fallback and let theme accents tint the same glass design system. Replace prompt-based wild-color selection with a React modal and keep all game identity tied to the existing Supabase session.

**Tech Stack:** React 19, TypeScript, Vite, CSS, Supabase Auth/Edge Functions, npm, GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-07-ui-weekly-theme-design.md`

## Global Constraints

- Official BIG CRUISE〽️ brand base is Lagos Danfo Midnight Black and Yellow; never use gold/metallic/shiny-gold treatment.
- Weekly themes may override accent treatment but must retain BIG CRUISE visual identity.
- Monday must resolve to `mcm` / Men Crush Monday with distinct MCM accent, labels, and icon language.
- One BIG CRUISE account/session; no in-game authentication.
- Game board remains dominant and gameplay controls remain usable with minimum 44px touch targets.
- Respect `prefers-reduced-motion`.
- Never expose Supabase service-role credentials in browser code.
- GitHub Actions remain pinned to full commit SHAs.

---

### Task 1: Add weekly theme resolver and tests

**Files:**
- Create: `src/lib/theme.ts`
- Create: `src/lib/theme.test.ts`

**Interfaces:**
- Produces `getWeeklyTheme(date: Date): WeeklyTheme`.
- `WeeklyTheme` contains `id`, `shortLabel`, `displayName`, `accent`, `accentStrong`, `accentSoft`, `icon`, and `typeClass`.

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { getWeeklyTheme } from './theme.ts';

test('Monday resolves to the MCM theme', () => {
  const theme = getWeeklyTheme(new Date('2026-09-07T12:00:00'));
  assert.equal(theme.id, 'mcm');
  assert.equal(theme.shortLabel, 'MCM');
  assert.equal(theme.displayName, 'Men Crush Monday');
  assert.match(theme.typeClass, /mcm/);
});

test('non-Monday resolves to a non-MCM weekly theme', () => {
  const theme = getWeeklyTheme(new Date('2026-09-08T12:00:00'));
  assert.notEqual(theme.id, 'mcm');
  assert.ok(theme.accent.startsWith('#'));
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --experimental-strip-types --test src/lib/theme.test.ts`

Expected: FAIL because `src/lib/theme.ts` does not exist.

- [ ] **Step 3: Implement the minimal resolver**

```ts
export type WeeklyTheme = {
  id: string;
  shortLabel: string;
  displayName: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  icon: string;
  typeClass: string;
};

const themes: WeeklyTheme[] = [
  { id: 'sunday', shortLabel: 'SUNDAY', displayName: 'Sunday Cruise', accent: '#ffd400', accentStrong: '#ffe45c', accentSoft: '#ffd40022', icon: '〽️', typeClass: 'theme-default' },
  { id: 'mcm', shortLabel: 'MCM', displayName: 'Men Crush Monday', accent: '#ff4f8b', accentStrong: '#ff79a9', accentSoft: '#ff4f8b22', icon: '♥︎', typeClass: 'theme-mcm' },
  { id: 'tuesday', shortLabel: 'TUE', displayName: 'Cruise Tuesday', accent: '#ffd400', accentStrong: '#ffe45c', accentSoft: '#ffd40022', icon: '✦', typeClass: 'theme-default' },
  { id: 'wednesday', shortLabel: 'WED', displayName: 'Weekly Cruise Wednesday', accent: '#ffd400', accentStrong: '#ffe45c', accentSoft: '#ffd40022', icon: '✦', typeClass: 'theme-default' },
  { id: 'thursday', shortLabel: 'THU', displayName: 'Throwback Thursday', accent: '#ffd400', accentStrong: '#ffe45c', accentSoft: '#ffd40022', icon: '↺', typeClass: 'theme-default' },
  { id: 'friday', shortLabel: 'FRI', displayName: 'Friday Cruise', accent: '#ffd400', accentStrong: '#ffe45c', accentSoft: '#ffd40022', icon: '✦', typeClass: 'theme-default' },
  { id: 'saturday', shortLabel: 'SAT', displayName: 'Saturday Cruise', accent: '#ffd400', accentStrong: '#ffe45c', accentSoft: '#ffd40022', icon: '〽️', typeClass: 'theme-default' },
];

export function getWeeklyTheme(date: Date): WeeklyTheme {
  return themes[date.getDay()];
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `node --experimental-strip-types --test src/lib/theme.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/theme.ts src/lib/theme.test.ts
git commit -m "feat: add weekly theme resolver"
```

---

### Task 2: Wire theme metadata into the app shell

**Files:**
- Modify: `src/main.tsx`

**Interfaces:**
- Import `getWeeklyTheme` and resolve it once when `App` renders.
- Set CSS custom properties `--theme-accent`, `--theme-accent-strong`, and `--theme-accent-soft` on the root app element.
- Render a compact weekly-theme badge in the header/lobby so the current theme is visible.

- [ ] **Step 1: Add a failing assertion to the theme test for the MCM metadata**

```ts
assert.equal(getWeeklyTheme(new Date('2026-09-07T12:00:00')).icon, '♥︎');
assert.equal(getWeeklyTheme(new Date('2026-09-07T12:00:00')).accent, '#ff4f8b');
```

- [ ] **Step 2: Run the test and verify it fails before adding the MCM metadata**

Run: `node --experimental-strip-types --test src/lib/theme.test.ts`

Expected: FAIL on the MCM icon/accent assertion.

- [ ] **Step 3: Add the MCM metadata and shell wiring**

```tsx
const theme = getWeeklyTheme(new Date());
const themeStyle = {
  '--theme-accent': theme.accent,
  '--theme-accent-strong': theme.accentStrong,
  '--theme-accent-soft': theme.accentSoft,
} as React.CSSProperties;

return <div className={theme.typeClass} style={themeStyle} data-theme={theme.id}>
  {/* existing authenticated app */}
</div>;
```

Use `{theme.icon} {theme.shortLabel}` in a small badge and use `theme.displayName` as its accessible label/title. Do not hard-code MCM into the JSX.

- [ ] **Step 4: Run tests and TypeScript build**

Run: `npm test && npm run build`

Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/main.tsx src/lib/theme.ts src/lib/theme.test.ts
git commit -m "feat: wire weekly theme into app shell"
```

---

### Task 3: Replace the base CSS with iPhone-calibrated Liquid Glass UI

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Existing class names remain usable by `main.tsx`.
- Add CSS variables with fallback to BIG CRUISE Yellow.
- Add safe-area handling, dynamic viewport sizing, glass surfaces, tactile motion, and reduced-motion rules.

- [ ] **Step 1: Write a browser-independent CSS contract check**

Add a small shell test file `src/lib/theme-css.test.ts` that reads `src/styles.css` with Node `fs` and asserts the source contains `backdrop-filter`, `env(safe-area-inset-bottom)`, `min-height: 44px`, and `prefers-reduced-motion`.

- [ ] **Step 2: Run it and verify it fails**

Run: `node --experimental-strip-types --test src/lib/theme-css.test.ts`

Expected: FAIL because the current stylesheet lacks the new contract markers.

- [ ] **Step 3: Implement the glass design system**

Use a system/iPhone font stack, `100dvh`/`100svh`, `env(safe-area-inset-*)`, `-webkit-tap-highlight-color: transparent`, `backdrop-filter: blur(...) saturate(...)`, translucent dark panels, restrained borders, inner highlights, `--theme-accent` accents, and minimum 44px controls. Keep the game center visually dominant. Add pressed states with `transform: translateY(1px) scale(.985)` and card lift with short transitions.

The MCM treatment should visibly affect the app through `--theme-accent` on active seats, badges, glass highlights, primary controls, and ambient gradients, while the default theme stays BIG CRUISE black/yellow.

- [ ] **Step 4: Run CSS contract, tests, and build**

Run: `node --experimental-strip-types --test src/lib/theme-css.test.ts && npm test && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles.css src/lib/theme-css.test.ts
git commit -m "feat: add iphone liquid glass ui"
```

---

### Task 4: Add branded wild-color modal and stronger tactile UNO interactions

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Replace `window.prompt` with local `wildCard` state and four color buttons.
- The modal sends `run('play', { roomId, cardId, chosenColor })` only after a valid selection.

- [ ] **Step 1: Write the failing test for color choices**

Add a pure helper in `src/lib/games/uno/color.ts`:

```ts
export const UNO_COLORS = ['red', 'yellow', 'green', 'blue'] as const;
export type UnoPlayableColor = typeof UNO_COLORS[number];

export function isUnoPlayableColor(value: string): value is UnoPlayableColor {
  return (UNO_COLORS as readonly string[]).includes(value);
}
```

Test it with valid and invalid values.

- [ ] **Step 2: Run and verify the new test fails**

Run: `node --experimental-strip-types --test src/lib/games/uno/color.test.ts`

Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement the helper and modal**

The modal should show the selected wild card, four large color choices, an accessible close action, and theme-aware glass styling. Use labels `RED`, `YELLOW`, `GREEN`, `BLUE`; do not use a browser prompt.

- [ ] **Step 4: Run tests and build**

Run: `npm test && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/main.tsx src/styles.css src/lib/games/uno/color.ts src/lib/games/uno/color.test.ts
git commit -m "feat: add branded uno wild color picker"
```

---

### Task 5: Fix npm CI by committing the lockfile

**Files:**
- Create: `package-lock.json`

**Interfaces:**
- Lockfile must match `package.json` and support npm CI with Node 22.

- [ ] **Step 1: Generate the lockfile from package.json**

Run: `npm install --package-lock-only --ignore-scripts`

Expected: `package-lock.json` is created without modifying application source.

- [ ] **Step 2: Verify npm ci from the lockfile**

Run: `npm ci`

Expected: successful clean install.

- [ ] **Step 3: Run tests and build from the clean install**

Run: `npm test && npm run build`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add package-lock.json
git commit -m "ci: add npm lockfile"
```

---

### Task 6: Deploy the canonical repository and smoke-test the preview

**Files:**
- Modify deployment configuration only if required by the canonical Vercel project.

**Interfaces:**
- Source: `CRUISE-CONNECT-HUB/Big-Cruise-App` `main` branch.
- Required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

- [ ] **Step 1: Create/link a Vercel project to the canonical GitHub repository**

Use the Vercel connector and explicitly select `CRUISE-CONNECT-HUB/Big-Cruise-App`; do not reuse the legacy deployment unless it is proven to point at this repository.

- [ ] **Step 2: Configure environment variables**

Set `VITE_SUPABASE_URL=https://qdeozgkmrqectbuhetvc.supabase.co` and the matching Supabase anon key from the connected project. Never place the service-role key in Vite environment variables.

- [ ] **Step 3: Deploy and record the preview URL**

Trigger a deployment from the canonical `main` branch and verify the deployment reports READY.

- [ ] **Step 4: Smoke-test the deployed app**

Verify: login → create room → join from a second authenticated session → ready/start → play/draw → wild color modal → UNO → finish → rematch → refresh/reconnect. Verify opponent hand contents remain hidden and the MCM theme is visible when the browser date is Monday.

- [ ] **Step 5: Run final CI verification**

Confirm the latest GitHub Actions run reaches `npm ci`, `npm test`, and `npm run build` successfully.

- [ ] **Step 6: Commit any deployment-only source changes**

```bash
git status --short
git log -5 --oneline
```

Expected: clean working tree for source changes and documented preview URL.
