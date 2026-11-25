import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_ITEMS, incrementVotes } from '../src/votes.mjs';

test('incrementVotes bumps count from 42 to 43', () => {
  const clone = INITIAL_ITEMS.map((item) => ({ ...item }));
  const next = incrementVotes(clone, 'dark-logs');
  assert.equal(next, 43);
  assert.equal(clone[0].votes, 43);
});
