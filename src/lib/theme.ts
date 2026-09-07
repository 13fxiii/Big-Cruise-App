export type WeeklyTheme = {
  id: string;
  shortLabel: string;
  displayName: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  icon: string;
  typeClass: string;
};

const themes: WeeklyTheme[] = [
  { id: 'sunday', shortLabel: 'SUNDAY', displayName: 'Sunday Cruise', accent: '#ffd400', accentStrong: '#ffe45c', accentSoft: '#ffd40022', icon: '〽️', typeClass: 'theme-default' },
  { id: 'mcm', shortLabel: 'MCM', displayName: 'Men Crush Monday', accent: '#ff4f8b', accentStrong: '#ff79a9', accentSoft: '#ff4f8b22', icon: '♥︎', typeClass: 'theme-mcm' },
  { id: 'tuesday', shortLabel: 'TUE', displayName: 'Cruise Tuesday', accent: '#ffd400', accentStrong: '#ffe45c', accentSoft: '#ffd40022', icon: '✦', typeClass: 'theme-default' },
  { id: 'wednesday', shortLabel: 'WED', displayName: 'Weekly Cruise Wednesday', accent: '#ffd400', accentStrong: '#ffe45c', accentSoft: '#ffd40022', icon: '✦', typeClass: 'theme-default' },
  { id: 'thursday', shortLabel: 'THU', displayName: 'Throwback Thursday', accent: '#ffd400', accentStrong: '#ffe45c', accentSoft: '#ffd40022', icon: '↺', typeClass: 'theme-default' },
  { id: 'friday', shortLabel: 'FRI', displayName: 'Friday Cruise', accent: '#ffd400', accentStrong: '#ffe45c', accentSoft: '#ffd40022', icon: '✦', typeClass: 'theme-default' },
  { id: 'saturday', shortLabel: 'SAT', displayName: 'Saturday Cruise', accent: '#ffd400', accentStrong: '#ffe45c', accentSoft: '#ffd40022', icon: '〽️', typeClass: 'theme-default' },
];

export function getWeeklyTheme(date: Date): WeeklyTheme {
  return themes[date.getDay()] ?? themes[0];
}
