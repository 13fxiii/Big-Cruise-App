export type PartyGame = 'werewolf'|'codenames'|'word-guess'|'karaoke'|'truth-or-dare'|'kahoot';
export type PartyRound = { prompt:string; options:string[]; answer:string; category:string };

const rounds: Record<PartyGame, PartyRound[]> = {
  werewolf: [{prompt:'The village heard a howl near the docks. Who do you investigate?', options:['The quiet sailor','The loud captain','The new guest'], answer:'The quiet sailor', category:'NIGHT INVESTIGATION'}],
  codenames: [{prompt:'Your clue is OCEAN. Which word belongs to your team?', options:['WAVE','MOUSE','CROWN'], answer:'WAVE', category:'TEAM CLUE'}],
  'word-guess': [{prompt:'Guess the five-letter word from the clue: something you ride on water.', options:['BOARD','TRAIN','CLOUD'], answer:'BOARD', category:'WORD GUESS'}],
  karaoke: [{prompt:'Pick the next BIG CRUISE karaoke energy.', options:['90s R&B','Afrobeats','Dancehall'], answer:'Afrobeats', category:'KARAOKE ROUND'}],
  'truth-or-dare': [{prompt:'Choose your Cruise challenge.', options:['Truth: funniest travel story','Dare: dance for 10 seconds','Truth: secret talent'], answer:'Dare: dance for 10 seconds', category:'TRUTH OR DARE'}],
  kahoot: [{prompt:'Which game has four tokens racing home?', options:['Ludo','Chess','Codenames'], answer:'Ludo', category:'CRUISE QUIZ'}],
};

export function firstRound(game: PartyGame): PartyRound { return rounds[game][0]; }
export function scoreAnswer(round: PartyRound, answer: string): number { return answer === round.answer ? 100 : 0; }
export function botAnswer(round: PartyRound): string { return round.options.find(option => option === round.answer) || round.options[0]; }
export function nextRound(game: PartyGame): PartyRound { return firstRound(game); }
