// 팀명(한글/영문) -> Livesport 팀 slug 매핑
// 예: 'KIA' -> 'kia-tigers', '두산' -> 'doosan-bears'
// 크롤 소스: https://www.livesport.com/kr/baseball/{국가}/{리그}/{slug}/results/

export const LEAGUE_SLUG = {
  KBO: { country: 'south-korea', league: 'kbo' },
  MLB: { country: 'usa', league: 'mlb' },
  NPB: { country: 'japan', league: 'npb' },
  CPBL: { country: 'taiwan', league: 'cpbl' },
};

// 팀명(다양한 표기) -> slug
export const TEAM_SLUGS = {
  // KBO
  'KIA': 'kia-tigers', 'KIA 타이거즈': 'kia-tigers', '기아': 'kia-tigers', '기아타이거즈': 'kia-tigers',
  '두산': 'doosan-bears', '두산 베어스': 'doosan-bears', 'Doosan Bears': 'doosan-bears',
  'KT': 'kt-wiz', 'KT 위즈': 'kt-wiz', 'KTW': 'kt-wiz',
  '키움': 'kiwoom-heroes', '키움 히어로즈': 'kiwoom-heroes', 'Kiwoom Heroes': 'kiwoom-heroes', 'KIW': 'kiwoom-heroes',
  'LG': 'lg-twins', 'LG 트윈스': 'lg-twins', 'LG Twins': 'lg-twins', 'LGT': 'lg-twins',
  'SSG': 'ssg-landers', 'SSG 랜더스': 'ssg-landers', 'SSG Landers': 'ssg-landers',
  '롯데': 'lotte-giants', '롯데 자이언츠': 'lotte-giants', 'Lotte Giants': 'lotte-giants', 'LOT': 'lotte-giants',
  'NC': 'nc-dinos', 'NC 다이노스': 'nc-dinos', 'NC Dinos': 'nc-dinos', 'NCD': 'nc-dinos',
  '삼성': 'samsung-lions', '삼성 라이온즈': 'samsung-lions', 'Samsung Lions': 'samsung-lions', 'SAM': 'samsung-lions',
  '한화': 'hanwha-eagles', '한화 이글스': 'hanwha-eagles', 'Hanwha Eagles': 'hanwha-eagles', 'HAN': 'hanwha-eagles',

  // MLB (일부 주요팀)
  '시카고 컵스': 'chicago-cubs', 'Chicago Cubs': 'chicago-cubs',
  '신시내티': 'cincinnati-reds', 'Cincinnati Reds': 'cincinnati-reds',
  '디트로이트': 'detroit-tigers', 'Detroit Tigers': 'detroit-tigers',
  '피츠버그': 'pittsburgh-pirates', 'Pittsburgh Pirates': 'pittsburgh-pirates',
  '뉴욕M': 'new-york-mets', 'New York Mets': 'new-york-mets',
  '클리블랜드': 'cleveland-guardians', 'Cleveland Guardians': 'cleveland-guardians',
  '탬파베이': 'tampa-bay-rays', 'Tampa Bay Rays': 'tampa-bay-rays',
  '애틀랜타': 'atlanta-braves', 'Atlanta Braves': 'atlanta-braves',
  '토론토': 'toronto-blue-jays', 'Toronto Blue Jays': 'toronto-blue-jays',
  '휴스턴': 'houston-astros', 'Houston Astros': 'houston-astros',
  'LA 에인절스': 'los-angeles-angels', 'Los Angeles Angels': 'los-angeles-angels',
  '애슬레틱스': 'athletics', 'Oakland Athletics': 'athletics',
  'LA 다저스': 'los-angeles-dodgers', 'Los Angeles Dodgers': 'los-angeles-dodgers',
  '샌프란시스코': 'san-francisco-giants', 'San Francisco Giants': 'san-francisco-giants',
  '미네소타': 'minnesota-twins', 'Minnesota Twins': 'minnesota-twins',
  '세인트루이스': 'st-louis-cardinals', 'St. Louis Cardinals': 'st-louis-cardinals',
  '워싱턴': 'washington-nationals', 'Washington Nationals': 'washington-nationals',
  '샌디에이고': 'san-diego-padres', 'San Diego Padres': 'san-diego-padres',
  '볼티모어': 'baltimore-orioles', 'Baltimore Orioles': 'baltimore-orioles',
  '애리조나': 'arizona-diamondbacks', 'Arizona Diamondbacks': 'arizona-diamondbacks',
  '뉴욕Y': 'new-york-yankees', 'New York Yankees': 'new-york-yankees',
  '시애틀': 'seattle-mariners', 'Seattle Mariners': 'seattle-mariners',
  '캔자스시티': 'kansas-city-royals', 'Kansas City Royals': 'kansas-city-royals',
  '텍사스': 'texas-rangers', 'Texas Rangers': 'texas-rangers',
  '밀워키': 'milwaukee-brewers', 'Milwaukee Brewers': 'milwaukee-brewers',
  '콜로라도': 'colorado-rockies', 'Colorado Rockies': 'colorado-rockies',
  '마이애미': 'miami-marlins', 'Miami Marlins': 'miami-marlins',
  '시카고 화이트삭스': 'chicago-white-sox', 'Chicago White Sox': 'chicago-white-sox',
  '보스턴': 'boston-red-sox', 'Boston Red Sox': 'boston-red-sox',

  // NPB
  '소프트뱅크': 'softbank-hawks', 'Fukuoka SoftBank Hawks': 'softbank-hawks',
  '요미우리': 'yomiuri-giants', 'Yomiuri Giants': 'yomiuri-giants',
  '한신': 'hanshin-tigers', 'Hanshin Tigers': 'hanshin-tigers',
  '오릭스': 'orix-buffaloes', 'Orix Buffaloes': 'orix-buffaloes',
  '지바롯데': 'chiba-lotte-marines', 'Chiba Lotte Marines': 'chiba-lotte-marines',
  '야쿠르트': 'tokyo-yakult-swallows', 'Tokyo Yakult Swallows': 'tokyo-yakult-swallows',
  '주니치': 'chunichi-dragons', 'Chunichi Dragons': 'chunichi-dragons',
  '히로시마': 'hiroshima-toyo-carp', 'Hiroshima Toyo Carp': 'hiroshima-toyo-carp',
  '세이부': 'saitama-seibu-lions', 'Saitama Seibu Lions': 'saitama-seibu-lions',
  '라쿠텐': 'tohoku-rakuten-golden-eagles', 'Tohoku Rakuten Golden Eagles': 'tohoku-rakuten-golden-eagles',
  '니혼햄': 'hokkaido-nippon-ham-fighters', 'Hokkaido Nippon-Ham Fighters': 'hokkaido-nippon-ham-fighters',

  // CPBL
  '퉁이 라이온스': 'tung-yi-lions', 'Tung Yi Lions': 'tung-yi-lions',
  '푸방 가디언스': 'fubon-guardians', 'Fubon Guardians': 'fubon-guardians',
  '웨이취엔 드래곤스': 'wei-chuan-dragons', 'Wei Chuan Dragons': 'wei-chuan-dragons',
  '라쿠텐 몽키스': 'rakuten-monkeys', 'Rakuten Monkeys': 'rakuten-monkeys',
  '중신 브라더스': 'ct-brothers', 'CT Brothers': 'ct-brothers',
  'TSG 호크스': 'tsg-hawks', 'TSG Hawks': 'tsg-hawks',
};

export function teamSlug(teamName) {
  if (!teamName) return null;
  return TEAM_SLUGS[teamName] || TEAM_SLUGS[teamName.trim()] || null;
}
