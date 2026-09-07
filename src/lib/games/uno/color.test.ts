import test from 'node:test';
import assert from 'node:assert/strict';
import { isUnoPlayableColor } from './color.ts';

test('accepts every UNO wild color', () => {
  for (const color of ['red', 'yellow', 'green', 'blue']) assert.equal(isUnoPlayableColor(color), true);
});

test('rejects non-playable wild colors', () => {
  assert.equal(isUnoPlayableColor('purple'), false);
  assert.equal(isUnoPlayableColor(''), false);
});
