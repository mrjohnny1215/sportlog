// Groq LLM 연동 (설명 생성, 무료 티어)
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

// 경기 예측 설명 생성
// match: {homeTeam, awayTeam, league}
// eloPred: {homeWin, awayWin}
export async function explainPrediction(match, eloPred) {
  const key = getGroqKey();
  if (!key) throw new Error('Groq API 키가 없습니다. 설정에서 입력하세요.');

  const prompt = `당신은 스포츠 분석가입니다. 다음 경기를 분석해 한국어로 3문장 이내 요약과 승부 예측 근거를 설명하세요.
- 리그: ${match.league || '알 수 없음'}
- 홈: ${match.homeTeam}
- 원정: ${match.awayTeam}
- 단순 ELO 모델 승률: 홈 ${eloPred.homeWin}% / 원정 ${eloPred.awayWin}%
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
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Groq 오류: ${res.status} ${err.error?.message || ''}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '설명을 생성하지 못했습니다.';
}
