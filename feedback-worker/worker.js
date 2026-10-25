// Cloudflare Worker: nimmt Feedback aus dem Spiel entgegen und legt es als GitHub-Issue an.
// Der GitHub-Token liegt nur hier als Secret (GITHUB_TOKEN), nie im Spiel.
const REPO = 'sventie/jump-up';
const ALLOWED_ORIGINS = ['https://sventie.github.io'];   // Adresse des Spiels (GitHub Pages)
const WINDOW_MS = 60000, MAX_PER_WINDOW = 3;
const hits = new Map();

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    const reply = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return reply(405, { error: 'Nur POST.' });
    if (!ALLOWED_ORIGINS.includes(origin)) return reply(403, { error: 'Nicht erlaubt.' });

    const ip = request.headers.get('CF-Connecting-IP') || 'x', now = Date.now();
    const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
    if (recent.length >= MAX_PER_WINDOW) return reply(429, { error: 'Zu viele Nachrichten.' });
    recent.push(now); hits.set(ip, recent);

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
};
