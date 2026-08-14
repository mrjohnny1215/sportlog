// TheSportsDB 무료 API 연동 (API key: 3 = 무료 테스트 키)
const API_KEY = '3';
const BASE = 'https://www.thesportsdb.com/api/v1/json';


// 오늘 날짜 (YYYY-MM-DD, 로컬 기준)
export const todayStr = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// 날짜 지정 가능 버전
export const dateStr = (date) => {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
};

// 특정 날짜 경기 가져오기 (축구+야구 필터)
export async function fetchMatches(date = new Date()) {
  const d = dateStr(date);
  const url = `${BASE}/${API_KEY}/eventsday.php?d=${d}`;

  // TheSportsDB + 로컬 크롤(KBO/NPB) 병합
  const [tsdb, local] = await Promise.all([
    fetch(url).then(r => r.ok ? r.json() : { events: [] }).catch(() => ({ events: [] })),
    fetch('/local_games.json').then(r => r.ok ? r.json() : []).catch(() => []),
  ]);

  const events = [...(tsdb.events || []), ...(Array.isArray(local) ? local : [])];

  // 야구만 표시 (사용자 지시: NFL 등 다른 스포츠 제외, KBO/NPB/MLB/CPBL 야구만)
  const filtered = events.filter((e) => {
    if (e.source === 'local') return true; // local_games.json = 이미 야구만
    const sp = (e.strSport || '').toLowerCase();
    const lg = (e.strLeague || '').toLowerCase();
    if (sp === 'baseball') return true;
    if (lg.includes('kbo') || lg.includes('npb') || lg.includes('mlb') || lg.includes('cpbl')) return true;
    return false;
  });

  return filtered.map((e) => ({
    id: e.idEvent || e.id || `${e.league}-${e.homeTeam}-${e.awayTeam}-${e.date}`,
    league: e.strLeague || e.league,
    sport: e.strSport || e.sport || 'Baseball',
    homeTeam: e.strHomeTeam || e.homeTeam || '홈',
    awayTeam: e.strAwayTeam || e.awayTeam || '어웨이',
    event: e.strEvent || e.event || `${e.homeTeam} vs ${e.awayTeam}`,
    time: e.strTime || e.time || '',
    date: e.dateEvent || e.date,
    homeBadge: e.strHomeTeamBadge || e.homeBadge,
    awayBadge: e.strAwayTeamBadge || e.awayBadge,
    venue: e.strVenue || e.venue,
    thumb: e.strThumb || e.thumb,
    source: e.source || 'tsdb',
  }));
}
