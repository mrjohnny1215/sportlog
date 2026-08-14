const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.livesport.com/kr/baseball/usa/mlb/fixtures/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(6000);
  const info = await page.evaluate(() => {
    const t = document.body.innerText;
    const idx = t.indexOf('시카고 컵스');
    return {
      len: t.length,
      hasCubs: t.includes('시카고 컵스'),
      idxCubs: idx,
      around: idx > 0 ? t.slice(idx - 100, idx + 200) : 'NOT FOUND',
      // 경기 행 셀렉터 후보
      divsWithDash: document.querySelectorAll('div').length,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
