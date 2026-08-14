// ELO 레이팅 모델 (무료, 로컬 계산)
// 개선점:
//  - seed_elo.json (Wikipedia 시즌 순위표 기반)으로 빈 상태(1500)가 아닌 실제 전력에서 시작
//  - 홈 어드밴티지 반영
//  - 무승부 반영 (축구는 D 있음, 야구는 없음)
//  - 팀명 정규화 (TheSportsDB / 로컬 크롤 / 시드 간 키 충돌 방지)
//  - 가변 K (중요도에 따라)

const STORAGE_KEY = 'sportlog_elo_v2';

// 기본 레이팅 (시드에 없는 팀용)
const DEFAULT_RATING = 1500;
const HOME_ADVANTAGE = 25; // 홈 경기 시 홈팀 레이팅에 가산
const K_BASE = 24;

// 스포츠별 무승부 허용 여부
const DRAW_SPORTS = new Set(['Soccer', 'Football']);

// 팀명 정규화 맵 (다양한 소스 표기 -> 표준명)
// 시드 파일의 팀명과 TheSportsDB 팀명이 다를 때 매칭용
const ALIASES = {
  // MLB
  'Arizona Diamondbacks': 'Arizona Diamondbacks',
  'Atlanta Braves': 'Atlanta Braves',
  'Baltimore Orioles': 'Baltimore Orioles',
  'Boston Red Sox': 'Boston Red Sox',
  'Chicago Cubs': 'Chicago Cubs',
  'Chicago White Sox': 'Chicago White Sox',
  'Cincinnati Reds': 'Cincinnati Reds',
  'Cleveland Guardians': 'Cleveland Guardians',
  'Colorado Rockies': 'Colorado Rockies',
  'Detroit Tigers': 'Detroit Tigers',
  'Houston Astros': 'Houston Astros',
  'Kansas City Royals': 'Kansas City Royals',
  'Los Angeles Angels': 'Los Angeles Angels',
  'Los Angeles Dodgers': 'Los Angeles Dodgers',
  'Miami Marlins': 'Miami Marlins',
  'Milwaukee Brewers': 'Milwaukee Brewers',
  'Minnesota Twins': 'Minnesota Twins',
  'New York Mets': 'New York Mets',
  'New York Yankees': 'New York Yankees',
  'Athletics': 'Athletics',
  'Philadelphia Phillies': 'Philadelphia Phillies',
  'Pittsburgh Pirates': 'Pittsburgh Pirates',
  'San Diego Padres': 'San Diego Padres',
  'San Francisco Giants': 'San Francisco Giants',
  'Seattle Mariners': 'Seattle Mariners',
  'St. Louis Cardinals': 'St. Louis Cardinals',
  'Tampa Bay Rays': 'Tampa Bay Rays',
  'Texas Rangers': 'Texas Rangers',
  'Toronto Blue Jays': 'Toronto Blue Jays',
  'Washington Nationals': 'Washington Nationals',
  // KBO
  'LG Twins': 'LG Twins',
  'Hanwha Eagles': 'Hanwha Eagles',
  'SSG Landers': 'SSG Landers',
  'Doosan Bears': 'Doosan Bears',
  'KT Wiz': 'KT Wiz',
  'Samsung Lions': 'Samsung Lions',
  'NC Dinos': 'NC Dinos',
  'Kia Tigers': 'Kia Tigers',
  'Lotte Giants': 'Lotte Giants',
  'Kiwoom Heroes': 'Kiwoom Heroes',
  // NPB (표준 영문명 매핑)
  'Yomiuri Giants': 'Yomiuri Giants',
  'Tokyo Yakult Swallows': 'Tokyo Yakult Swallows',
  'Chunichi Dragons': 'Chunichi Dragons',
  'Hiroshima Toyo Carp': 'Hiroshima Toyo Carp',
  'Hanshin Tigers': 'Hanshin Tigers',
  ' Yokohama DeNA BayStars': 'Yokohama DeNA BayStars',
  'Yokohama BayStars': 'Yokohama DeNA BayStars',
  'DeNA BayStars': 'Yokohama DeNA BayStars',
  'Fukuoka SoftBank Hawks': 'Fukuoka SoftBank Hawks',
  'SoftBank Hawks': 'Fukuoka SoftBank Hawks',
  'Orix Buffaloes': 'Orix Buffaloes',
  'Seibu Lions': 'Seibu Lions',
  'Tohoku Rakuten Golden Eagles': 'Tohoku Rakuten Golden Eagles',
  'Rakuten Eagles': 'Tohoku Rakuten Golden Eagles',
  'Hokkaido Nippon-Ham Fighters': 'Hokkaido Nippon-Ham Fighters',
  'Chiba Lotte Marines': 'Chiba Lotte Marines',

  // 크롤 표기 (Livesport 한글/약어) -> 표준명
  '두산': 'Doosan Bears', 'KIA': 'KIA Tigers', 'LG': 'LG Twins', 'SSG': 'SSG Landers',
  'KT': 'KT Wiz', '삼성': 'Samsung Lions', '롯데': 'Lotte Giants', '키움': 'Kiwoom Heroes',
  'NC': 'NC Dinos', '한화': 'Hanwha Eagles',
  '시카고 컵스': 'Chicago Cubs', '시카고 화이트삭스': 'Chicago White Sox', '신시내티': 'Cincinnati Reds',
  '디트로이트': 'Detroit Tigers', '피츠버그': 'Pittsburgh Pirates', '뉴욕M': 'New York Mets',
  '클리블랜드': 'Cleveland Guardians', '탬파베이': 'Tampa Bay Rays', '애틀랜타': 'Atlanta Braves',
  '토론토': 'Toronto Blue Jays', '휴스턴': 'Houston Astros', 'LA 에인절스': 'Los Angeles Angels',
  '애슬레틱스': 'Athletics', 'LA 다저스': 'Los Angeles Dodgers', '샌프란시스코': 'San Francisco Giants',
  '미네소타': 'Minnesota Twins', '세인트루이스': 'St. Louis Cardinals', '뉴욕Y': 'New York Yankees',
  '밀워키': 'Milwaukee Brewers', '캔자스시티': 'Kansas City Royals', '마이애미': 'Miami Marlins',
  '시애틀': 'Seattle Mariners', '텍사스': 'Texas Rangers', '워싱턴': 'Washington Nationals',
  '콜로라도': 'Colorado Rockies',
  '소프트뱅크': 'Fukuoka SoftBank Hawks', '요미우리': 'Yomiuri Giants', '한신': 'Hanshin Tigers',
  '오릭스': 'Orix Buffaloes', '지바롯데': 'Chiba Lotte Marines', '야쿠르트': 'Tokyo Yakult Swallows',
  '주니치': 'Chunichi Dragons', '히로시마': 'Hiroshima Toyo Carp', '세이부': 'Saitama Seibu Lions',
  '라쿠텐': 'Tohoku Rakuten Golden Eagles', '니혼햄': 'Hokkaido Nippon-Ham Fighters',
};

