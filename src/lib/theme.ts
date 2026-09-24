export type CruiseDay = WeeklyTheme & {
  weekday: string;
  image: string;
  motif: string;
  mood: string;
  accentAlt: string;
  subthemes: string[];
};

export type WeeklyTheme = {
  id: string;
  shortLabel: string;
  displayName: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  icon: string;
  typeClass: string;
  brandBase: string;
  description: string;
  challenge: string;
  featuredGames: string[];
};

const day = (config: CruiseDay): CruiseDay => config;

export const CRUISE_DAYS: CruiseDay[] = [
  day({ id:'dominion-state', weekday:'MONDAY', shortLabel:'DOMINION', displayName:'DOMINION STATE', accent:'#7A1F33', accentAlt:'#C48A5A', accentStrong:'#D6A278', accentSoft:'#7A1F3330', typeClass:'theme-dominion', brandBase:'#F5C400', icon:'▥', image:'/assets/cruise-days/mon.jpg', motif:'/assets/cruise-days/motif-mon.svg', mood:'Power is quiet. Power is earned.', description:'Earn your seat. Move with intention. Quiet power, loud results.', challenge:'Win a game with a clean sweep and hold the line.', featuredGames:['chess','codenames'], subthemes:['DOMINION STATE','THE MEN’S CODE','SILENT WINNERS','BUILT DIFFERENT','LEGACY MODE','PRIME TIME','THE STAND'] }),
  day({ id:'no-filter-energy', weekday:'TUESDAY', shortLabel:'NO FILTER', displayName:'NO FILTER ENERGY', accent:'#FF2B6B', accentAlt:'#FFF200', accentStrong:'#FF6F99', accentSoft:'#FF2B6B30', typeClass:'theme-no-filter', brandBase:'#F5C400', icon:'//', image:'/assets/cruise-days/tue.jpg', motif:'/assets/cruise-days/motif-tue.svg', mood:'No filter energy. Unapologetic.', description:'Turn the volume up, pick your angle and say it with chest.', challenge:'Pull up, pick a side and survive the hot seat.', featuredGames:['truth-or-dare','kahoot'], subthemes:['TOO LIT TO STRESS','FLIRT FREQUENCY','SHOT CLOCK','HOT SEAT','REALITY CHECK','ATTRACTION INDEX','AFTER DARK CONFESSIONS'] }),
  day({ id:'she-moves-different', weekday:'WEDNESDAY', shortLabel:'DIVINE ENERGY', displayName:'SHE MOVES DIFFERENT', accent:'#C45A72', accentAlt:'#E6C8B4', accentStrong:'#E4879D', accentSoft:'#C45A7230', typeClass:'theme-divine', brandBase:'#F5C400', icon:'⌒', image:'/assets/cruise-days/wed.jpg', motif:'/assets/cruise-days/motif-wed.svg', mood:'Soft power. Main character energy.', description:'The room shifts when she arrives. Choose your move and own it.', challenge:'Make a bold play, then spotlight the person carrying the vibe.', featuredGames:['draw-it-out','werewolf'], subthemes:['DIVINE ENERGY','SHE MOVES DIFFERENT','SOFT POWER','MAIN CHARACTER','HER ERA','THE CIRCLE','UNFINISHED WOMAN'] }),
  day({ id:'echo-era', weekday:'THURSDAY', shortLabel:'ECHO ERA', displayName:'ECHO ERA', accent:'#C4A574', accentAlt:'#F2E6D0', accentStrong:'#DCC398', accentSoft:'#C4A57430', typeClass:'theme-echo', brandBase:'#F5C400', icon:'◌', image:'/assets/cruise-days/thu.jpg', motif:'/assets/cruise-days/motif-thu.svg', mood:'Back when it was real.', description:'Old school energy, familiar stories and a new score to settle.', challenge:'Take the throwback route and beat the memory lane timer.', featuredGames:['ludo','word-guess'], subthemes:['BACK WHEN IT WAS REAL','OLD SCHOOL','SMALL SMALL','CLASSIC FREQUENCY','THE ALBUM','FIRST LOVES','NAIJA NOSTALGIA NET'] }),
  day({ id:'play-your-vibe', weekday:'FRIDAY', shortLabel:'PLAY YOUR VIBE', displayName:'PLAY YOUR VIBE', accent:'#6A2C91', accentAlt:'#3DFFF2', accentStrong:'#9B5BC0', accentSoft:'#6A2C9130', typeClass:'theme-vibe', brandBase:'#F5C400', icon:'▮', image:'/assets/cruise-days/fri.jpg', motif:'/assets/cruise-days/motif-fri.svg', mood:'Fresh heat. Sound of the culture.', description:'Bring your sound, find your people and let the room catch the rhythm.', challenge:'Hit the board, hit the beat and climb the Friday score.', featuredGames:['karaoke','kahoot'], subthemes:['PLAY YOUR VIBE','FRESH HEAT','OPEN VERSE','THE BAG','LOG DRUM','BATTLE DECK','AFTER THE SPACE'] }),
  day({ id:'read-between-the-lines', weekday:'SATURDAY', shortLabel:'BETWEEN LINES', displayName:'READ BETWEEN THE LINES', accent:'#9B1228', accentAlt:'#9A7B12', accentStrong:'#C3344D', accentSoft:'#9B122830', typeClass:'theme-lines', brandBase:'#F5C400', icon:'▤', image:'/assets/cruise-days/sat.jpg', motif:'/assets/cruise-days/motif-sat.svg', mood:'Feel it. Don’t send it.', description:'Unsent thoughts, hidden clues and a little mystery in the margins.', challenge:'Read the room, protect the secret and make your move.', featuredGames:['codenames','truth-or-dare'], subthemes:['READ BETWEEN THE LINES','UNSENT','ANONYMOUS DROP','DATING PALAVA','DELETE YOUR MATCH','02:00','THE QUIET WANT'] }),
  day({ id:'chaos-culture', weekday:'SUNDAY', shortLabel:'CHAOS CULTURE', displayName:'CHAOS CULTURE', accent:'#C8F542', accentAlt:'#FF4D1A', accentStrong:'#E1FF75', accentSoft:'#C8F54230', typeClass:'theme-chaos', brandBase:'#F5C400', icon:'✳', image:'/assets/cruise-days/sun.jpg', motif:'/assets/cruise-days/motif-sun.svg', mood:'No rules. No limits. Just chaos.', description:'Roast protocol active. Pick a wildcard and leave the room louder.', challenge:'Survive the gauntlet, collect the laugh and take the crown.', featuredGames:['werewolf','truth-or-dare','uno'], subthemes:['CHAOS CULTURE','NO RULES','ROAST PROTOCOL','MEME BATTALION','DARK HOUR','THE GAUNTLET','WILD CARD'] }),
];

export function getWeeklyTheme(date: Date): CruiseDay {
  return CRUISE_DAYS[(date.getDay() + 6) % 7] ?? CRUISE_DAYS[0];
}
