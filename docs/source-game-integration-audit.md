# BIG CRUISE Source-Game Integration Audit

## Decision

The four requested repositories were audited as implementation references. BIG CRUISE will not copy their source code, third-party assets, external CDN URLs, prompt catalogs, or branding without explicit permission and a license review. The mobile implementation uses clean-room rules and components owned by BIG CRUISE, connected to the existing authenticated room and realtime architecture.

| Game | Audit result | BIG CRUISE treatment |
|---|---|---|
| Werewolf | Static guide only; no license, backend, or playable realtime engine | Reimplement roles, phases, voting, night actions, and win checks as server-authoritative BIG CRUISE rules. Use the guide only for information architecture. |
| Codenames | Next/Firebase game; no license and client-side visibility/scoring risks | Reimplement the 25-card board, hidden key, spymaster/operative views, clue/guess events, assassin, scoring, and reconnect-safe room state. |
| Karaoke | GPL-3.0 osu!lazer C# ruleset; desktop and microphone/runtime dependencies | Do not embed GPL code. Build a mobile-safe karaoke mode around licensed/user-owned songs, timestamped lyrics, opt-in microphone input, local scoring, and compact multiplayer score events. |
| Truth or Dare | MIT code, but raw prompt catalog contains unsafe, coercive, sexual, privacy-invasive, and injury prompts | Reimplement the local loop and mobile card UI with a safety-reviewed, consent-first catalogue, skip/pass/report controls, age rating, and no raw prompt reuse. |

## Mobile implementation requirements

All four modes use portrait-first layouts, safe-area padding, 44px minimum controls, no hover dependency, reduced-motion support, readable high-contrast text, one-handed navigation, reconnect-safe waiting states, and touch feedback. Multiplayer actions remain validated by the server; the client never decides roles, hidden keys, scores, kills, votes, or win conditions.

## Security and content safeguards

Werewolf roles, Codenames keys, and party scores must be sanitized per player and versioned in the room session state. Codenames must never send the full key to operatives. Truth or Dare prompts must be curated for consent and safety, with an immediate skip/pass path. Karaoke requires content provenance and explicit microphone permission; raw voice data should not be persisted.

## Release gates

Before production promotion, run dependency audit and CodeQL, test the room state under simultaneous taps and reconnects, test the six-party mobile layouts at narrow portrait widths, verify keyboard/screen-reader labels, and perform a real two-device room test over a mobile network.
