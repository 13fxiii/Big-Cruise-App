import test from 'node:test';
import assert from 'node:assert/strict';
import { clearUnoSession, loadUnoSession, saveUnoSession, UNO_SESSION_KEY } from './session.ts';

// Minimal sessionStorage polyfill for node tests
const store = new Map<string, string>();
(globalThis as { sessionStorage?: Storage }).sessionStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => { store.set(k, v); },
  removeItem: (k: string) => { store.delete(k); },
  clear: () => store.clear(),
  key: () => null,
  length: 0,
};

test('save and load UNO session', () => {
  store.clear();
  saveUnoSession({ roomId: 'rid-1', code: 'ABC123' });
  assert.deepEqual(loadUnoSession(), { roomId: 'rid-1', code: 'ABC123' });
  assert.ok(store.get(UNO_SESSION_KEY));
});

test('clear UNO session', () => {
  store.clear();
  saveUnoSession({ roomId: 'rid-2', code: 'XYZ999' });
  clearUnoSession();
  assert.equal(loadUnoSession(), null);
});

test('load returns null for corrupt payload', () => {
  store.clear();
  store.set(UNO_SESSION_KEY, '{bad');
  assert.equal(loadUnoSession(), null);
});
