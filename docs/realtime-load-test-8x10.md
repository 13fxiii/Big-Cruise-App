# BIG CRUISE Realtime Load Test — 8 Players × 10 Actions

**Run:** `load-mujvtzmj`  
**Date:** 2026-09-27  
**Profile:** 12 game topics × 8 simulated players × 10 actions per player

## Result

**PASS** — all expected Broadcast events were delivered and the reconnect probe succeeded.

| Metric | Result |
|---|---:|
| Game topics | 12 |
| Simulated players | 96 |
| Actions attempted | 960 |
| Expected deliveries | 7,680 |
| Actual deliveries | 7,680 |
| Delivery ratio | 100% |
| Reconnect status | SUBSCRIBED |
| Reconnect time | 65.5 ms |
| Reconnect send acknowledgement | OK |

## Latency

| Measurement | p50 | p95 |
|---|---:|---:|
| Channel subscription | 1,141.5 ms | 1,192.4 ms |
| Broadcast send acknowledgement | 16.1 ms | 33.8 ms |
| Event delivery | 16.2 ms | 33.8 ms |

## Comparison with 4-player baseline

| Measurement | Baseline p95 | 8×10 p95 | Change |
|---|---:|---:|---:|
| Subscription | 325.5 ms | 1,192.4 ms | 3.7× slower |
| Send acknowledgement | 18.8 ms | 33.8 ms | 1.8× slower |
| Event delivery | 19.0 ms | 33.8 ms | 1.8× slower |

## Interpretation

The tested profile did not lose messages or fail during reconnect. The main scaling pressure is connection establishment, not steady-state event delivery. A staging test with authenticated Edge Function actions should be run before increasing beyond this profile, especially to measure authoritative state writes, action-log inserts, and per-game concurrency limits.

The run used ephemeral Supabase Realtime Broadcast topics and did not create production game rooms, player rows, or game results.
