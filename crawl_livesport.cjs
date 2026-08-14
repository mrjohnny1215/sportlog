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
  // 한국 시간(KST = UTC+9) 기준 — 오늘 + 내일 양쪽 크롤 (경기 일정이 자정 넘어 배치됨)
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' });
  const kstToday = fmt.format(new Date());
  const kstTomorrow = fmt.format(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [ty, tm, td] = kstToday.split('-');
  const [py, pm, pd] = kstTomorrow.split('-');
  const todayMDs = [`${td}.${tm}.`, `${pd}.${pm}.`]; // 오늘/내일 MM.DD.
  const today = kstToday;

  for (const lg of LEAGUES) {
    try {
      await page.goto(lg.url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(5000);
      const lines = await page.evaluate(() => document.body.innerText.split('\n').map(l => l.trim()).filter(Boolean));
      for (let i = 0; i < lines.length; i++) {
        // 구조: [날짜.시간] [홈팀] [원정팀] [-] [-] [날짜.시간]
        // 예: "15.08. 10:00" "KIA" "두산" "-" "-" "15.08. 10:00"
        const home = lines[i];
        const away = lines[i + 1];
        const dash1 = lines[i + 2];
        const dash2 = lines[i + 3];
        const isTeam = (s) => s && s.length < 30 && s.length > 1
          && !/순위|즐겨찾기|리그|TV|배당률|LIVE|예정|종료|투수|아카이브|본문|로그인|스코어|경기일정|결과|더 많은|고정된/.test(s)
          && !/^\d{1,2}\.\d{2}/.test(s) && s !== '-' && s !== '';
        if (isTeam(home) && isTeam(away) && dash1 === '-' && dash2 === '-') {
          // 시간 추출: 위 1줄(홈팀 앞) 또는 아래 1줄(원정팀 뒤) 확인
          let timeStr = '';
          const before = lines[i - 1] || '';
          const after = lines[i + 4] || '';
          const tMatch = (before.match(/\d{1,2}\.\d{2}\.\s*(\d{1,2}:\d{2})/) || after.match(/\d{1,2}\.\d{2}\.\s*(\d{1,2}:\d{2})/) || before.match(/(\d{1,2}:\d{2})/) || after.match(/(\d{1,2}:\d{2})/));
          if (tMatch) timeStr = tMatch[1];
          // 날짜 필터: 홈팀 위/아래 줄에 오늘 날짜(MM.DD.)가 포함된 경기만
          const dateLine = before + ' ' + after;
          const hasToday = todayMDs.some(md => dateLine.includes(md));
          if (!hasToday) continue;
          const key = lg.code + home + away;
          if (!seen.has(key)) {
            seen.add(key);
            games.push({ league: lg.code, homeTeam: home, awayTeam: away, source: 'local', date: today, time: timeStr });
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
