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
