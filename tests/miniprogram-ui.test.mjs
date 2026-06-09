import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const wxml = readFileSync(new URL('../miniprogram/pages/index/index.wxml', import.meta.url), 'utf8');
const js = readFileSync(new URL('../miniprogram/pages/index/index.js', import.meta.url), 'utf8');

test('mini program exposes three switchable interaction screens', () => {
  assert.match(wxml, /data-tab="catToHuman"/);
  assert.match(wxml, /data-tab="humanToCat"/);
  assert.match(wxml, /data-tab="myCat"/);
  assert.match(wxml, /我的咪/);
});

test('both translation screens support press-to-record realtime translation', () => {
  assert.match(wxml, /bindtouchstart="startCatRecording"/);
  assert.match(wxml, /bindtouchstart="startHumanRecording"/);
  assert.match(js, /createRealtimeCatFrame/);
  assert.match(js, /createRealtimeHumanFrame/);
});
