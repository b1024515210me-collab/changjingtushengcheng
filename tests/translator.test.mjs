import test from 'node:test';
import assert from 'node:assert/strict';
import { translateCatSignal } from '../src/translator.js';

test('translates playful signals into an invitation to play', () => {
  const result = translateCatSignal({ catName: '饭团', sound: 'chirp', body: 'tail-up', context: 'play' });

  assert.equal(result.mood, '兴奋');
  assert.match(result.title, /饭团/);
  assert.match(result.title, /陪我玩/);
  assert.equal(result.stressScore, 1);
});

test('warns when litter related notes mention urinary issues', () => {
  const result = translateCatSignal({ sound: 'long-meow', body: 'hiding', context: 'litter', notes: '尿得很少' });

  assert.equal(result.mood, '有点紧张');
  assert.ok(result.tips.some((tip) => tip.includes('兽医')));
});
