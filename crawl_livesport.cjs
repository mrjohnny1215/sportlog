const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const LEAGUES = [
  { code: 'KBO', url: 'https://www.livesport.com/kr/baseball/south-korea/kbo/fixtures/' },
  { code: 'MLB', url: 'https://www.livesport.com/kr/baseball/usa/mlb/fixtures/' },
  { code: 'NPB', url: 'https://www.livesport.com/kr/baseball/japan/npb/fixtures/' },
  { code: 'CPBL', url: 'https://www.livesport.com/kr/baseball/taiwan/cpbl/fixtures/' },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const games = [];
  const seen = new Set();
  const today = new Date().toISOString().slice(0, 10);

  for (const lg of LEAGUES) {
    try {
      await page.goto(lg.url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(5000);
      const lines = await page.evaluate(() => document.body.innerText.split('\n').map(l => l.trim()).filter(Boolean));
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('투수:')) {
          // 구조: [날짜] [홈] [원정] [-] [-] [투수:]
          const home = lines[i - 4];
          const away = lines[i - 3];
          const isTeam = (s) => s && s.length < 30
            && !/순위|즐겨찾기|리그|TV|배당률|LIVE|예정|종료|투수|아카이브|:$|본문|로그인|스코어|축구|야구|농구|하키|배구|테니스|탁구|AD|요약|결과|경기일정|순위/.test(s)
            && !/^\d+$/.test(s) && s !== '-' && s !== '';
          if (isTeam(home) && isTeam(away) && home !== away) {
            const key = lg.code + home + away;
            if (!seen.has(key)) {
              seen.add(key);
              games.push({ league: lg.code, homeTeam: home, awayTeam: away, source: 'local', date: today });
            }
          }
        }
      }
      console.log(`${lg.code}: 시도 완료`);
    } catch (e) {
      console.log(`${lg.code} 실패: ${e.message}`);
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'public', 'local_games.json'), JSON.stringify(games, null, 2));
  const byLg = {};
  games.forEach(g => byLg[g.league] = (byLg[g.league] || 0) + 1);
  console.log('=== 총', games.length, '경기 ===');
  console.log('리그별:', JSON.stringify(byLg));
  console.log(JSON.stringify(games.slice(0, 12)));
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
