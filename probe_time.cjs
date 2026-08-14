const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.livesport.com/kr/baseball/south-korea/kbo/fixtures/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(6000);
  const lines = await page.evaluate(() => document.body.innerText.split('\n').map(l => l.trim()).filter(Boolean));
  // KIA 근처 전체 덤프
  const idx = lines.findIndex(l => l === 'KIA');
  console.log('KIA idx:', idx);
  if (idx >= 0) {
    console.log('context:', JSON.stringify(lines.slice(Math.max(0, idx-5), idx+5)));
  }
  // 전체에서 날짜 패턴 찾기
  const dates = [...new Set(lines.filter(l => /\d{1,2}\.\d{2}\./.test(l)))];
  console.log('date patterns found:', dates.slice(0, 10));
  await browser.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
