const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { LEAGUE_SLUG, teamSlug } = require('./src/teamSlugs.js');

(async () => {
  const games = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'local_games.json'), 'utf8'));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const result = {};

  async function getResults(slug) {
    const lg = null; // set per call
    return [];
  }

  for (const g of games) {
    const key = `${g.homeTeam}|${g.awayTeam}|${g.league}`;
    if (result[key]) continue;
    const hSlug = teamSlug(g.homeTeam);
    const aSlug = teamSlug(g.awayTeam);
    if (!hSlug || !aSlug) { result[key] = { count: 0, h2h: [] }; continue; }
    const lg = LEAGUE_SLUG[g.league];
    if (!lg) { result[key] = { count: 0, h2h: [] }; continue; }

    const fetchTeam = async (slug) => {
      const url = `https://www.livesport.com/kr/baseball/${lg.country}/${lg.league}/${slug}/results/`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(3500);
        for (let c = 0; c < 4; c++) {
          const clicked = await page.evaluate(() => {
            const btns = [...document.querySelectorAll('button, a')];
            const b = btns.find(x => /더 많은 경기 보기|더 많이 보기/.test(x.textContent || ''));
            if (b) { b.click(); return true; }
            return false;
          });
          if (!clicked) break;
          await page.waitForTimeout(2000);
        }
        const lines = await page.evaluate(() => document.body.innerText.split('\n').map(l => l.trim()).filter(Boolean));
        const out = [];
        const dateRe = /^\d{1,2}\.\d{2}\.\s*\d{1,2}:\d{2}$/;
        for (let i = 0; i < lines.length; i++) {
          const date = lines[i];
          const h = lines[i + 1];
          const a = lines[i + 2];
          const hs = lines[i + 3];
          const as = lines[i + 4];
          const isTeam = (s) => s && s.length < 30 && s.length > 1
            && !/순위|즐겨찾기|리그|TV|배당률|LIVE|예정|종료|투수|아카이브|본문|로그인|스코어|경기일정|결과|더 많은|고정된|우승|최근 점수|오늘의 경기|예정된/.test(s)
            && !/^\d{1,2}\.\d{2}/.test(s) && s !== '-' && s !== '';
          const isScore = (s) => /^\d+$/.test(s);
          if ((dateRe.test(date) || date === '종료') && isTeam(h) && isTeam(a) && isScore(hs) && isScore(as)) {
            out.push({ date: dateRe.test(date) ? date : '', home: h, away: a, homeScore: +hs, awayScore: +as });
          }
        }
        return out;
      } catch (e) { return []; }
    };

    const homeGames = await fetchTeam(hSlug);
    const awayGames = await fetchTeam(aSlug);
    const pair = (gm) => (gm.home === g.homeTeam && gm.away === g.awayTeam) || (gm.home === g.awayTeam && gm.away === g.homeTeam);
    const seen = new Set();
    const all = [...homeGames.filter(pair), ...awayGames.filter(pair)].filter(gm => {
      const k = gm.date + gm.home + gm.homeScore + gm.awayScore;
      if (seen.has(k)) return false; seen.add(k); return true;
    }).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
    result[key] = { count: all.length, h2h: all };
    console.log(`${g.homeTeam} vs ${g.awayTeam}: ${all.length}경기`);
  }

  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'public', 'h2h_data.json'), JSON.stringify(result, null, 2));
  console.log('=== H2H 크롤 완료:', Object.keys(result).length, '경기 ===');
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
