// TheSportsDB 무료 API 연동 (API key: 3 = 무료 테스트 키)
const API_KEY = '3';
const BASE = 'https://www.thesportsdb.com/api/v1/json';

// 표시에서 제외할 개인 종목 (팀 스포츠는 모두 표시)
const NOISE_SPORTS = ['tennis', 'golf', 'cycling', 'motorsport', 'bowls', 'chess'];


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

  // 모든 스포츠 경기 표시 (사용자 요청: "모든 게임" 보기). 노이즈 최소화만.
  const filtered = events.filter((e) => {
    if (e.source === 'local') return true;
    if (!e.strLeague && !e.strSport) return false;
    // 개인 종목(테니스/골프 등)은 제외, 팀 스포츠 위주
    const sp = (e.strSport || '').toLowerCase();
    if (NOISE_SPORTS.includes(sp)) return false;
    return true;
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
