import { supabase } from '../supabase';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL || 'https://qdeozgkmrqectbuhetvc.supabase.co'}/functions/v1/paystack-checkout`;

async function call(action: 'initialize' | 'verify', orderId: string, reference?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Please sign in again.');
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, orderId, ...(reference ? { reference } : {}) }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Payment request failed.');
  return payload as {
    ok: boolean;
    orderId: string;
    status?: string;
    reference?: string;
    authorizationUrl?: string;
    accessCode?: string;
  };
}

export function initializePaystack(orderId: string) {
  return call('initialize', orderId);
}

export function verifyPaystack(orderId: string, reference?: string) {
  return call('verify', orderId, reference);
}
