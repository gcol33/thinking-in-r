import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("analytics");
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const month = day.slice(0, 7);

  // Gather stats
  const [total, today, thisMonth] = await Promise.all([
    store.get("total"),
    store.get(`daily:${day}`),
    store.get(`monthly:${month}`),
  ]);

  // Last 30 days
  const daily = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const val = await store.get(`daily:${key}`);
    daily.push({ date: key, hits: parseInt(val || "0", 10) });
  }

  // Last 12 months
  const monthly = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const val = await store.get(`monthly:${key}`);
    monthly.push({ month: key, hits: parseInt(val || "0", 10) });
  }

  // Top pages
  const { blobs } = await store.list({ prefix: "page:" });
  const pages = [];
  for (const blob of blobs) {
    const val = await store.get(blob.key);
    pages.push({ page: blob.key.replace("page:", ""), hits: parseInt(val || "0", 10) });
  }
  pages.sort((a, b) => b.hits - a.hits);

  const maxDaily = Math.max(...daily.map(d => d.hits), 1);
  const maxMonthly = Math.max(...monthly.map(m => m.hits), 1);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Thinking in R — Analytics</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f1117; color: #e0e0e0; padding: 2rem; }
  h1 { font-size: 1.5rem; margin-bottom: 1.5rem; color: #fff; }
  h2 { font-size: 1rem; margin: 2rem 0 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 0.05em; }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .card { background: #1a1d27; border-radius: 8px; padding: 1.25rem; }
  .card .label { font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
  .card .value { font-size: 2rem; font-weight: 700; color: #fff; margin-top: 0.25rem; }
  .chart { display: flex; align-items: flex-end; gap: 2px; height: 120px; background: #1a1d27; border-radius: 8px; padding: 1rem; }
  .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
  .bar { width: 100%; background: #4f8ff7; border-radius: 2px 2px 0 0; min-height: 1px; transition: height 0.3s; }
  .bar-label { font-size: 0.55rem; color: #666; writing-mode: vertical-rl; text-orientation: mixed; max-height: 3rem; overflow: hidden; }
  .bar-group:hover .bar { background: #6ea8ff; }
  .bar-group:hover .bar-label { color: #aaa; }
  table { width: 100%; border-collapse: collapse; background: #1a1d27; border-radius: 8px; overflow: hidden; }
  th, td { text-align: left; padding: 0.6rem 1rem; }
  th { font-size: 0.7rem; color: #666; text-transform: uppercase; border-bottom: 1px solid #2a2d37; }
  td { font-size: 0.85rem; border-bottom: 1px solid #1f222c; }
  td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
  tr:last-child td { border-bottom: none; }
  .page-path { color: #4f8ff7; }
  .refresh { color: #555; font-size: 0.7rem; margin-top: 2rem; text-align: center; }
</style>
</head>
<body>
<h1>Thinking in R — Analytics</h1>

<div class="cards">
  <div class="card"><div class="label">Today</div><div class="value">${parseInt(today || "0", 10)}</div></div>
  <div class="card"><div class="label">This Month</div><div class="value">${parseInt(thisMonth || "0", 10)}</div></div>
  <div class="card"><div class="label">All Time</div><div class="value">${parseInt(total || "0", 10)}</div></div>
</div>

<h2>Last 30 Days</h2>
<div class="chart">
  ${daily.map(d => `<div class="bar-group" title="${d.date}: ${d.hits}"><div class="bar" style="height:${(d.hits / maxDaily) * 100}%"></div><div class="bar-label">${d.date.slice(5)}</div></div>`).join("")}
</div>

<h2>Monthly</h2>
<div class="chart">
  ${monthly.map(m => `<div class="bar-group" title="${m.month}: ${m.hits}"><div class="bar" style="height:${(m.hits / maxMonthly) * 100}%"></div><div class="bar-label">${m.month}</div></div>`).join("")}
</div>

<h2>Top Pages</h2>
<table>
  <tr><th>Page</th><th>Hits</th></tr>
  ${pages.slice(0, 30).map(p => `<tr><td class="page-path">${p.page}</td><td>${p.hits}</td></tr>`).join("")}
</table>

<div class="refresh">Last refreshed: ${now.toISOString().replace("T", " ").slice(0, 19)} UTC</div>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};

export const config = { path: "/api/dashboard" };
