import React from 'react';

export default function MatchCard({ match, eloPred, onClick }) {
  const homePct = eloPred?.homeWin ?? 50;
  const awayPct = eloPred?.awayWin ?? 50;
  const favored = eloPred?.favored;
  const leagueShort = (match.league || '').replace(/\s*(Baseball|Soccer|League)$/i, '').slice(0, 14);

  return (
    <button onClick={onClick} className="text-left bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm hover:shadow-md hover:border-emerald-200 transition w-full">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{leagueShort}</span>
        <span className="text-[10px] text-gray-400">{match.time || '시간 미정'}</span>
      </div>

      <div className="space-y-1.5">
        <TeamRow name={match.homeTeam} pct={homePct} star={favored === 'home'} align="left" />
        <TeamRow name={match.awayTeam} pct={awayPct} star={favored === 'away'} align="left" />
      </div>

      <div className="mt-3 pt-2.5 border-t border-gray-50 flex justify-between items-center">
        <span className="text-[10px] text-gray-400">ELO {eloPred?.homeRating} : {eloPred?.awayRating}</span>
        <span className="text-[11px] text-emerald-600 font-medium">분석 보기 →</span>
      </div>
    </button>
  );
}

function TeamRow({ name, pct, star, align }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-800 truncate flex-1">{star ? '⭐ ' : ''}{name}</span>
      <div className="flex items-center gap-1.5">
        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(pct, 3)}%` }} />
        </div>
        <span className="text-[11px] font-bold text-gray-600 w-9 text-right">{pct}%</span>
      </div>
    </div>
  );
}
