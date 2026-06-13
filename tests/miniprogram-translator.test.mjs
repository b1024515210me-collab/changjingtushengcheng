import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadMiniProgramTranslator() {
  const source = readFileSync(new URL('../miniprogram/utils/translator.js', import.meta.url), 'utf8');
  const sandbox = { module: { exports: {} }, exports: {} };
  vm.runInNewContext(source, sandbox, { filename: 'miniprogram/utils/translator.js' });
  return sandbox.module.exports;
}

test('mini program translator exposes picker options and calm result level', () => {
  const { soundOptions, bodyOptions, contextOptions, translateCatSignal } = loadMiniProgramTranslator();
  const result = translateCatSignal({ catName: '奶茶', sound: 'purr', body: 'slow-blink', context: 'petting' });

  assert.ok(soundOptions.length >= 6);
  assert.ok(bodyOptions.length >= 6);
  assert.ok(contextOptions.length >= 6);
  assert.equal(result.level, 'calm');
  assert.match(result.title, /奶茶/);
});

test('mini program translator marks defensive signals as alert', () => {
  const { translateCatSignal } = loadMiniProgramTranslator();
  const result = translateCatSignal({ sound: 'hiss', body: 'ears-flat', context: 'stranger' });

  assert.equal(result.mood, '需要空间');
  assert.equal(result.level, 'alert');
  assert.ok(result.tips.some((tip) => tip.includes('不要追逐')));
});

test('human speech translates into a meow line for two-way communication', () => {
  const { translateHumanToCat } = loadMiniProgramTranslator();
  const result = translateHumanToCat({ catName: '饭团', text: '饭团别怕，我爱你', intent: 'hello' });

  assert.equal(result.mood, '人话转咪语');
  assert.match(result.title, /饭团/);
  assert.match(result.meowLine, /喵/);
  assert.ok(result.tips.some((tip) => tip.includes('原句')));
});

test('realtime cat frames include rolling waveform and confidence', () => {
  const { createRealtimeCatFrame } = loadMiniProgramTranslator();
  const first = createRealtimeCatFrame({ tick: 0, catName: '奶茶' });
  const second = createRealtimeCatFrame({ tick: 1, catName: '奶茶' });

  assert.equal(first.source, 'cat-live');
  assert.ok(first.confidence > 0);
  assert.notEqual(first.waveform, second.waveform);
  assert.match(first.liveText, /可信度/);
});

test('realtime human frames convert recorded speech into meow output', () => {
  const { createRealtimeHumanFrame } = loadMiniProgramTranslator();
  const frame = createRealtimeHumanFrame({ tick: 0, catName: '点点' });

  assert.equal(frame.source, 'human-live');
  assert.match(frame.recognizedText, /吃饭/);
  assert.match(frame.meowLine, /喵/);
  assert.ok(frame.confidence > 0);
});
