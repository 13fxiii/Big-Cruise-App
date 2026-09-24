export type GameStatus = 'playable' | 'coming-soon';
export type CruiseGame = { id: string; name: string; icon: string; description: string; status: GameStatus; accent: string; featuredDays: string[] };

export const GAMES: CruiseGame[] = [
  { id: 'uno', name: 'UNO', icon: '🃏', description: 'Real-time card battles with your Cruise crew.', status: 'playable', accent: '#ff3b30', featuredDays: ['mcm','titty-tuesday','wild-n-out-sunday'] },
  { id: 'ludo', name: 'Ludo', icon: '🎲', description: 'Race your pieces home and take the Cruise.', status: 'playable', accent: '#ffd400', featuredDays: ['throwback-thursday'] },
  { id: 'tictactoe', name: 'Tic-Tac-Toe', icon: '⭕', description: 'Quick marks. Big energy. First to three.', status: 'playable', accent: '#22d3ee', featuredDays: ['mcm'] },
  { id: 'connect4', name: 'Connect Four', icon: '🔴', description: 'Drop four in a row before they do.', status: 'playable', accent: '#ef3340', featuredDays: ['throwback-thursday'] },
  { id: 'werewolf', name: 'Werewolf', icon: '🐺', description: 'Lie, investigate and survive the night.', status: 'playable', accent: '#7c3aed', featuredDays: ['wild-n-out-sunday'] },
  { id: 'chess', name: 'Chess', icon: '♟️', description: 'Classic strategy, BIG CRUISE style.', status: 'playable', accent: '#e5e7eb', featuredDays: ['mcm'] },
  { id: 'draw-it-out', name: 'Draw It Out', icon: '🎨', description: 'Draw fast. Guess faster. Make noise.', status: 'playable', accent: '#06b6d4', featuredDays: ['wcw'] },
  { id: 'codenames', name: 'Codenames', icon: '🕵🏾', description: 'Give clues. Read minds. Find your team.', status: 'playable', accent: '#22c55e', featuredDays: ['secret-messages-saturday'] },
  { id: 'word-guess', name: 'Word Guess', icon: '🔤', description: 'Crack the word before the Cruise moves on.', status: 'playable', accent: '#f59e0b', featuredDays: ['throwback-thursday'] },
  { id: 'karaoke', name: 'Karaoke', icon: '🎤', description: 'Grab the mic and embarrass your friends.', status: 'playable', accent: '#ec4899', featuredDays: ['friday-nmf'] },
  { id: 'truth-or-dare', name: 'Truth or Dare', icon: '🔥', description: 'Questions, dares and community chaos.', status: 'playable', accent: '#ef4444', featuredDays: ['titty-tuesday','wild-n-out-sunday'] },
  { id: 'kahoot', name: 'Kahoot', icon: '🧠', description: 'Fast quizzes for the whole community.', status: 'playable', accent: '#8b5cf6', featuredDays: ['friday-nmf'] },
];

export const MERCH_NAV = { id: 'merch', name: 'Merch', icon: '🛍️' } as const;
