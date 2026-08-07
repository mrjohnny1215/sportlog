const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
  const apis = [];
  page.on('response', async (resp) => {
    const u = resp.url();
    if (/\/api\//.test(u) || /\.do/.test(u) || /json/i.test(u)) apis.push(u);
  });
  try {
    await page.goto('https://www.betman.co.kr/', { waitUntil: 'domcontentloaded', timeout: 40000 });
  } catch (e) { console.log('goto err', e.message); }
  await page.waitForTimeout(5000);
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a=>a.href).filter(h=>/game|match|sport|info/i.test(h)).slice(0,20));
  console.log('=== API/요청 URL ===');
  [...new Set(apis)].slice(0,50).forEach(u=>console.log(' ', u));
  console.log('=== 경기 링크 ===');
  links.forEach(l=>console.log(' ', l));
  console.log('TITLE:', await page.title());
  await browser.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
