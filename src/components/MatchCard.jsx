import React from 'react';
import { teamColor } from '../teamColors';

function Badge({ src, name }) {
  const [err, setErr] = React.useState(false);
  if (src && !err) {
    return (
      <img src={src} alt={name} className="w-14 h-14 object-contain drop-shadow"
        onError={() => setErr(true)} />
    );
  }
  const initial = (name || '?').trim().charAt(0);
  return (
    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xl font-black">
      {initial}
    </div>
  );
}

export default function MatchCard({ match, eloPred, onClick }) {
  const homePct = eloPred?.homeWin ?? 50;
  const awayPct = eloPred?.awayWin ?? 50;
  const favored = eloPred?.favored;
  const leagueShort = (match.league || '').replace(/\s*(Baseball|Soccer|League)$/i, '').slice(0, 18);
  const homeC = teamColor(match.homeTeam);
  const awayC = teamColor(match.awayTeam);

  return (
    <button onClick={onClick}
      className="group relative w-full text-left bg-white rounded-3xl border border-gray-100 shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.14)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* 상단 팀컬러 스트라이프 */}
      <div className="h-1.5 flex">
        <div className="flex-1" style={{ background: homeC }} />
        <div className="flex-1" style={{ background: awayC }} />
      </div>

      <div className="p-4">
        {/* 리그 + 시간 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">{leagueShort}</span>
          <span className="text-[11px] font-semibold text-gray-400">{match.time ? match.time.slice(0, 5) : '시간 미정'}</span>
        </div>

        {/* 대진 (세로형: 배지 위 / 팀명 아래) */}
        <div className="flex items-stretch gap-2">
          {/* 홈 */}
          <div className="flex-1 flex flex-col items-center text-center min-w-0">
            <div className="relative mb-2">
              <div className="absolute inset-0 rounded-full blur-md opacity-30" style={{ background: homeC }} />
              <Badge src={match.homeBadge} name={match.homeTeam} />
            </div>
            <div className={`text-[13px] leading-snug font-extrabold whitespace-normal break-words w-full ${favored === 'home' ? 'text-gray-900' : 'text-gray-500'}`} title={match.homeTeam}>
              {favored === 'home' && '⭐ '}{match.homeTeam}
            </div>
            <div className="mt-1 inline-block text-[9px] font-black tracking-wider text-white px-1.5 py-0.5 rounded bg-gray-800">HOME</div>
          </div>

          {/* VS */}
          <div className="shrink-0 flex items-center">
            <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-[10px] font-black flex items-center justify-center shadow">VS</div>
          </div>

          {/* 원정 */}
          <div className="flex-1 flex flex-col items-center text-center min-w-0">
            <div className="relative mb-2">
              <div className="absolute inset-0 rounded-full blur-md opacity-30" style={{ background: awayC }} />
              <Badge src={match.awayBadge} name={match.awayTeam} />
            </div>
            <div className={`text-[13px] leading-snug font-extrabold whitespace-normal break-words w-full ${favored === 'away' ? 'text-gray-900' : 'text-gray-500'}`} title={match.awayTeam}>
              {favored === 'away' && '⭐ '}{match.awayTeam}
            </div>
            <div className="mt-1 inline-block text-[9px] font-black tracking-wider text-white px-1.5 py-0.5 rounded bg-gray-400">AWAY</div>
          </div>
        </div>

        {/* 승률 바 */}
        <div className="mt-4 flex items-center gap-2.5">
          <span className="text-[14px] font-black w-12 text-right tabular-nums" style={{ color: homeC }}>{homePct}%</span>
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden flex">
            <div className="h-full rounded-l-full transition-all duration-500" style={{ width: `${homePct}%`, background: `linear-gradient(90deg, ${homeC}, ${homeC}aa)` }} />
            <div className="h-full rounded-r-full transition-all duration-500" style={{ width: `${awayPct}%`, background: `linear-gradient(90deg, ${awayC}aa, ${awayC})` }} />
          </div>
          <span className="text-[14px] font-black w-12 tabular-nums" style={{ color: awayC }}>{awayPct}%</span>
        </div>

        <div className="mt-3.5 pt-3 border-t border-gray-50 flex justify-between items-center">
          <span className="text-[10px] font-semibold text-gray-400" title="팀 전력 지수 (ELO 레이팅)">ELO {eloPred?.homeRating} : {eloPred?.awayRating}</span>
          <span className="text-[12px] font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">분석 보기 →</span>
        </div>
      </div>
    </button>
  );
}