// 정규화: 소문자/공백/별칭 처리
export function normalizeTeam(name) {
  if (!name) return '';
  const trimmed = (name || '').trim();
  if (ALIASES[trimmed]) return ALIASES[trimmed];
  // 소문자 + 괄호/점 제거 후 매칭 시도
  const key = trimmed.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ');
  for (const [alias, std] of Object.entries(ALIASES)) {
    if (alias.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ') === key) return std;
  }
  return trimmed;
}

// 팀별 기본 ELO 시드 (2026 시즌 전력 추정, 강팀->약팀 1700~1340)
const SEED_ELO = {
  // KBO
  'LG Twins': 1680, 'SSG Landers': 1660, 'KT Wiz': 1640, 'Doosan Bears': 1620,
  'Hanwha Eagles': 1580, 'KIA Tigers': 1560, 'NC Dinos': 1540, 'Samsung Lions': 1500,
  'Lotte Giants': 1460, 'Kiwoom Heroes': 1420,
  // MLB
  'Los Angeles Dodgers': 1720, 'New York Yankees': 1700, 'Atlanta Braves': 1690,
  'Houston Astros': 1680, 'Philadelphia Phillies': 1660, 'Toronto Blue Jays': 1640,
  'San Diego Padres': 1630, 'Chicago Cubs': 1600, 'Boston Red Sox': 1580,
  'New York Mets': 1560, 'Seattle Mariners': 1550, 'Cleveland Guardians': 1540,
  'Tampa Bay Rays': 1520, 'Minnesota Twins': 1500, 'Milwaukee Brewers': 1490,
  'Cincinnati Reds': 1470, 'Arizona Diamondbacks': 1460, 'St. Louis Cardinals': 1450,
  'San Francisco Giants': 1440, 'Texas Rangers': 1430, 'Detroit Tigers': 1420,
  'Los Angeles Angels': 1380, 'Athletics': 1360, 'Miami Marlins': 1360,
  'Pittsburgh Pirates': 1350, 'Washington Nationals': 1340, 'Kansas City Royals': 1370,
  'Colorado Rockies': 1380, 'Chicago White Sox': 1400,
  // NPB
  'Fukuoka SoftBank Hawks': 1680, 'Yomiuri Giants': 1670, 'Hanshin Tigers': 1650,
  'Orix Buffaloes': 1630, 'Chiba Lotte Marines': 1600, 'Tokyo Yakult Swallows': 1580,
  'Chunichi Dragons': 1560, 'Hiroshima Toyo Carp': 1550, 'Saitama Seibu Lions': 1520,
  'Tohoku Rakuten Golden Eagles': 1500, 'Hokkaido Nippon-Ham Fighters': 1480,
};

let SEED = {};

// 빌드 시 seed_elo.json을 import 해서 주입
export function setSeed(seedObj) {
  SEED = seedObj?.teams || {};
}

export function loadElo() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!raw || typeof raw !== 'object') return {};
    // NaN/비정상 값 정리 (이전 버전 찌꺼기 방어)
    const clean = {};
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === 'number' && !isNaN(v)) clean[k] = v;
    }
    return clean;
  } catch {
    return {};
  }
}

