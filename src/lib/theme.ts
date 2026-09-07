export type WeeklyTheme = {
  id: string;
  shortLabel: string;
  displayName: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  icon: string;
  typeClass: string;
  description: string;
  challenge: string;
  featuredGames: string[];
};

const base = { accent: '#ffd400', accentStrong: '#ffe45c', accentSoft: '#ffd40022', typeClass: 'theme-default' };
const themes: WeeklyTheme[] = [
  { id:'mcm', shortLabel:'MCM', displayName:'Men Crush Monday', ...base, icon:'♥︎', description:'Celebrate the men making the Cruise move.', challenge:'Play a game with your crew and drop a shoutout.', featuredGames:['uno','chess'] },
  { id:'titty-tuesday', shortLabel:'TUESDAY', displayName:'Titty Tuesday', ...base, icon:'🍑', description:'The internet gets unserious.', challenge:'Complete today’s community challenge.', featuredGames:['uno','truth-or-dare'] },
  { id:'wcw', shortLabel:'WCW', displayName:'Women Crush Wednesday', ...base, icon:'♡', description:'Spotlight the women carrying the vibe.', challenge:'Nominate someone and play today’s featured game.', featuredGames:['draw-it-out','uno'] },
  { id:'throwback-thursday', shortLabel:'THROWBACK', displayName:'Throwback Thursday', ...base, icon:'↺', description:'Old school energy, new school gameplay.', challenge:'Beat the throwback challenge before midnight.', featuredGames:['ludo','word-guess'] },
  { id:'friday-nmf', shortLabel:'NMF', displayName:'Friday Playlist / NMF', ...base, icon:'♫', description:'New music and fresh Cruise energy.', challenge:'Play, discover and share today’s soundtrack.', featuredGames:['karaoke','kahoot'] },
  { id:'secret-messages-saturday', shortLabel:'SECRET', displayName:'Secret Messages Saturday', ...base, icon:'✉︎', description:'Say it without saying it.', challenge:'Send a message, then jump into a team game.', featuredGames:['codenames','uno'] },
  { id:'wild-n-out-sunday', shortLabel:'WILD', displayName:"Wild 'N' Out Sunday", ...base, icon:'🔥', description:'Banter, battles and maximum Cruise.', challenge:'Win a game and climb the Sunday leaderboard.', featuredGames:['werewolf','truth-or-dare','uno'] },
];

export function getWeeklyTheme(date: Date): WeeklyTheme {
  return themes[(date.getDay() + 6) % 7] ?? themes[0];
}
