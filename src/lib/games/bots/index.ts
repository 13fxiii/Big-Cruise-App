import { legalMoves, type ChessColor, type ChessMove, type ChessState } from '../chess/rules.ts';
import { absoluteTrackPosition, canPieceMove, type LudoState } from '../ludo/rules.ts';
import type { PartyGame, PartyRound } from '../party/rules.ts';

export type BotDifficulty = 'easy'|'cruise'|'pro'|'elite';
export type BotGame = 'uno'|'ludo'|'tictactoe'|'connect4'|'werewolf'|'chess'|'draw-it-out'|'codenames'|'word-guess'|'karaoke'|'truth-or-dare'|'kahoot';
export type BotProfile = { difficulty:BotDifficulty; label:string; mistakeRate:number; responseMs:number; lookahead:number };

const profiles:Record<BotDifficulty,BotProfile>={
  easy:{difficulty:'easy',label:'Easy',mistakeRate:.45,responseMs:450,lookahead:0},
  cruise:{difficulty:'cruise',label:'Cruise',mistakeRate:.24,responseMs:700,lookahead:1},
  pro:{difficulty:'pro',label:'Pro',mistakeRate:.1,responseMs:950,lookahead:2},
  elite:{difficulty:'elite',label:'Elite',mistakeRate:0,responseMs:1250,lookahead:4},
};
export function botProfile(difficulty:BotDifficulty):BotProfile { return profiles[difficulty]; }
export const BOT_DIFFICULTIES:BotDifficulty[]=['easy','cruise','pro','elite'];
export function botProfileFor(game:BotGame,difficulty:BotDifficulty):BotProfile & {game:BotGame} { return {...profiles[difficulty],game}; }

const pick=<T>(items:T[],random:()=>number):T=>items[Math.floor(random()*items.length)] ?? items[0];
export function partyBotAnswer(round:PartyRound,difficulty:BotDifficulty,random:()=>number=Math.random):string {
  const profile=botProfile(difficulty);
  if (random()<profile.mistakeRate) return pick(round.options.filter(option=>option!==round.answer),random);
  return round.answer;
}

function winningTtt(board:(string|null)[],mark:string):number|null { for(let i=0;i<9;i++) if(!board[i]){const copy=[...board];copy[i]=mark;if([[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]].some(line=>line.every(index=>copy[index]===mark)))return i;} return null; }
export function tictactoeBotMove(board:(string|null)[],botMark:'X'|'O',difficulty:BotDifficulty,random:()=>number=Math.random):number {
  const open=board.map((value,index)=>value?null:index).filter((value):value is number=>value!==null);if(!open.length)return -1;
  if(random()<botProfile(difficulty).mistakeRate)return pick(open,random);
  const win=winningTtt(board,botMark);if(win!==null)return win;
  const block=winningTtt(board,botMark==='X'?'O':'X');if(block!==null)return block;
  if(board[4]===null)return 4;
  return open.sort((a,b)=>Math.abs(4-a)-Math.abs(4-b))[0];
}

export function connect4BotColumn(board:(string|null)[][],botMark:'R'|'Y',difficulty:BotDifficulty,random:()=>number=Math.random):number {
  const open=Array.from({length:7},(_,column)=>column).filter(column=>board[0]?.[column]===null);if(!open.length)return -1;
  if(random()<botProfile(difficulty).mistakeRate)return open[Math.floor(random()*open.length)];
  const test=(mark:'R'|'Y')=>open.find(column=>{const copy=board.map(row=>[...row]);for(let row=5;row>=0;row--)if(!copy[row][column]){copy[row][column]=mark;break}return connectWinner(copy,mark)});
  return test(botMark) ?? test(botMark==='R'?'Y':'R') ?? open.sort((a,b)=>Math.abs(3-a)-Math.abs(3-b))[0];
}
function connectWinner(board:(string|null)[][],mark:string):boolean {const dirs=[[0,1],[1,0],[1,1],[1,-1]];for(let row=0;row<6;row++)for(let col=0;col<7;col++)for(const [dr,dc] of dirs){let count=0;for(let step=0;step<4;step++)if(board[row+dr*step]?.[col+dc*step]===mark)count++;if(count===4)return true;}return false;}

const pieceValue:Record<string,number>={pawn:1,knight:3,bishop:3,rook:5,queen:9,king:100};
export function chessBotMove(state:ChessState,color:ChessColor,difficulty:BotDifficulty,random:()=>number=Math.random):ChessMove|null {
  const moves=legalMoves(state).filter(move=>state.board[move.from.row][move.from.col]?.color===color);if(!moves.length)return null;
  const scored=moves.map(move=>{const target=state.board[move.to.row][move.to.col];let score=(target?pieceValue[target.kind]*10:0)+(move.promotion?8:0)+(move.castle?1:0);if(difficulty==='elite'||difficulty==='pro')score+=Math.max(0,3-Math.abs(3.5-move.to.col));return {move,score};}).sort((a,b)=>b.score-a.score);
  const limit=difficulty==='elite'?1:difficulty==='pro'?Math.min(3,scored.length):difficulty==='cruise'?Math.min(6,scored.length):scored.length;return scored[Math.floor(random()*limit)].move;
}

export function ludoBotPiece(state:LudoState,botPlayerId:string,difficulty:BotDifficulty,random:()=>number=Math.random):string|null {
  const playerIndex=state.players.findIndex(player=>player.id===botPlayerId);if(playerIndex<0||state.dice===null)return null;const pieces=state.players[playerIndex].pieces.filter(piece=>canPieceMove(piece,state.dice!,playerIndex));if(!pieces.length)return null;
  if(random()<botProfile(difficulty).mistakeRate)return pick(pieces.map(piece=>piece.id),random);
  const ranked=pieces.map(piece=>{const next=piece.steps===-1?0:piece.steps+state.dice!;const track=absoluteTrackPosition(playerIndex,next);const capture=track!==null&&state.players.some((other,index)=>index!==playerIndex&&other.pieces.some(enemy=>absoluteTrackPosition(index,enemy.steps)===track));return {piece,score:next+(capture?20:0)+(next===58?100:0)};}).sort((a,b)=>b.score-a.score);return ranked[0].piece.id;
}

export function unoBotCard<T extends {color?:string;value?:string;kind?:string}>(cards:T[],difficulty:BotDifficulty,random:()=>number=Math.random):T|null {if(!cards.length)return null;if(random()<botProfile(difficulty).mistakeRate)return cards[Math.floor(random()*cards.length)];return [...cards].sort((a,b)=>Number(Boolean(b.kind||b.value))-Number(Boolean(a.kind||a.value)))[0];}
export function drawBotGuess(word:string,difficulty:BotDifficulty,random:()=>number=Math.random):string {if(random()<botProfile(difficulty).mistakeRate)return 'cruise';return word;}
