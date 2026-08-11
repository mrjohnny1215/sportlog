// Groq LLM 연동 (설명 + 승부 추천 생성, 무료 티어)
// API 키는 사용자 브라우저 localStorage에만 저장 (서버로 전송 안 함)
const KEY_STORAGE = 'sportlog_groq_key';

const GROQ_MODELS = [
  'llama-3.1-8b-instant',   // 빠름, 무료
  'llama-3.3-70b-versatile', // 품질 높음 (무료 할당량 내)
];

export function getGroqKey() {
  return localStorage.getItem(KEY_STORAGE) || '';
}
export function setGroqKey(k) {
  if (k) localStorage.setItem(KEY_STORAGE, k);
  else localStorage.removeItem(KEY_STORAGE);
}

export function hasGroqKey() {
  return !!getGroqKey();
}

// 경기 예측 설명 + 승부 추천 생성
// match: {homeTeam, awayTeam, league, sport}
// eloPred: {homeWin, draw, awayWin, favored, homeRating, awayRating}
export async function explainPrediction(match, eloPred) {
  const key = getGroqKey();
  if (!key) throw new Error('Groq API 키가 없습니다. 설정에서 입력하세요.');

  const sportNote = (match.sport || 'Baseball') === 'Soccer'
    ? `무승부 가능성 ${eloPred.draw}%`
    : '무승부 없음';

  const prompt = `당신은 스포츠 분석가입니다. 다음 경기를 분석해 한국어로 답하세요.

[경기 정보]
- 리그: ${match.league || '알 수 없음'}
- 홈: ${match.homeTeam}
- 원정: ${match.awayTeam}
- 스포츠: ${match.sport || 'Baseball'} (${sportNote})

[모델 예측 승률]
- 홈 승: ${eloPred.homeWin}%
- 무승부: ${eloPred.draw}%
- 원정 승: ${eloPred.awayWin}%
- 모델 예상 승자: ${eloPred.favored === 'home' ? match.homeTeam : eloPred.favored === 'away' ? match.awayTeam : '무승부'}

[요청]
1. 3문장 이내 요약 분석 (양 팀 전력/홈 어드밴티지/최근 흐름 근거)
2. 마지막 줄에 "PICK:" 으로 시작해 예상 승자 한 팀명 또는 "무승부" 명시
예) PICK: ${match.homeTeam}

분석:`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: GROQ_MODELS[0],
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 350,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Groq 오류: ${res.status} ${err.error?.message || ''}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '설명을 생성하지 못했습니다.';
}

// 응답에서 PICK: 라인 추출
export function extractPick(text, homeTeam, awayTeam) {
  const m = text.match(/PICK:\s*(.+)/i);
  if (!m) return null;
  const v = m[1].trim();
  if (v.includes(homeTeam)) return 'home';
  if (v.includes(awayTeam)) return 'away';
  if (/무|draw/i.test(v)) return 'draw';
  return null;
}