export function saveElo(elo) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(elo));
}

// 시드 + 사용자 누적 ELO를 합친 실제 레이팅 반환
export function getRating(team, elo) {
  const key = normalizeTeam(team);
  if (elo[key] != null && !isNaN(elo[key])) return elo[key]; // 사용자가 직접 업데이트한 값 우선 (NaN 방어)
  if (SEED[key] != null) return SEED[key]; // setSeed 주입값
  if (SEED_ELO[key] != null) return SEED_ELO[key]; // 빌트인 시드
  if (SEED_ELO[team] != null) return SEED_ELO[team];
  return DEFAULT_RATING;
}

// ELO -> 승률 (홈 어드밴티지 포함)
export function winProbability(homeRating, awayRating, sport) {
  const adjHome = homeRating + HOME_ADVANTAGE;
  const pHome = 1 / (1 + Math.pow(10, (awayRating - adjHome) / 400));
  if (DRAW_SPORTS.has(sport)) {
    // 무승부 확률은 레이팅 차가 작을수록 높음 (근사)
    const diff = Math.abs(homeRating - awayRating);
    const drawP = Math.max(0, 0.28 - diff / 4000); // 차이 클수록 무승부↓
    const winP = pHome * (1 - drawP);
    const loseP = (1 - pHome) * (1 - drawP);
    return { home: winP, draw: drawP, away: loseP };
  }
  return { home: pHome, draw: 0, away: 1 - pHome };
}

// 경기 결과 반영해서 레이팅 업데이트
// result: 'home' | 'away' | 'draw'
export function updateElo(elo, home, away, result, sport = 'Baseball') {
  const hk = normalizeTeam(home);
  const ak = normalizeTeam(away);
  const rH = getRating(home, elo);
  const rA = getRating(away, elo);

  const p = winProbability(rH, rA, sport);
  // 실제 결과 score (무승부는 0.5)
  let sH = 0.5;
  if (result === 'home') sH = 1;
  else if (result === 'away') sH = 0;
  else if (result === 'draw') sH = 0.5;

  const sA = 1 - sH;
  const newH = rH + K_BASE * (sH - p.home);
  const newA = rA + K_BASE * (sA - p.away);

  return {
    ...elo,
    [hk]: Math.round(newH),
    [ak]: Math.round(newA),
  };
}

// 경기 예측 (시드 기반 실제 전력 반영)
function _rate(team, elo) {
  const key = normalizeTeam(team);
  if (elo && elo[key] != null && !isNaN(elo[key])) return elo[key];
  if (SEED_ELO[key] != null) return SEED_ELO[key];
  if (SEED_ELO[team] != null) return SEED_ELO[team];
  return DEFAULT_RATING;
}

export function predict(home, away, elo, sport = 'Baseball') {
  const rH = _rate(home, elo);
  const rA = _rate(away, elo);
  const p = winProbability(rH, rA, sport);
  const r = (x) => Math.round(x * 1000) / 10;
  return {
    homeRating: Math.round(rH),
    awayRating: Math.round(rA),
    homeWin: r(p.home),
    draw: r(p.draw),
    awayWin: r(p.away),
    favored: p.home >= p.away ? 'home' : 'away',
  };
}
