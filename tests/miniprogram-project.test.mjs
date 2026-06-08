import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const projectConfig = JSON.parse(readFileSync(new URL('../project.config.json', import.meta.url), 'utf8'));

test('WeChat DevTools imports the repository root as a mini program project', () => {
  assert.equal(projectConfig.compileType, 'miniprogram');
  assert.equal(projectConfig.miniprogramRoot, 'miniprogram/');
  assert.equal(projectConfig.appid, 'touristappid');
});

test('configured mini program root contains required app files', () => {
  const root = new URL(`../${projectConfig.miniprogramRoot}`, import.meta.url);

  assert.equal(existsSync(new URL('app.json', root)), true);
  assert.equal(existsSync(new URL('app.js', root)), true);
  assert.equal(existsSync(new URL('pages/index/index.wxml', root)), true);
  assert.equal(existsSync(new URL('pages/index/index.js', root)), true);
  assert.equal(existsSync(new URL('pages/index/index.wxss', root)), true);
});
