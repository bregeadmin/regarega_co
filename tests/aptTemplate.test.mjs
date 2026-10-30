import test from 'node:test';
import assert from 'node:assert/strict';
import { template as en } from '../src/lib/aptDetail.ts';
import { template as ru } from '../src/lib/aptDetailRu.ts';

for (const [name, t] of [['en', en], ['ru', ru]]) {
  test(`apartment page (${name}): no way to reach the host off-platform`, () => {
    assert.ok(!t.includes('t.me/'), 'telegram link');
    assert.ok(!t.includes('mailto:'), 'mailto link');
    assert.ok(!/telegram/i.test(t), 'telegram mention');
    assert.ok(!t.includes('abContact') && !t.includes('abSeg') && !t.includes('abName'), 'contact fields');
    assert.ok(!t.includes('cta-help'), 'questions-before-booking block');
  });
  test(`apartment page (${name}): ask-the-host block`, () => {
    assert.ok(t.includes('id="askHost"') && t.includes('id="askHostBtn"'));
    assert.ok(t.includes('%%OP%%') && t.includes('%%OPI%%'));
  });
}
