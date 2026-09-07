# BIG CRUISE〽️

BIG CRUISE〽️ is being rebuilt around one app identity and a game-first experience.

## Authentication

Supabase Auth is the single authentication layer. Games consume the authenticated BIG CRUISE session; they do not create separate game accounts or passwords.

## UNO

The first game is UNO. The client sends authenticated intents to the `uno` Supabase Edge Function. The function resolves the Supabase user, loads their BIG CRUISE profile, validates the move, and persists versioned room state in Supabase Postgres.

Private player hands never go to opponents, and UNO room tables are denied direct `anon`/`authenticated` table access; the server-side Edge Function performs game persistence with its server credential.

## Environment

Copy `.env.example` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The Supabase project must have the `uno` Edge Function deployed and the `uno_authenticated_multiplayer` schema applied.

## Development

```bash
npm install
npm run dev
npm test
npm run build
```

Ludo is intentionally not part of this release. UNO must be verified in real multiplayer first.

## Deployment

The canonical GitHub repository is `13fxiii/Big-Cruise-App` and the existing BIG CRUISE〽️ Vercel project is used for deployment. Supabase remains the backend and hosts the authenticated `uno` Edge Function.
