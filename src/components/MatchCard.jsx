import React, { useState } from 'react';
import { hasGroqKey, explainPrediction, extractPick } from '../ai';

const PICKS = [
  { key: 'home', label: '홈 승' },
  { key: 'draw', label: '무/패스' },
  { key: 'away', label: '원정 승' },
];
const RESULTS = [
  { key: 'win', label: '✅ 승' },
  { key: 'lose', label: '❌ 패' },
  { key: 'push', label: '➖ 무효' },
];

// 배당(소수) -> implied probability (역확률)
function impliedProb(odds) {
  const o = Number(odds);
  if (!o || o <= 1) return 0;
  return 1 / o;
}

export default function MatchCard({ match, record, eloPred, open, onToggle, onSave }) {
  const [pick, setPick] = useState(record?.pick || 'home');
  const [stake, setStake] = useState(record?.stake || '');
  const [odds, setOdds] = useState(record?.odds || '');
  const [result, setResult] = useState(record?.result || '');
  const [aiText, setAiText] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const savedColor = record?.result === 'win' ? 'border-emerald-400' : record?.result === 'lose' ? 'border-red-400' : record?.result === 'push' ? 'border-gray-300' : 'border-gray-100';

  const runAi = async () => {
    if (!hasGroqKey()) {
      setAiError('Groq API 키를 먼저 입력하세요 (설정 필요)');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const text = await explainPrediction(match, eloPred);
      setAiText(text);
      const pk = extractPick(text, match.homeTeam, match.awayTeam);
      if (pk) setPick(pk); // AI 추천을 픽에 반영
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  // 예측 확률 막대
  const homePct = eloPred?.homeWin ?? 50;
  const drawPct = eloPred?.draw ?? 0;
  const awayPct = eloPred?.awayWin ?? 50;
  const favored = eloPred?.favored;

  // 배당 가치 배지 (예측 승률 > 배당 역확률 → 가치 있음)
  const imp = impliedProb(odds);
  const valuePick = imp > 0 && favored ? (favored === 'home' ? homePct / 100 : favored === 'away' ? awayPct / 100 : drawPct / 100) : 0;
  const hasValue = imp > 0 && valuePick > imp + 0.05;

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 ${savedColor} p-3`}>
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[11px] text-gray-400">{match.league} · {match.time || '시간미정'}</div>
            <div className="font-bold text-gray-800">{match.homeTeam} vs {match.awayTeam}</div>
          </div>
          <div className="text-xs text-emerald-600">{open ? '△' : '▽'}</div>
        </div>
        {record?.result && (
          <div className="mt-1 text-xs text-gray-500">
            기록: {PICKS.find(p=>p.key===record.pick)?.label} · 배팅 {record.stake} @ {record.odds} · {RESULTS.find(r=>r.key===record.result)?.label}
          </div>
        )}
      </button>

      {/* 예측 확률 막대그래프 */}
      {eloPred && (
        <div className="mt-3 space-y-1.5">
          <ProbBar label={match.homeTeam} pct={homePct} color="emerald" highlight={favored === 'home'} />
          {drawPct > 0 && <ProbBar label="무승부" pct={drawPct} color="gray" highlight={favored === 'draw'} />}
          <ProbBar label={match.awayTeam} pct={awayPct} color="blue" highlight={favored === 'away'} />
          <div className="text-[10px] text-gray-400 text-right">
            ELO {eloPred.homeRating} vs {eloPred.awayRating}
            {eloPred.homeRating !== 1500 || eloPred.awayRating !== 1500 ? ' · 시즌 시드 반영' : ' · 기본값'}
          </div>
        </div>
      )}

      {/* 배당 가치 배지 */}
      {hasValue && (
        <div className="mt-2 text-[11px] bg-amber-100 text-amber-800 rounded-lg px-2 py-1 font-medium">
          💡 가치 배당: 예측 승률 {(valuePick * 100).toFixed(0)}% &gt; 배당 역확률 {(imp * 100).toFixed(0)}%
        </div>
      )}

      {open && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          {/* AI 분석 */}
          <div>
            <button onClick={runAi} disabled={aiLoading}
              className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
              {aiLoading ? 'AI 분석 중...' : '🤖 AI 분석 (승부 근거)'}
            </button>
            {aiError && <div className="mt-1 text-xs text-red-500">{aiError}</div>}
            {aiText && <div className="mt-2 text-xs text-gray-700 bg-purple-50 rounded-lg p-2 leading-relaxed">{aiText}</div>}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-600 mb-1">예측 픽</div>
            <div className="flex gap-2">
              {PICKS.map((p) => (
                <button key={p.key} onClick={() => setPick(p.key)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${pick===p.key ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-600">배팅액</label>
              <input type="number" value={stake} onChange={(e)=>setStake(e.target.value)}
                placeholder="예: 10000" className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-600">배당(odds)</label>
              <input type="number" step="0.01" value={odds} onChange={(e)=>setOdds(e.target.value)}
                placeholder="예: 1.85" className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-600 mb-1">결과</div>
            <div className="flex gap-2">
              {RESULTS.map((r) => (
                <button key={r.key} onClick={() => setResult(r.key)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${result===r.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => onSave({ pick, stake: Number(stake), odds: Number(odds), result })}
            className="w-full bg-emerald-700 text-white py-2.5 rounded-lg font-bold text-sm">
            저장
          </button>
        </div>
      )}
    </div>
  );
}

function ProbBar({ label, pct, color, highlight }) {
  const bg = color === 'emerald' ? 'bg-emerald-500' : color === 'blue' ? 'bg-blue-500' : 'bg-gray-400';
  const txt = color === 'emerald' ? 'text-emerald-700' : color === 'blue' ? 'text-blue-700' : 'text-gray-600';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 text-[11px] text-gray-500 truncate">{label}</div>
      <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
        <div className={`${bg} h-5 rounded-full transition-all`} style={{ width: `${Math.max(pct, 3)}%` }} />
        <span className={`absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-bold ${txt}`}>{pct}%</span>
      </div>
      {highlight && <span className="text-[10px] text-amber-500">★</span>}
    </div>
  );
}
