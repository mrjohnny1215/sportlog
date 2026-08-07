// ELO 레이팅 모델 (무료, 로컬 계산)
// 팀별 레이팅을 축적하고, 두 팀의 레이팅으로 승률 계산
const STORAGE_KEY = 'sportlog_elo_v1';

export function loadElo() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveElo(elo) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(elo));
}

const DEFAULT_RATING = 1500;
const K = 32;

// 팀 키 정규화 (이름 그대로 사용, 대소문자 구분 없애려면 toLowerCase)
const key = (name) => (name || '').trim();

// 승률 계산 (ELO 공식)
export function winProbability(aRating, bRating) {
  return 1 / (1 + Math.pow(10, (bRating - aRating) / 400));
}

// 경기 결과 반영해서 레이팅 업데이트
// home, away: 팀명, result: 'home'|'away'|'draw'
export function updateElo(elo, home, away, result) {
  const hk = key(home);
  const ak = key(away);
  const rH = elo[hk] || DEFAULT_RATING;
  const rA = elo[ak] || DEFAULT_RATING;

  const pHome = winProbability(rH, rA);
  const pAway = 1 - pHome;

  // 실제 결과 score
  let sH = 0.5, sA = 0.5; // 무
  if (result === 'home') { sH = 1; sA = 0; }
  else if (result === 'away') { sH = 0; sA = 1; }
  else if (result === 'draw') { sH = 0.5; sA = 0.5; }

  const newH = rH + K * (sH - pHome);
  const newA = rA + K * (sA - pAway);

  return {
    ...elo,
    [hk]: Math.round(newH),
    [ak]: Math.round(newA),
  };
}

// 경기 예측 (기록 기반이 없어도 기본 레이팅으로 승률 제공)
export function predict(home, away, elo) {
  const rH = elo[key(home)] || DEFAULT_RATING;
  const rA = elo[key(away)] || DEFAULT_RATING;
  const pHome = winProbability(rH, rA);
  return {
    homeRating: rH,
    awayRating: rA,
    homeWin: Math.round(pHome * 1000) / 10,   // %
    awayWin: Math.round((1 - pHome) * 1000) / 10,
    draw: 0, // 단순화
  };
}
