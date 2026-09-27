import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || 'https://qdeozgkmrqectbuhetvc.supabase.co';
const key = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jM4eku7b7m_GG264BCMeyg_Uv_uTuKk';
const games = ['uno', 'ludo', 'chess', 'tictactoe', 'connect4', 'werewolf', 'codenames', 'word-guess', 'karaoke', 'truth-or-dare', 'kahoot', 'draw-it-out'];
const playersPerGame = Number(process.env.LOAD_PLAYERS || 4);
const actionsPerPlayer = Number(process.env.LOAD_ACTIONS || 3);
const timeoutMs = Number(process.env.LOAD_TIMEOUT_MS || 15000);
const runId = `load-${Date.now().toString(36)}`;
const clients = [];
const channels = [];
const result = { runId, games: games.length, playersPerGame, actionsPerPlayer, attemptedActions: games.length * playersPerGame * actionsPerPlayer, deliveredEvents: 0, expectedEvents: games.length * playersPerGame * actionsPerPlayer * playersPerGame, subscribeMs: [], sendMs: [], deliveryMs: [], reconnect: null, errors: [] };

const percentile = (values, p) => { const sorted = [...values].sort((a, b) => a - b); return sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : null; };
const now = () => performance.now();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectPlayer(game, player) {
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, realtime: { params: { eventsPerSecond: 100 } } });
  const topic = `loadtest:${runId}:${game}`;
  const channel = client.channel(topic, { config: { broadcast: { ack: true, self: true } } });
  const started = now();
  channel.on('broadcast', { event: 'action' }, (payload) => {
    result.deliveredEvents += 1;
    const sentAt = Number(payload.payload?.sentAt);
    if (Number.isFinite(sentAt)) result.deliveryMs.push(now() - sentAt);
  });
  const status = await new Promise((resolve) => {
    const timer = setTimeout(() => resolve('TIMEOUT'), timeoutMs);
    channel.subscribe((value) => { if (value === 'SUBSCRIBED' || value === 'CHANNEL_ERROR' || value === 'TIMED_OUT') { clearTimeout(timer); resolve(value); } });
  });
  result.subscribeMs.push(now() - started);
  if (status !== 'SUBSCRIBED') throw new Error(`${game}/player-${player} subscribe ${status}`);
  clients.push(client); channels.push(channel);
  return { game, player, channel };
}

async function sendAction(peer, actionNo) {
  const sentAt = now();
  const response = await peer.channel.send({ type: 'broadcast', event: 'action', payload: { game: peer.game, actionId: `${runId}:${peer.game}:${peer.player}:${actionNo}`, actionType: 'mobile.optimistic', baseVersion: actionNo, sentAt } });
  result.sendMs.push(now() - sentAt);
  if (response !== 'ok') throw new Error(`${peer.game}/player-${peer.player} send ${response}`);
}

async function main() {
  const peers = (await Promise.all(games.flatMap((game) => Array.from({ length: playersPerGame }, (_, player) => connectPlayer(game, player))))).flat();
  await wait(300);
  for (let round = 0; round < actionsPerPlayer; round += 1) {
    await Promise.all(peers.map((peer) => sendAction(peer, round)));
    await wait(250);
  }
  await wait(1000);
  const reconnectPeer = peers[0];
  const reconnectStarted = now();
  await reconnectPeer.channel.unsubscribe();
  const reconnectClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, realtime: { params: { eventsPerSecond: 100 } } });
  const reconnectChannel = reconnectClient.channel(`loadtest:${runId}:reconnect`, { config: { broadcast: { ack: true, self: true } } });
  const reconnectStatus = await new Promise((resolve) => {
    const timer = setTimeout(() => resolve('TIMEOUT'), timeoutMs);
    reconnectChannel.subscribe((value) => { if (value === 'SUBSCRIBED' || value === 'CHANNEL_ERROR' || value === 'TIMED_OUT') { clearTimeout(timer); resolve(value); } });
  });
  result.reconnect = { status: reconnectStatus, ms: now() - reconnectStarted };
  if (reconnectStatus !== 'SUBSCRIBED') result.errors.push(`reconnect ${reconnectStatus}`);
  if (reconnectStatus === 'SUBSCRIBED') {
    const reconnectSentAt = now();
    const reconnectResponse = await reconnectChannel.send({ type: 'broadcast', event: 'action', payload: { actionId: `${runId}:reconnect`, actionType: 'reconnect.replay', baseVersion: 0, sentAt: reconnectSentAt } });
    result.reconnect.send = reconnectResponse;
    result.reconnect.sendMs = now() - reconnectSentAt;
  }
  await wait(300);
  result.deliveryRatio = result.expectedEvents ? result.deliveredEvents / result.expectedEvents : 0;
  result.subscribeP50Ms = percentile(result.subscribeMs, 0.5);
  result.subscribeP95Ms = percentile(result.subscribeMs, 0.95);
  result.sendP50Ms = percentile(result.sendMs, 0.5);
  result.sendP95Ms = percentile(result.sendMs, 0.95);
  result.deliveryP50Ms = percentile(result.deliveryMs, 0.5);
  result.deliveryP95Ms = percentile(result.deliveryMs, 0.95);
  result.pass = result.errors.length === 0 && result.deliveredEvents === result.expectedEvents && reconnectStatus === 'SUBSCRIBED';
  console.log(JSON.stringify(result, null, 2));
  await reconnectChannel.unsubscribe();
  for (const channel of channels) await channel.unsubscribe();
  for (const client of clients) client.removeAllChannels();
  process.exitCode = result.pass ? 0 : 1;
}

const timer = setTimeout(() => { result.errors.push(`global timeout after ${timeoutMs}ms`); result.pass = false; console.log(JSON.stringify(result, null, 2)); process.exit(1); }, timeoutMs * 4 + 10000);
main().catch((error) => { result.errors.push(error instanceof Error ? error.message : String(error)); result.pass = false; console.log(JSON.stringify(result, null, 2)); process.exitCode = 1; }).finally(() => clearTimeout(timer));
