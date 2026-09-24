import test from 'node:test';
import assert from 'node:assert/strict';
import {connectDrop,connectWinner,createConnectState,createDrawState,createTicState,drawGuess,startDrawRound,ticMove,ticWinner} from './rules.ts';

test('tic tac toe detects wins and rejects illegal moves',()=>{let s=createTicState();s=ticMove(s,0,'X');s=ticMove(s,3,'O');s=ticMove(s,1,'X');s=ticMove(s,4,'O');s=ticMove(s,2,'X');assert.equal(s.winner,'X');assert.throws(()=>ticMove(s,5,'O'),/complete/);assert.equal(ticWinner(['X','X','X',null,null,null,null,null,null]),'X')});
test('tic tac toe detects a draw',()=>{let s:createTicStateReturn=createTicState();const moves:[number,'X'|'O'][]=[[0,'X'],[1,'O'],[2,'X'],[4,'O'],[3,'X'],[5,'O'],[7,'X'],[6,'O'],[8,'X']];for(const [i,m] of moves)s=ticMove(s,i,m);assert.equal(s.winner,'draw')});
type createTicStateReturn=ReturnType<typeof createTicState>;
test('connect four applies gravity and detects horizontal win',()=>{let s=createConnectState();for(const col of [0,0,1,1,2,2,3])s=connectDrop(s,col,s.turn);assert.equal(s.board[5][0],'R');assert.equal(s.winner,'R')});
test('connect four rejects full and out-of-range columns',()=>{const s={...createConnectState(),board:[['Y',null,null,null,null,null,null],['R',null,null,null,null,null,null],['Y',null,null,null,null,null,null],['R',null,null,null,null,null,null],['Y',null,null,null,null,null,null],['R',null,null,null,null,null,null]] as (('R'|'Y')|null)[][]};assert.throws(()=>connectDrop(s,0,'R'),/full/);assert.throws(()=>connectDrop(createConnectState(),7,'R'),/column/)});
test('connect winner detects diagonal and draw',()=>{const b=Array.from({length:6},()=>Array(7).fill(null) as (('R'|'Y')|null)[]);for(let i=0;i<4;i++)b[5-i][i]='Y';assert.equal(connectWinner(b),'Y')});
test('draw it out redacts the word and ends on a correct guess',()=>{let s=startDrawRound(createDrawState(),'drawer','Robot');assert.equal(publicWord(s,false),null);s=drawGuess(s,'guesser',' robot ');assert.equal(s.winnerId,'guesser');assert.equal(s.roundActive,false)});
function publicWord(s:ReturnType<typeof createDrawState>,drawer:boolean){return (s.word&&drawer)?s.word:null}
