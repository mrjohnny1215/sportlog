// 팀별 브랜드 컬러 팔레트 (로고 색 기반, 수동 매핑)
// 키: 팀명 포함 문자열(대소문자 무시), 값: [primary, secondary]
const TEAM_COLORS = {
  // NPB
  'chunichi': ['#0b4ea2', '#1e6fd0'],
  'dragons': ['#0b4ea2', '#1e6fd0'],
  'hanshin': ['#f50012', '#ff4d5e'],
  'tigers': ['#f50012', '#ff4d5e'],
  'hiroshima': ['#d6001b', '#ff3b52'],
  'carp': ['#d6001b', '#ff3b52'],
  'yokohama': ['#199bd6', '#36bdf0'],
  'dena': ['#199bd6', '#36bdf0'],
  'baystars': ['#199bd6', '#36bdf0'],
  'nippon-ham': ['#1536a0', '#3a5fd0'],
  'fighters': ['#1536a0', '#3a5fd0'],
  'softbank': ['#ffd200', '#ffe14d'],
  'hawks': ['#ffd200', '#ffe14d'],
  'yomiuri': ['#e2001a', '#ff4d5e'],
  'giants': ['#fd5a1e', '#ff8c3b'],
  // KBO
  'lg': ['#c40f2e', '#e8435c'],
  '두산': ['#0a1758', '#2a3f9e'],
  '키움': ['#6a0dad', '#9b30ff'],
  'kt': ['#e1002a', '#ff4d5e'],
  '삼성': ['#074199', '#2a6fd0'],
  'ssg': ['#c8102e', '#ff4d5e'],
  '한화': ['#ff6600', '#ff8c3b'],
  'kia': ['#b71234', '#e8435c'],
  'nc': ['#2b2b6b', '#4a4ab0'],
  '롯데': ['#092199', '#2a4fd0'],
  // MLB (일부)
  'dodgers': ['#005a9c', '#1e7fd0'],
  'yankees': ['#0c2340', '#1a3a6e'],
  'red sox': ['#bd3039', '#e8435c'],
  'cubs': ['#0e3386', '#2a5fd0'],
};

export function teamColor(name = '') {
  const n = name.toLowerCase();
  for (const key of Object.keys(TEAM_COLORS)) {
    if (n.includes(key)) return TEAM_COLORS[key][0];
  }
  // 해시 기반 생성 (일관성 유지) — 채도 높은 진한 톤
  let h = 0;
  for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) % 360;
  return `hsl(${h}, 75%, 42%)`;
}
