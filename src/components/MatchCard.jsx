import React from 'react';

export default function MatchCard({ match, eloPred, onClick }) {
  const homePct = eloPred?.homeWin ?? 50;
  const awayPct = eloPred?.awayWin ?? 50;
  const favored = eloPred?.favored;
  const leagueShort = (match.league || '').replace(/\s*(Baseball|Soccer|League)$/i, '').slice(0, 14);

  return (
    <button onClick={onClick} className="text-left bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm hover:shadow-md hover:border-emerald-300 transition w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{leagueShort}</span>
        <span className="text-[11px] text-gray-400">{match.time ? match.time.slice(0, 5) : '시간 미정'}</span>
      </div>

      <div className="space-y-2.5">
        <TeamRow name={match.homeTeam} pct={homePct} star={favored === 'home'} />
        <TeamRow name={match.awayTeam} pct={awayPct} star={favored === 'away'} />
      </div>

      <div className="mt-3.5 pt-3 border-t border-gray-50 flex justify-between items-center">
        <span className="text-[10px] text-gray-400">ELO {eloPred?.homeRating} : {eloPred?.awayRating}</span>
        <span className="text-[12px] text-emerald-600 font-semibold">분석 보기 →</span>
      </div>
    </button>
  );
}

function TeamRow({ name, pct, star }) {
  const win = pct >= 50;
  return (
    <div className="flex items-center gap-2.5">
      <span className={`text-sm font-bold truncate flex-1 ${star ? 'text-gray-900' : 'text-gray-600'}`}>
        {star ? '⭐ ' : ''}{name}
      </span>
      <div className="flex items-center gap-2">
        <div className="w-20 h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${win ? 'bg-emerald-500' : 'bg-gray-400'}`}
            style={{ width: `${Math.max(pct, 4)}%` }}
          />
        </div>
        <span className={`text-[12px] font-black w-10 text-right ${win ? 'text-emerald-600' : 'text-gray-500'}`}>{pct}%</span>
      </div>
    </div>
  );
}
