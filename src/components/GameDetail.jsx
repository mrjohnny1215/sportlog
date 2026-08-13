import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchMatches } from '../api';
import { loadElo, predict } from '../elo';
import { hasGroqKey, explainPrediction } from '../ai';

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [match, setMatch] = useState(null);
  const [eloPred, setEloPred] = useState(null);
  const [aiText, setAiText] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const elo = useState(() => loadElo())[0];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const target = location.state?.date ? new Date(location.state.date) : new Date();
      const all = await fetchMatches(target);
      const m = all.find(x => x.id === decodeURIComponent(id)) || null;
      if (cancelled) return;
      setMatch(m);
      if (m) setEloPred(predict(m.homeTeam, m.awayTeam, elo, m.sport));
    })();
    return () => { cancelled = true; };
  }, [id, elo, location.state]);

  const runAi = async () => {
    if (!match || !eloPred) return;
    if (!hasGroqKey()) { setAiError('AI 키를 먼저 입력하세요 (우상단 ⚙).'); return; }
    setAiLoading(true); setAiError(null);
    try {
      const text = await explainPrediction(match, eloPred);
      setAiText(text);
    } catch (e) {
      setAiError(e.message);
    } finally { setAiLoading(false); }
  };

  if (!match) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-500 text-sm">경기를 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/')} className="mt-3 text-emerald-600 text-sm">← 목록으로</button>
      </main>
    );
  }

  const homePct = eloPred?.homeWin ?? 50;
  const awayPct = eloPred?.awayWin ?? 50;

  return (
    <main className="max-w-2xl mx-auto px-4 py-4">
      <button onClick={() => navigate('/')} className="text-sm text-gray-500 mb-4">← 목록</button>

      {/* 대진표 헤더 */}
      <section className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-5 shadow-lg text-white">
        <div className="text-xs text-emerald-50 mb-4">{match.league} · {match.time ? match.time.slice(0, 5) : '시간 미정'}</div>
        <div className="flex items-center justify-between gap-2">
          <TeamBig name={match.homeTeam} badge={match.homeBadge} pct={homePct} star={eloPred?.favored === 'home'} />
          <div className="text-center shrink-0">
            <div className="text-xs font-bold text-emerald-100">VS</div>
          </div>
          <TeamBig name={match.awayTeam} badge={match.awayBadge} pct={awayPct} star={eloPred?.favored === 'away'} />
        </div>
        {/* 승률 막대 */}
        <div className="mt-5 space-y-2">
          <WinBar label={match.homeTeam} pct={homePct} />
          <WinBar label={match.awayTeam} pct={awayPct} />
        </div>
      </section>

      {/* AI 분석 */}
      <section className="mt-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <button onClick={runAi} disabled={aiLoading}
          className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-purple-700 transition">
          {aiLoading ? 'AI 분석 중...' : '🤖 AI 승부 분석'}
        </button>
        {aiError && <div className="mt-2 text-xs text-red-500">{aiError}</div>}
        {aiText && <div className="mt-3 text-sm text-gray-700 bg-purple-50 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">{aiText}</div>}
      </section>

      {/* 양팀 정보 */}
      <section className="mt-4 grid grid-cols-2 gap-3">
        <TeamInfoCard name={match.homeTeam} badge={match.homeBadge} rating={eloPred?.homeRating} pct={homePct} />
        <TeamInfoCard name={match.awayTeam} badge={match.awayBadge} rating={eloPred?.awayRating} pct={awayPct} />
      </section>

      {/* 선수 정보 한계 안내 */}
      <section className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="text-sm font-bold text-amber-800 mb-1">ℹ️ 선수 정보 안내</div>
        <p className="text-xs text-amber-700 leading-relaxed">
          무료 데이터 소스(TheSportsDB)는 경기별 라인업·로스터를 제공하지 않습니다.
          상세 선수 명단은 유료 API 또는 크롤러 연동 시 제공 가능합니다.
          현재는 팀 전력(ELO 승률)과 AI 분석만 제공됩니다.
        </p>
      </section>

      <p className="mt-6 text-center text-[11px] text-gray-400">
        예측은 데이터 기반 참고용이며, 실제 결과는 달라질 수 있습니다.
      </p>
    </main>
  );
}

function TeamBig({ name, badge, pct, star }) {
  return (
    <div className="flex-1 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden backdrop-blur">
        {badge ? (
          <img src={badge} alt={name} className="w-12 h-12 object-contain" loading="lazy" onError={e => { e.target.style.display = 'none'; }} />
        ) : (
          <span className="text-2xl">{star ? '⭐' : '🔵'}</span>
        )}
      </div>
      <div className="mt-2 text-sm font-bold leading-tight">{star ? '⭐ ' : ''}{name}</div>
      <div className="text-2xl font-black mt-1">{pct}%</div>
    </div>
  );
}

function WinBar({ label, pct }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-emerald-100 mb-1">
        <span className="truncate max-w-[60%]">{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-white/25 rounded-full overflow-hidden">
        <div className="h-full bg-white rounded-full" style={{ width: `${Math.max(pct, 4)}%` }} />
      </div>
    </div>
  );
}

function TeamInfoCard({ name, badge, rating, pct }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
          {badge ? (
            <img src={badge} alt={name} className="w-6 h-6 object-contain" loading="lazy" onError={e => { e.target.style.display = 'none'; }} />
          ) : <span className="text-xs">🔵</span>}
        </div>
        <div className="text-sm font-bold text-gray-800 truncate">{name}</div>
      </div>
      <div className="mt-3 flex justify-between text-xs">
        <span className="text-gray-400">ELO</span>
        <span className="font-bold text-gray-700">{rating}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">승리 확률</span>
        <span className="font-bold text-emerald-600">{pct}%</span>
      </div>
    </div>
  );
}
