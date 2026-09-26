import { io, type Socket } from 'socket.io-client';
import { supabase } from '../supabase';

const DEFAULT_REALTIME_URL = 'https://big-cruise-realtime-production.up.railway.app';
const REALTIME_URL = (import.meta.env.VITE_REALTIME_URL as string | undefined) || DEFAULT_REALTIME_URL;

let socket: Socket | null = null;
let tokenInUse = '';

export async function getRealtimeSocket(): Promise<Socket> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Authentication required');

  if (socket?.connected && tokenInUse === token) return socket;

  socket?.disconnect();
  tokenInUse = token;
  socket = io(REALTIME_URL, {
    transports: ['websocket', 'polling'],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
  });
  return socket;
}

export function closeRealtimeSocket() {
  socket?.disconnect();
  socket = null;
  tokenInUse = '';
}

export { REALTIME_URL };
