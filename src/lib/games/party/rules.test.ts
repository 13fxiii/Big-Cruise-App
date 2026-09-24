import test from 'node:test';
import assert from 'node:assert/strict';
import { botAnswer, firstRound, scoreAnswer } from './rules.ts';

test('every party game has a playable round and options', () => {
  for (const game of ['werewolf','codenames','word-guess','karaoke','truth-or-dare','kahoot'] as const) {
    const round = firstRound(game);
    assert.ok(round.prompt);
    assert.ok(round.options.length >= 3);
    assert.ok(round.options.includes(round.answer));
    assert.equal(botAnswer(round), round.answer);
  }
});

test('party answers score deterministically', () => {
  const round = firstRound('kahoot');
  assert.equal(scoreAnswer(round, round.answer), 100);
  assert.equal(scoreAnswer(round, 'not an option'), 0);
});
