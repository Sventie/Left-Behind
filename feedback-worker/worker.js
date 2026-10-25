// Cloudflare Worker für Left Behind:
//   POST /          Feedback als GitHub-Issue anlegen (Secret GITHUB_TOKEN)
//   GET  /scores    Rangliste lesen            (KV-Namespace SCORES)
//   POST /scores    Ergebnis eintragen         (KV-Namespace SCORES)
// Der GitHub-Token liegt nur hier als Secret, nie im Spiel.
const REPO = 'sventie/left-behind';
const ALLOWED_ORIGINS = ['https://sventie.github.io'];   // Adresse des Spiels (GitHub Pages)
const WINDOW_MS = 60000, MAX_PER_WINDOW = 3;
const hits = new Map();
const CLASSES = ['ritter', 'waldlaeufer', 'magier'];
const MAX_DIST = 410, MAX_KILLS = 400, KEEP = 50, SHOW = 20;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    const reply = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (!ALLOWED_ORIGINS.includes(origin)) return reply(403, { error: 'Nicht erlaubt.' });
    const path = new URL(request.url).pathname;

    if (path === '/scores') {
      if (!env.SCORES) return reply(503, { error: 'Rangliste nicht eingerichtet.' });
      if (request.method === 'GET') return reply(200, { scores: (await load(env)).slice(0, SHOW) });
      if (request.method === 'POST') return addScore(request, env, reply);
      return reply(405, { error: 'Nicht erlaubt.' });
    }
    if (request.method !== 'POST') return reply(405, { error: 'Nur POST.' });
    return feedback(request, env, reply);
  }
};

function limited(request, key, max) {
  const k = key + (request.headers.get('CF-Connecting-IP') || 'x'), now = Date.now();
  const recent = (hits.get(k) || []).filter(t => now - t < WINDOW_MS);
  if (recent.length >= max) return true;
  recent.push(now); hits.set(k, recent);
  return false;
}

async function load(env) {
  try { return JSON.parse(await env.SCORES.get('scores')) || []; } catch (e) { return []; }
}

async function addScore(request, env, reply) {
  if (limited(request, 's', 6)) return reply(429, { error: 'Zu viele Einträge.' });
  let d;
  try { d = await request.json(); } catch (e) { return reply(400, { error: 'Ungültige Anfrage.' }); }
  const name = String(d.name || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, 20);
  const dist = Math.floor(Number(d.dist)), kills = Math.floor(Number(d.kills)), won = d.won === true;
  if (!name) return reply(400, { error: 'Name fehlt.' });
  if (!CLASSES.includes(d.cls)) return reply(400, { error: 'Unbekannter Streiter.' });
  if (!(dist >= 0 && dist <= MAX_DIST && kills >= 0 && kills <= MAX_KILLS)) return reply(400, { error: 'Ungültiges Ergebnis.' });
  const entry = { name, cls: d.cls, dist, kills, won, score: dist + kills * 3 + (won ? 500 : 0), at: Date.now() };
  let list = await load(env);
  const i = list.findIndex(e => e.name.toLowerCase() === name.toLowerCase());
  if (i >= 0) { if (list[i].score >= entry.score) return reply(200, { rank: i + 1, best: false, scores: list.slice(0, SHOW) }); list.splice(i, 1); }
  list.push(entry);
  list.sort((a, b) => b.score - a.score || a.at - b.at);
  list = list.slice(0, KEEP);
  await env.SCORES.put('scores', JSON.stringify(list));
  return reply(200, { rank: list.findIndex(e => e === entry) + 1, best: true, scores: list.slice(0, SHOW) });
}

async function feedback(request, env, reply) {
  if (limited(request, 'f', 3)) return reply(429, { error: 'Zu viele Nachrichten.' });
  let data;
  try { data = await request.json(); } catch (e) { return reply(400, { error: 'Ungültige Anfrage.' }); }
  const title = String(data.title || '').trim().slice(0, 120);
  const name = String(data.name || '').trim().slice(0, 40);
  let body = String(data.body || '').trim().slice(0, 6000);
  if (!title) return reply(400, { error: 'Titel fehlt.' });
  if (name) body += '\n\n**Von:** ' + name.replace(/[\r\n]+/g, ' ');

  const make = labels => fetch('https://api.github.com/repos/' + REPO + '/issues', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + env.GITHUB_TOKEN, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'User-Agent': 'left-behind-feedback', 'X-GitHub-Api-Version': '2022-11-28' },
    body: JSON.stringify({ title, body, ...(labels ? { labels } : {}) })
  });
  let res = await make(['feedback']);
  if (res.status === 422) res = await make(null);
  if (!res.ok) return reply(502, { error: 'GitHub hat den Eintrag abgelehnt.' });
  const j = await res.json();
  return reply(201, { number: j.number });
}
