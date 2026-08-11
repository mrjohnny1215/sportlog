import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'seed_elo.json');
const CACHE = path.join(__dirname, 'cache');
fs.mkdirSync(CACHE, { recursive: true });
const UA = { 'User-Agent': 'sportlog-seed/1.0 (personal analytics)' };

// 검증된 단순 파서
async function fetchSectionHtml(page, section) {
  const cacheFile = path.join(CACHE, `${page}__${section}.json`);
  if (fs.existsSync(cacheFile)) {
    try {
      const raw = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      return raw.parse?.text?.['*'] || raw; // raw API 응답 또는 이미 html
    } catch {}
  }
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(page)}&prop=text&format=json&section=${section}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) return null;
  const d = await res.json();
  const html = d.parse?.text?.['*'] || null;
  if (html) fs.writeFileSync(cacheFile, JSON.stringify(d)); // raw API 응답 통째 저장
  return html;
}
function parseStandingsTable(tableHtml) {
  const rows = [...tableHtml.matchAll(/<tr[\s\S]*?<\/tr>/g)].map((m) => m[0]);
  if (rows.length < 3) return [];
  let headerCells = null, headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 3); i++) {
    const cells = [...rows[i].matchAll(/<t[hd][\s\S]*?>([\s\S]*?)<\/t[hd]>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;|&#160;/g, ' ').trim());
    if (cells.some((c) => /^W$/i.test(c)) && cells.some((c) => /^L$/i.test(c))) { headerCells = cells; headerIdx = i; break; }
  }
  if (!headerCells) return [];
  const wCol = headerCells.findIndex((c) => /^W$/i.test(c));
  const lCol = headerCells.findIndex((c) => /^L$/i.test(c));
  if (wCol < 0 || lCol < 0) return [];
  const out = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const cells = [...rows[i].matchAll(/<t[hd][\s\S]*?>([\s\S]*?)<\/t[hd]>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;|&#160;/g, ' ').replace(/[ -–]/g, '-').trim());
    if (cells.length <= Math.max(wCol, lCol)) continue;
    const wRaw = cells[wCol], lRaw = cells[lCol];
    if (!/^\d+$/.test(wRaw) || !/^\d+$/.test(lRaw)) continue;
    const head = cells.slice(0, Math.min(wCol, lCol));
    let team = '';
    for (let k = head.length - 1; k >= 0; k--) {
      const c = head[k].replace(/^\(.*?\)/, '').replace(/^\d+\.?\s*/, '').replace(/\(.*?\)/g, '').trim();
      if (/[A-Za-z가-힣]/.test(c) && !/^\d+$/.test(c)) { team = c; break; }
    }
    if (team) out.push({ team, w: +wRaw, l: +lRaw });
  }
  return out;
}
function parseAllTables(html) {
  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/g)].map((m) => m[0]);
  const out = [];
  for (const t of tables) { const r = parseStandingsTable(t); if (r.length >= 3) out.push(...r); }
  return out;
}

const SOURCES = [
  { league: 'MLB', sport: 'Baseball', page: '2025_Major_League_Baseball_season' },
  { league: 'KBO', sport: 'Baseball', page: '2025_KBO_League_season' },
  { league: 'NPB', sport: 'Baseball', page: '2025_Nippon_Professional_Baseball_season' },
  { league: 'English Premier League', sport: 'Soccer', page: '2024-25_Premier_League' },
  { league: 'La Liga', sport: 'Soccer', page: '2024-25_La_Liga' },
  { league: 'Serie A', sport: 'Soccer', page: '2024-25_Serie_A' },
  { league: 'Bundesliga', sport: 'Soccer', page: '2024-25_Bundesliga' },
  { league: 'Ligue 1', sport: 'Soccer', page: '2024-25_Ligue_1' },
  { league: 'UEFA Champions League', sport: 'Soccer', page: '2024-25_UEFA_Champions_League' },
];

// 명령행 인자로 특정 리그만 처리 가능: node seed_elo.mjs NPB
const onlyArg = process.argv[2];
const targets = onlyArg ? SOURCES.filter((s) => s.league === onlyArg) : SOURCES;

const seed = { meta: { generated: new Date().toISOString().slice(0, 10), source: 'Wikipedia standings' }, teams: {} };
let total = 0;
// 기존 시드가 있으면 로드 (누적)
try {
  const existing = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  if (existing.teams) seed.teams = { ...existing.teams };
} catch {}

for (const src of targets) {
  let teams = [];
  for (let sec = 1; sec <= 20; sec++) {
    const html = await fetchSectionHtml(src.page, sec);
    if (!html) continue;
    const parsed = parseAllTables(html);
    if (parsed.length) teams = teams.concat(parsed);
    await new Promise((r) => setTimeout(r, 3000));
  }
  if (!teams.length) { console.log(`${src.league}: 순위표 못 찾음`); continue; }
  const merged = {};
  for (const t of teams) { if (!merged[t.team]) merged[t.team] = { team: t.team, w: 0, l: 0 }; merged[t.team].w += t.w; merged[t.team].l += t.l; }
  const list = Object.values(merged);
  for (const t of list) {
    const gp = t.w + t.l;
    const winPct = gp ? t.w / gp : 0.5;
    const rating = Math.round(1500 + 400 * Math.log(winPct / (1 - winPct + 1e-9)));
    seed.teams[t.team] = { league: src.league, sport: src.sport, rating, w: t.w, l: t.l };
    total++;
  }
  console.log(`${src.league}: ${list.length}팀`);
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(seed, null, 2));
console.log(`\n✅ 저장됨: ${Object.keys(seed.teams).length}팀 (이번 실행에서 ${total}팀 추가) → ${OUT}`);
