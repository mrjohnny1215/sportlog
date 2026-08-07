#!/usr/bin/env node
/**
 * KBO / NPB 경기 일정 크롤러 (개인용 분석 보조)
 *
 * ⚠️ 실행 환경: 이 크롤러는 차단되지 않는 네트워크(사용자 본인 PC 등)에서 돌려야 함.
 *    서버/VPS에서 막힐 수 있음.
 *
 * 사용법:
 *   node crawler/crawl_kbo_npb.mjs [YYYY-MM-DD]
 *   (인자 없으면 오늘 날짜)
 *
 * 출력: public/local_games.json  (sportlog 앱이 자동 병합)
 *
 * 소스 설정: 아래 SOURCES 배열을 실제 접근 가능한 주소로 수정.
 *   - KBO 공식: https://www.koreabaseball.com  (경기결과/일정)
 *   - NPB 공식: https://npb.jp
 *   - 또는 야구 데이터 제공 사이트
 *   각 사이트 HTML 구조에 맞춰 parse() 함수를 조정해야 할 수 있음.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'local_games.json');

// 소스 설정 (실제 환경에 맞게 수정)
const SOURCES = [
  { name: 'KBO', url: 'https://www.koreabaseball.com', sport: 'Baseball', league: 'KBO' },
  { name: 'NPB', url: 'https://npb.jp', sport: 'Baseball', league: 'NPB' },
];

const dateArg = process.argv[2] || new Date().toISOString().slice(0, 10);

// HTML에서 경기 행 파싱 (사이트별로 조정 필요 - 예시 정규식)
function parseGames(html, source) {
  const games = [];
  // 예시: <li>팀A vs 팀B</li> 형태 가정 (실제 사이트에 맞게 수정)
  const re = /([가-힣A-Za-z0-9\s]+)\s*(?:vs|VS|대)\s*([가-힣A-Za-z0-9\s]+)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    games.push({
      id: `${source.league}-${dateArg}-${games.length}`,
      source: 'local',
      league: source.league,
      sport: source.sport,
      homeTeam: m[1].trim(),
      awayTeam: m[2].trim(),
      event: `${m[1].trim()} vs ${m[2].trim()}`,
      date: dateArg,
      time: '',
    });
  }
  return games;
}

async function crawlSource(source) {
  try {
    const res = await fetch(source.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) { console.log(`  ${source.name}: HTTP ${res.status} (건너뜀)`); return []; }
    const html = await res.text();
    const games = parseGames(html, source);
    console.log(`  ${source.name}: ${games.length}건 파싱`);
    return games;
  } catch (e) {
    console.log(`  ${source.name}: 오류 ${e.message} (건너뜀)`);
    return [];
  }
}

async function main() {
  console.log(`크롤 대상 날짜: ${dateArg}`);
  let all = [];
  for (const s of SOURCES) {
    const g = await crawlSource(s);
    all = all.concat(g);
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(all, null, 2));
  console.log(`\n✅ ${all.length}건 → ${path.relative(ROOT, OUT)}`);
  console.log('sportlog 앱이 자동으로 병합합니다 (npm run build 후 배포).');
}

main();
