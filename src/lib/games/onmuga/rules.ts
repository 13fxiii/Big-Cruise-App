export type Mark='X'|'O';
export type TicState={board:(Mark|null)[];turn:Mark;winner:Mark|'draw'|null};
export function createTicState():TicState{return{board:Array(9).fill(null),turn:'X',winner:null}}
const ticLines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export function ticWinner(board:(Mark|null)[]):Mark|'draw'|null{for(const [a,b,c] of ticLines)if(board[a]&&board[a]===board[b]&&board[a]===board[c])return board[a];return board.every(Boolean)?'draw':null}
export function ticMove(s:TicState,index:number,mark:Mark):TicState{if(s.winner)throw Error('Match is complete');if(mark!==s.turn)throw Error('Not your turn');if(!Number.isInteger(index)||index<0||index>8||s.board[index])throw Error('Illegal move');const board=[...s.board];board[index]=mark;return{board,turn:mark==='X'?'O':'X',winner:ticWinner(board)}}
export type ConnectState={board:(('R'|'Y')|null)[][];turn:'R'|'Y';winner:'R'|'Y'|'draw'|null};
export function createConnectState():ConnectState{return{board:Array.from({length:6},()=>Array(7).fill(null)),turn:'R',winner:null}}
export function connectDrop(s:ConnectState,column:number,piece:'R'|'Y'):ConnectState{if(s.winner)throw Error('Match is complete');if(piece!==s.turn)throw Error('Not your turn');if(!Number.isInteger(column)||column<0||column>6)throw Error('Illegal column');const board=s.board.map(row=>[...row]);let row=-1;for(let r=5;r>=0;r--)if(!board[r][column]){row=r;break}if(row<0)throw Error('Column is full');board[row][column]=piece;return{board,turn:piece==='R'?'Y':'R',winner:connectWinner(board)}}
export function connectWinner(board:ConnectState['board']):ConnectState['winner']{const dirs=[[0,1],[1,0],[1,1],[1,-1]];for(let r=0;r<6;r++)for(let c=0;c<7;c++){const p=board[r][c];if(!p)continue;for(const [dr,dc] of dirs){let n=1;for(let k=1;k<4;k++)if(board[r+dr*k]?.[c+dc*k]===p)n++;else break;if(n>=4)return p}}return board.every(row=>row.every(Boolean))?'draw':null}
export type DrawStroke={x:number;y:number;color:string;size:number;tool:'begin'|'move'|'end'|'clear'};
export type DrawState={round:number;drawerId:string|null;word:string|null;roundActive:boolean;strokes:DrawStroke[];guesses:{playerId:string;text:string}[];winnerId:string|null};
export const DRAW_WORDS=['cat','house','tree','car','guitar','pizza','robot','sun','dragon','bicycle'];
export function createDrawState():DrawState{return{round:0,drawerId:null,word:null,roundActive:false,strokes:[],guesses:[],winnerId:null}}
export function normalizeGuess(value:string){return value.trim().toLocaleLowerCase()}
export function drawGuess(s:DrawState,playerId:string,text:string):DrawState{if(!s.roundActive||!text.trim())throw Error('Round is not active');const guesses=[...s.guesses,{playerId,text:text.trim()}];const winner=normalizeGuess(text)===normalizeGuess(s.word||'')&&playerId!==s.drawerId?playerId:null;return{...s,guesses,roundActive:winner?false:s.roundActive,winnerId:winner}}
export function publicDrawState(s:DrawState,isDrawer:boolean):Omit<DrawState,'word'>&{word:string|null}{return{...s,word:isDrawer?s.word:null,strokes:s.strokes.map(x=>({...x})),guesses:s.guesses.map(x=>({...x}))}}
export function startDrawRound(s:DrawState,drawerId:string,word:string):DrawState{return{...s,round:s.round+1,drawerId,word,roundActive:true,strokes:[],guesses:[],winnerId:null}}
