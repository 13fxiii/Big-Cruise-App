export const BIG_CRUISE_PLAYLIST={
  name:'BIG CRUISE CONTROL〽️',
  description:'The weekly BIG CRUISE〽️ sound system. Lagos energy, new voices, big vibes and zero skips.',
  url:'https://open.spotify.com/playlist/49E7k5sGcVOPGoWIfFicTY',
  embedUrl:'https://open.spotify.com/embed/playlist/49E7k5sGcVOPGoWIfFicTY?utm_source=generator&theme=0',
  records:27,
};

export type CruiseArtist={name:string;role:string;playlistTracks:string[];rankSignal:number;bio:string;accent:string};

// Spotify's public playlist page does not expose stream counts. rankSignal is a transparent
// playlist-presence proxy (track appearances + lead position), not a claim about Spotify streams.
export const CRUISE_ARTISTS:CruiseArtist[]=[
 {name:'Reborn knb',role:'Artist · lead',playlistTracks:['GANUSI'],rankSignal:10,bio:'Reborn energy for the front row of the Cruise.',accent:'#ffd400'},
 {name:'Biy Martins',role:'Artist · lead',playlistTracks:['Burn'],rankSignal:9,bio:'Heat, melody and a clean after-hours finish.',accent:'#ff4d6d'},
 {name:'B Mah',role:'Artist · lead',playlistTracks:['Vibe & Lies'],rankSignal:8,bio:'Smooth lines with a sharp edge.',accent:'#3dfff2'},
 {name:'Boy4real',role:'Artist · collaborator',playlistTracks:['Vibe & Lies'],rankSignal:7,bio:'A collaborative voice in the Cruise control room.',accent:'#9b5bc0'},
 {name:'Mojjarlistie',role:'Artist · lead',playlistTracks:['Uni Tshame Nhlokweni'],rankSignal:7,bio:'A distinct pulse for the discovery set.',accent:'#ff9f43'},
 {name:'DracularSA',role:'Artist · collaborator',playlistTracks:['Uni Tshame Nhlokweni'],rankSignal:6,bio:'Adds texture and night-drive energy.',accent:'#c8f542'},
 {name:'Stagar',role:'Artist · lead',playlistTracks:['Exodus'],rankSignal:6,bio:'A bold voice for the big-room moment.',accent:'#c3344d'},
 {name:'Bahd Msk',role:'Artist · collaborator',playlistTracks:['Exodus'],rankSignal:5,bio:'A strong feature for the late set.',accent:'#e6c8b4'},
 {name:'L2green',role:'Artist · lead',playlistTracks:['OLUWA'],rankSignal:5,bio:'Green-light energy and forward motion.',accent:'#35d07f'},
 {name:'PdF',role:'Artist · lead',playlistTracks:['Energy (J)'],rankSignal:4,bio:'Straight energy for the Cruise floor.',accent:'#7c3aed'},
 {name:'Iteeboy',role:'Artist · lead',playlistTracks:['Bad Days'],rankSignal:4,bio:'Turns the low moments into movement.',accent:'#f59e0b'},
 {name:'Deerichi',role:'Artist · lead',playlistTracks:['Do You Bad'],rankSignal:3,bio:'A playful edge for the social rotation.',accent:'#ec4899'},
 {name:'Eastrn',role:'Artist · collaborator',playlistTracks:['Do You Bad'],rankSignal:2,bio:'A bright collaborative tone.',accent:'#22d3ee'},
 {name:'GeeGy',role:'Artist · lead',playlistTracks:['LIFE'],rankSignal:2,bio:'Life, rhythm and a room-ready hook.',accent:'#ffd400'},
 {name:'Maruche',role:'Artist · collaborator',playlistTracks:['LIFE'],rankSignal:1,bio:'A warm final note in the current public preview.',accent:'#a78bfa'},
];
