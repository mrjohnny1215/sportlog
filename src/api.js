// TheSportsDB 무료 API 연동 (API key: 3 = 무료 테스트 키)
const API_KEY = '3';
const BASE = 'https://www.thesportsdb.com/api/v1/json';

// 스포츠 필터 (축구 + 야구: 한국/일본/미국)
// 야구: 스포츠가 'Baseball'인 전부 (KBO/NPB/MLB 모두 커버 시도)
const TARGET_SPORTS = ['baseball', 'soccer'];
// 축구는 주요 리그만 (노이즈 줄이기)
const TARGET_LEAGUES = [
  'MLB', 'KBO', 'Korea Baseball Organization', 'NPB', 'Japan Baseball',
  'English Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
  'UEFA Champions League', 'K League 1', 'FIFA World Cup',
];

const isTargetLeague = (league, sport) => {
  if (!league && !sport) return false;
  const sp = (sport || '').toLowerCase();
  // 야구/축구 스포츠 전체 허용
  if (TARGET_SPORTS.includes(sp)) return true;
  // 혹은 명시적 리그명 매칭
  return TARGET_LEAGUES.some((t) => league && (league.includes(t) || t.includes(league)));
};

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
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API 오류: ${res.status}`);
  const data = await res.json();
  const events = data.events || [];

  // 축구/야구 리그만 필터 (전체 보고 싶으면 isTargetLeague 체크 제거)
  const filtered = events.filter((e) => isTargetLeague(e.strLeague, e.strSport));

  return filtered.map((e) => ({
    id: e.idEvent,
    league: e.strLeague,
    sport: e.strSport,
    homeTeam: e.strHomeTeam || '홈',
    awayTeam: e.strAwayTeam || '어웨이',
    event: e.strEvent,
    time: e.strTime,
    date: e.dateEvent,
    homeBadge: e.strHomeTeamBadge,
    awayBadge: e.strAwayTeamBadge,
    venue: e.strVenue,
    thumb: e.strThumb,
  }));
}
