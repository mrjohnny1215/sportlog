import React from 'react';

export default function MatchCard({ match, eloPred, onClick }) {
  const homePct = eloPred?.homeWin ?? 50;
  const awayPct = eloPred?.awayWin ?? 50;
  const favored = eloPred?.favored;
  const leagueShort = (match.league || '').replace(/\s*(Baseball|Soccer|League)$/i, '').slice(0, 16);

  return (
    <button onClick={onClick} className="text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-lg hover:border-emerald-300 hover:-translate-y-0.5 transition-all w-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">{leagueShort}</span>
        <span className="text-[11px] text-gray-400 font-medium">{match.time ? match.time.slice(0, 5) : '시간 미정'}</span>
      </div>

      <div className="space-y-4">
        <TeamRow name={match.homeTeam} badge={match.homeBadge} pct={homePct} star={favored === 'home'} />
        <div className="border-t border-dashed border-gray-100" />
        <TeamRow name={match.awayTeam} badge={match.awayBadge} pct={awayPct} star={favored === 'away'} />
      </div>

      <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
        <span className="text-[10px] text-gray-400">ELO {eloPred?.homeRating} : {eloPred?.awayRating}</span>
        <span className="text-[12px] text-emerald-600 font-semibold">분석 보기 →</span>
      </div>
    </button>
  );
}

function TeamRow({ name, badge, pct, star }) {
  const win = pct >= 50;
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
        {badge ? (
          <img src={badge} alt={name} className="w-7 h-7 object-contain" loading="lazy"
            onError={e => { e.target.style.display = 'none'; }} />
        ) : (
          <span className="text-xs">{star ? '⭐' : '🔵'}</span>
        )}
      </div>
      <span className={`text-sm font-bold truncate flex-1 ${star ? 'text-gray-900' : 'text-gray-600'}`}>
        {name}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${win ? 'bg-emerald-500' : 'bg-gray-400'}`}
            style={{ width: `${Math.max(pct, 4)}%` }}
          />
        </div>
        <span className={`text-[12px] font-black w-10 text-right ${win ? 'text-emerald-600' : 'text-gray-500'}`}>{pct}%</span>
      </div>
    </div>
  );
}
