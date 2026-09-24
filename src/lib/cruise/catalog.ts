export type GameStatus = 'playable' | 'coming-soon';
export type CruiseGame = { id: string; name: string; icon: string; description: string; status: GameStatus; accent: string; featuredDays: string[] };

export const GAMES: CruiseGame[] = [
  { id: 'uno', name: 'UNO', icon: '🃏', description: 'Real-time card battles with your Cruise crew.', status: 'playable', accent: '#ff3b30', featuredDays: ['mcm','titty-tuesday','wild-n-out-sunday'] },
  { id: 'ludo', name: 'Ludo', icon: '🎲', description: 'Race your pieces home and take the Cruise.', status: 'playable', accent: '#ffd400', featuredDays: ['throwback-thursday'] },
  { id: 'werewolf', name: 'Werewolf', icon: '🐺', description: 'Lie, investigate and survive the night.', status: 'coming-soon', accent: '#7c3aed', featuredDays: ['wild-n-out-sunday'] },
  { id: 'chess', name: 'Chess', icon: '♟️', description: 'Classic strategy, BIG CRUISE style.', status: 'coming-soon', accent: '#e5e7eb', featuredDays: ['mcm'] },
  { id: 'draw-it-out', name: 'Draw It Out', icon: '🎨', description: 'Draw fast. Guess faster. Make noise.', status: 'coming-soon', accent: '#06b6d4', featuredDays: ['wcw'] },
  { id: 'codenames', name: 'Codenames', icon: '🕵🏾', description: 'Give clues. Read minds. Find your team.', status: 'coming-soon', accent: '#22c55e', featuredDays: ['secret-messages-saturday'] },
  { id: 'word-guess', name: 'Word Guess', icon: '🔤', description: 'Crack the word before the Cruise moves on.', status: 'coming-soon', accent: '#f59e0b', featuredDays: ['throwback-thursday'] },
  { id: 'karaoke', name: 'Karaoke', icon: '🎤', description: 'Grab the mic and embarrass your friends.', status: 'coming-soon', accent: '#ec4899', featuredDays: ['friday-nmf'] },
  { id: 'truth-or-dare', name: 'Truth or Dare', icon: '🔥', description: 'Questions, dares and community chaos.', status: 'coming-soon', accent: '#ef4444', featuredDays: ['titty-tuesday','wild-n-out-sunday'] },
  { id: 'kahoot', name: 'Kahoot', icon: '🧠', description: 'Fast quizzes for the whole community.', status: 'coming-soon', accent: '#8b5cf6', featuredDays: ['friday-nmf'] },
];

export const MERCH_NAV = { id: 'merch', name: 'Merch', icon: '🛍️' } as const;
