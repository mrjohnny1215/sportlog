import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchMatches } from '../api';
import { loadElo, predict } from '../elo';
import { hasGroqKey, explainPrediction } from '../ai';
import { teamColor } from '../teamColors';

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
  const drawPct = eloPred?.draw ?? 0;
  const isSoccer = (match.sport || '') === 'Soccer';
  const homeGrad = teamColor(match.homeTeam);
  const awayGrad = teamColor(match.awayTeam);

  return (
    <main className="max-w-2xl mx-auto px-4 py-4">
      <button onClick={() => navigate('/')} className="text-sm text-gray-500 mb-4">← 목록</button>

      {/* 대진표 헤더 (팀 컬러 대칭) */}
      <section className="rounded-3xl overflow-hidden shadow-lg">
        <div className="flex">
          <div className="flex-1 p-5 text-white" style={{ background: homeGrad }}>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/25 border border-white/40 flex items-center justify-center overflow-hidden backdrop-blur">
              {match.homeBadge ? <img src={match.homeBadge} alt={match.homeTeam} className="w-11 h-11 object-contain" onError={e => { e.target.style.display = 'none'; }} /> : <span className="text-xl">{eloPred?.favored === 'home' ? '⭐' : '🔵'}</span>}
            </div>
            <div className="mt-2 text-center text-sm font-bold leading-tight">{eloPred?.favored === 'home' ? '⭐ ' : ''}{match.homeTeam}</div>
            <div className="text-center text-3xl font-black mt-1">{homePct}%</div>
          </div>
          <div className="w-14 flex items-center justify-center bg-white shrink-0">
            <span className="text-xs font-black text-gray-400">VS</span>
          </div>
          <div className="flex-1 p-5 text-white text-right" style={{ background: awayGrad }}>
            <div className="w-14 h-14 ml-auto rounded-2xl bg-white/25 border border-white/40 flex items-center justify-center overflow-hidden backdrop-blur">
              {match.awayBadge ? <img src={match.awayBadge} alt={match.awayTeam} className="w-11 h-11 object-contain" onError={e => { e.target.style.display = 'none'; }} /> : <span className="text-xl">{eloPred?.favored === 'away' ? '⭐' : '🔵'}</span>}
            </div>
            <div className="mt-2 text-center text-sm font-bold leading-tight">{eloPred?.favored === 'away' ? '⭐ ' : ''}{match.awayTeam}</div>
            <div className="text-center text-3xl font-black mt-1">{awayPct}%</div>
          </div>
        </div>
        <div className="bg-white px-5 py-3 text-xs text-gray-400 text-center">
          {match.league} · {match.time ? match.time.slice(0, 5) : '시간 미정'}
        </div>
      </section>

      {/* 3-way 승률 바 */}
      <section className="mt-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="text-xs font-bold text-gray-500 mb-3">승률 분포 (ELO 모델)</div>
        <WinBar label={`${match.homeTeam} 승`} pct={homePct} color={homeGrad} />
        {isSoccer && <WinBar label="무승부" pct={drawPct} color="linear-teamColor(135deg,#9ca3af,#d1d5db)" />}
        <WinBar label={`${match.awayTeam} 승`} pct={awayPct} color={awayGrad} />
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
        <TeamInfoCard name={match.homeTeam} badge={match.homeBadge} rating={eloPred?.homeRating} pct={homePct} grad={homeGrad} />
        <TeamInfoCard name={match.awayTeam} badge={match.awayBadge} rating={eloPred?.awayRating} pct={awayPct} grad={awayGrad} />
      </section>

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

function WinBar({ label, pct, color }) {
  const [c] = (color.match(/hsl\([^)]+\)|#[0-9a-fA-F]{6}/g) || ['#10b981']);
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="flex justify-between text-[11px] text-gray-500 mb-1">
        <span className="truncate max-w-[70%]">{label}</span>
        <span className="font-bold" style={{ color: c }}>{pct}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-2.5 rounded-full" style={{ width: `${Math.max(pct, 3)}%`, background: c }} />
      </div>
    </div>
  );
}

function TeamInfoCard({ name, badge, rating, pct, grad }) {
  const [c] = (grad.match(/hsl\([^)]+\)|#[0-9a-fA-F]{6}/g) || ['#10b981']);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0" style={{ background: grad }}>
          {badge ? <img src={badge} alt={name} className="w-7 h-7 object-contain" onError={e => { e.target.style.display = 'none'; }} /> : <span className="text-sm">🔵</span>}
        </div>
        <div className="text-sm font-bold text-gray-800 truncate">{name}</div>
      </div>
      <div className="mt-3 flex justify-between text-xs">
        <span className="text-gray-400">ELO</span>
        <span className="font-bold text-gray-700">{rating}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">승리 확률</span>
        <span className="font-bold" style={{ color: c }}>{pct}%</span>
      </div>
    </div>
  );
}
