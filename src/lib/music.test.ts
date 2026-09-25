import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BIG_CRUISE_PLAYLIST, CRUISE_ARTISTS } from './music.ts';
import { CRUISE_DAYS } from './theme.ts';

test('BIG CRUISE CONTROL playlist metadata is wired',()=>{
 assert.equal(BIG_CRUISE_PLAYLIST.records,27);
 assert.match(BIG_CRUISE_PLAYLIST.url,/49E7k5sGcVOPGoWIfFicTY/);
 assert.match(BIG_CRUISE_PLAYLIST.embedUrl,/embed\/playlist/);
});

test('ranked artistes have transparent playlist signals and booking profiles',()=>{
 assert.ok(CRUISE_ARTISTS.length>=10);
 assert.ok(CRUISE_ARTISTS.every(artist=>artist.name&&artist.playlistTracks.length&&artist.rankSignal>0&&artist.bio));
 assert.ok(CRUISE_ARTISTS.every((artist,index)=>index===0||CRUISE_ARTISTS[index-1].rankSignal>=artist.rankSignal));
});

test('all seven themes point to existing artwork and motifs',()=>{
 assert.equal(CRUISE_DAYS.length,7);
 for(const day of CRUISE_DAYS){
  assert.ok(fs.existsSync(new URL(`../../public${day.image}`,import.meta.url)));
  assert.ok(fs.existsSync(new URL(`../../public${day.motif}`,import.meta.url)));
 }
});
