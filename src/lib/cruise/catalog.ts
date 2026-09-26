export type GameStatus = 'playable' | 'coming-soon';
export type GameCategory = 'cards'|'boards'|'party'|'strategy'|'quick';
export type CruiseGame = {
  id: string; name: string; icon: string; description: string; status: GameStatus; accent: string;
  featuredDays: string[]; category: GameCategory; players: string; duration: string; badge?: 'HOT'|'NEW';
};

export const GAMES: CruiseGame[] = [
  { id:'uno', name:'UNO', icon:'🃏', description:'Real-time card battles with your Cruise crew.', status:'playable', accent:'#ff3b30', featuredDays:['mcm','titty-tuesday','wild-n-out-sunday'], category:'cards', players:'2–4', duration:'10 min', badge:'HOT' },
  { id:'ludo', name:'Ludo', icon:'🎲', description:'Race your pieces home and take the Cruise.', status:'playable', accent:'#ffd400', featuredDays:['throwback-thursday'], category:'boards', players:'2–4', duration:'15 min' },
  { id:'tictactoe', name:'Tic-Tac-Toe', icon:'⭕', description:'Quick marks. Big energy. First to three.', status:'playable', accent:'#22d3ee', featuredDays:['mcm'], category:'quick', players:'2', duration:'3 min' },
  { id:'connect4', name:'Connect Four', icon:'🔴', description:'Drop four in a row before they do.', status:'playable', accent:'#ef3340', featuredDays:['throwback-thursday'], category:'boards', players:'2', duration:'8 min' },
  { id:'werewolf', name:'Werewolf', icon:'🐺', description:'Lie, investigate and survive the night.', status:'playable', accent:'#7c3aed', featuredDays:['wild-n-out-sunday'], category:'party', players:'3–8', duration:'20 min', badge:'HOT' },
  { id:'chess', name:'Chess', icon:'♟️', description:'Classic strategy, BIG CRUISE style.', status:'playable', accent:'#e5e7eb', featuredDays:['mcm'], category:'strategy', players:'2', duration:'20 min' },
  { id:'draw-it-out', name:'Draw It Out', icon:'🎨', description:'Draw fast. Guess faster. Make noise.', status:'playable', accent:'#06b6d4', featuredDays:['wcw'], category:'party', players:'2–8', duration:'10 min' },
  { id:'codenames', name:'Codenames', icon:'🕵🏾', description:'Give clues. Read minds. Find your team.', status:'playable', accent:'#22c55e', featuredDays:['secret-messages-saturday'], category:'party', players:'4–8', duration:'20 min' },
  { id:'word-guess', name:'Word Guess', icon:'🔤', description:'Crack the word before the Cruise moves on.', status:'playable', accent:'#f59e0b', featuredDays:['throwback-thursday'], category:'quick', players:'1–4', duration:'5 min', badge:'NEW' },
  { id:'karaoke', name:'Karaoke', icon:'🎤', description:'Grab the mic and embarrass your friends.', status:'playable', accent:'#ec4899', featuredDays:['friday-nmf'], category:'party', players:'2–8', duration:'15 min' },
  { id:'truth-or-dare', name:'Truth or Dare', icon:'🔥', description:'Questions, dares and community chaos.', status:'playable', accent:'#ef4444', featuredDays:['titty-tuesday','wild-n-out-sunday'], category:'party', players:'3–10', duration:'15 min', badge:'HOT' },
  { id:'kahoot', name:'Kahoot', icon:'🧠', description:'Fast quizzes for the whole community.', status:'playable', accent:'#8b5cf6', featuredDays:['friday-nmf'], category:'quick', players:'1–8', duration:'8 min', badge:'NEW' },
  { id:'othello', name:'Othello', icon:'⚫', description:'Flip the board with patient Cruise Bot strategy.', status:'playable', accent:'#22c55e', featuredDays:['dominion-state'], category:'strategy', players:'1–2', duration:'15 min' },
  { id:'gomoku', name:'Gomoku', icon:'✕', description:'Build five in a line before the bot does.', status:'playable', accent:'#f97316', featuredDays:['dominion-state'], category:'strategy', players:'1–2', duration:'10 min' },
  { id:'mancala', name:'Mancala', icon:'🟤', description:'Count the moves and own the pits.', status:'playable', accent:'#c08457', featuredDays:['echo-era'], category:'strategy', players:'1–2', duration:'12 min' },
  { id:'word-hunt', name:'Word Hunt', icon:'🔎', description:'Trace words across a compact mobile board.', status:'playable', accent:'#3dfff2', featuredDays:['play-your-vibe'], category:'quick', players:'1–4', duration:'5 min' },
];

export const MERCH_NAV = { id:'merch', name:'Merch', icon:'🛍️' } as const;
