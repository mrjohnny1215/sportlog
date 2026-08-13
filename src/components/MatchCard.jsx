import React from 'react';
import { teamColor } from '../teamColors';

function colors(name) {
  const [a] = teamColor(name);
  return a;
}

export default function MatchCard({ match, eloPred, onClick }) {
  const homePct = eloPred?.homeWin ?? 50;
  const awayPct = eloPred?.awayWin ?? 50;
  const leagueShort = (match.league || '').replace(/\s*(Baseball|Soccer|League)$/i, '').slice(0, 16);
  const homeC = colors(match.homeTeam);
  const awayC = colors(match.awayTeam);
  const favored = eloPred?.favored;

  return (
    <button onClick={onClick} className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 hover:-translate-y-0.5 transition-all w-full overflow-hidden">
      {/* 리그/시간 */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-[11px] font-semibold text-gray-500">{leagueShort}</span>
        <span className="text-[11px] text-gray-400 font-medium">{match.time ? match.time.slice(0, 5) : '시간 미정'}</span>
      </div>

      {/* 대결 구도 */}
      <div className="px-4">
        {/* 홈 */}
        <Side name={match.homeTeam} badge={match.homeBadge} pct={homePct} color={homeC} star={favored === 'home'} tag="홈" />
        {/* VS */}
        <div className="flex items-center gap-2 my-1.5">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[10px] font-black text-gray-300">VS</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        {/* 원정 */}
        <Side name={match.awayTeam} badge={match.awayBadge} pct={awayPct} color={awayC} star={favored === 'away'} tag="원정" />
      </div>

      <div className="mt-3 px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <span className="text-[10px] text-gray-400">ELO {eloPred?.homeRating} : {eloPred?.awayRating}</span>
        <span className="text-[12px] text-emerald-600 font-bold">분석 보기 →</span>
      </div>
    </button>
  );
}

function Side({ name, badge, pct, color, star, tag }) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border-2" style={{ borderColor: color, background: '#f8fafc' }}>
          {badge ? (
            <img src={badge} alt={name} className="w-7 h-7 object-contain" loading="lazy" onError={e => { e.target.style.display = 'none'; }} />
          ) : (
            <span className="text-base">{star ? '⭐' : '🔵'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1 rounded">{tag}</span>
            <span className={`text-[13px] font-bold truncate ${star ? 'text-gray-900' : 'text-gray-600'}`}>{star ? '⭐ ' : ''}{name}</span>
          </div>
        </div>
        <span className="text-[15px] font-black shrink-0" style={{ color }}>{pct}%</span>
      </div>
      {/* 승률 막대 (팀 컬러, 굵게) */}
      <div className="mt-1.5 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-2.5 rounded-full" style={{ width: `${Math.max(pct, 4)}%`, background: color }} />
      </div>
    </div>
  );
}
