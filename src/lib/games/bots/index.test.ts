import test from 'node:test';
import assert from 'node:assert/strict';
import { BOT_DIFFICULTIES, botProfile, chessBotMove, connect4BotColumn, drawBotGuess, ludoBotPiece, partyBotAnswer, tictactoeBotMove, unoBotCard } from './index.ts';
import { createChessState } from '../chess/rules.ts';
import { createLudoState, rollDice } from '../ludo/rules.ts';
import { firstRound } from '../party/rules.ts';

test('bot profiles scale response and mistake behavior', () => {
  assert.deepEqual(BOT_DIFFICULTIES, ['easy','cruise','pro','elite']);
  assert.ok(botProfile('easy').mistakeRate > botProfile('elite').mistakeRate);
  assert.ok(botProfile('easy').responseMs < botProfile('elite').responseMs);
});

test('tic tac toe and connect four bots take winning moves', () => {
  assert.equal(tictactoeBotMove(['X','X',null,'O',null,null,null,null,null], 'X', 'elite', () => 0), 2);
  const board=Array.from({length:6},()=>Array(7).fill(null));
  board[5][0]='R';board[5][1]='R';board[5][2]='R';
  assert.equal(connect4BotColumn(board,'R','elite',()=>0),3);
});

test('chess bot returns a legal move and ludo bot returns a movable piece', () => {
  const chess=createChessState();
  const move=chessBotMove(chess,'white','cruise',()=>0);
  assert.ok(move);
  const ludo=createLudoState({matchId:'m',roomId:'r',players:[{id:'bot',displayName:'Cruise Bot'}]});
  rollDice(ludo,'bot',()=>0.999);
  assert.ok(ludoBotPiece(ludo,'bot','cruise',()=>0));
});

test('party bot answers correctly at elite difficulty', () => {
  const round=firstRound('kahoot');
  assert.equal(partyBotAnswer(round,'elite',()=>0),round.answer);
});

test('UNO and drawing adapters scale from uncertain to accurate play', () => {
  const cards=[{id:'number',kind:'number' as const,value:3},{id:'wild',kind:'wild' as const}];
  assert.equal(unoBotCard(cards,'elite',()=>0)?.id,'wild');
  assert.equal(drawBotGuess('sun','elite',()=>0),'sun');
  assert.equal(drawBotGuess('sun','easy',()=>0),'cruise');
});
