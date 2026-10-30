import test from 'node:test';
import assert from 'node:assert/strict';
import { isEmail, cleanCode, tokenFrom, inviteFrom, nextPath, initialOf, unreadText, favsToSaves } from '../src/lib/guestCore.js';

const U = '5d53d53c-d6fc-4e4f-96bc-6395263f9536';
test('isEmail', () => {
  assert.equal(isEmail('a@b.co'), true);
  assert.equal(isEmail('a@b'), false);
});
test('cleanCode', () => {
  assert.equal(cleanCode(' 12 34-56 7'), '123456');
});
test('tokenFrom', () => {
  assert.equal(tokenFrom('https://bre-instruction-deploy.vercel.app/?t=' + U), U);
  assert.equal(tokenFrom('hello'), null);
});
test('inviteFrom', () => {
  assert.equal(inviteFrom('https://x/app/trip/join?i=' + U), U);
  assert.equal(inviteFrom('https://x/app/trip/join'), null);
});
test('nextPath', () => {
  assert.equal(nextPath('?next=/ru/georgia/batumi/app/trip', '/x'), '/ru/georgia/batumi/app/trip');
  assert.equal(nextPath('?next=https://evil.com', '/x'), '/x');
  assert.equal(nextPath('?next=//evil.com', '/x'), '/x');
  assert.equal(nextPath('?next=/\\evil.com', '/x'), '/x');
  assert.equal(nextPath('?next=' + encodeURIComponent('/\t/evil.com'), '/x'), '/x');
  assert.equal(nextPath('?next=%2F%09%2Fevil.com', '/x'), '/x');
  assert.equal(nextPath('?next=' + encodeURIComponent('/\n/evil.com'), '/x'), '/x');
  assert.equal(nextPath('?next=/a/b%3Fq%3D1%23h', '/x'), '/a/b?q=1#h' === '/a/b?q=1#h' ? '/a/b?q=1#h' : '/x');
  assert.equal(nextPath('', '/x'), '/x');
});

test('initialOf', () => {
  assert.equal(initialOf('anna müller', null), 'A');
  assert.equal(initialOf('', 'zoe@x.co'), 'Z');
  assert.equal(initialOf('  ', '  '), '?');
  assert.equal(initialOf(null, null), '?');
});
test('unreadText', () => {
  assert.equal(unreadText(0), '');
  assert.equal(unreadText(-3), '');
  assert.equal(unreadText(7), '7');
  assert.equal(unreadText(140), '99+');
});
test('favsToSaves', () => {
  assert.deepEqual(favsToSaves(['coral-apartment', 'red-camelia', 'BAD SLUG', 'coral-apartment'], [{ k: 'stay', s: 'red-camelia' }]),
    [{ k: 'stay', s: 'coral-apartment', c: 'batumi' }]);
  assert.deepEqual(favsToSaves([], []), []);
  assert.deepEqual(favsToSaves(null, null), []);
});
