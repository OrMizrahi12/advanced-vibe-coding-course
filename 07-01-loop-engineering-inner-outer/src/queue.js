export function createQueue() {
  const items = [];
  let seq = 0;
  return {
    enqueue(payload, meta = {}) {
      const job = { id: ++seq, payload, attempts: 0, ...meta };
      items.push(job);
      return job;
    },
    dequeue() {
      return items.shift() ?? null;
    },
    peek() {
      return items[0] ?? null;
    },
    size() {
      return items.length;
    }
  };
}
