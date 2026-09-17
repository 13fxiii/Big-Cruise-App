import { supabase } from './supabase';

export type AiHostReply = { message: string; intent?: string };

export async function askAiHost(message: string): Promise<AiHostReply> {
  const trimmed = message.trim();
  if (!trimmed) throw new Error('Enter a message first.');
  if (trimmed.length > 1000) throw new Error('Keep your message under 1,000 characters.');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Sign in to talk to the Host.');

  const { data, error } = await supabase.functions.invoke('ai-host', {
    body: { message: trimmed },
  });
  if (error) throw error;
  if (!data?.message || typeof data.message !== 'string') {
    throw new Error('The Host is unavailable right now.');
  }
  return data as AiHostReply;
}
