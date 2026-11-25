import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { INITIAL_ITEMS, incrementVotes } from './src/votes.mjs';
const PORT = Number(process.env.PORT || 4173);
const items = INITIAL_ITEMS.map((item) => ({ ...item }));
const MIME = { '.html': 'text/html', '.js': 'text/javascript' };
const server = http.createServer(async (req, res) => {
  if (req.url === '/favicon.ico') { res.writeHead(204); return res.end(); }
  if (req.method === 'POST' && req.url === '/api/vote') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const { id } = JSON.parse(body || '{}');
    const votes = incrementVotes(items, id);
    res.writeHead(votes === null ? 404 : 200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(votes === null ? { error: 'missing' } : { id, votes }));
  }
  const name = path.basename(req.url === '/' ? 'index.html' : req.url);
  try {
    const buf = await fs.readFile(new URL(`./public/${name}`, import.meta.url));
    res.writeHead(200, { 'Content-Type': MIME[path.extname(name)] || 'text/plain' });
    res.end(buf);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(PORT, '127.0.0.1', () => console.log(`ready http://127.0.0.1:${PORT}`));
