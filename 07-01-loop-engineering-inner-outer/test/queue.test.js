import test from 'node:test';
import assert from 'node:assert/strict';
import { createQueue } from '../src/queue.js';

test('enqueue and dequeue preserve FIFO order', () => {
  const q = createQueue();
  q.enqueue('build');
  q.enqueue('deploy');
  assert.equal(q.dequeue().payload, 'build');
  assert.equal(q.dequeue().payload, 'deploy');
  assert.equal(q.dequeue(), null);
});
test('peek and size reflect pending jobs', () => {
  const q = createQueue();
  assert.equal(q.size(), 0);
  q.enqueue('lint');
  assert.equal(q.peek().payload, 'lint');
  assert.equal(q.size(), 1);
});
