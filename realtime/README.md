# BIG CRUISE realtime

Persistent Socket.IO service for BIG CRUISE HQ.

## Current live layer

- Socket.IO 4.x for low-latency room events.
- Supabase Auth + game membership remain authoritative for access.
- Draw It Out uses Socket.IO for live stroke/presence fan-out.
- Ludo uses @ayshrj/ludo.js as the in-memory rules engine for online roll/move events.
- uno-engine and @bezier/werewolf-server are installed in the service for the next engine adapters; they are intentionally isolated from the browser bundle.

## Required environment

- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY
- PORT (Railway supplies this automatically)

Health endpoint: /health
