const btn = document.getElementById('upvote-btn');
const countEl = document.getElementById('vote-count');

btn.addEventListener('click', async () => {
  const res = await fetch('/api/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: btn.dataset.id })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  countEl.textContent = String(data.votes);
});
