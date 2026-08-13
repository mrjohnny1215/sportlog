import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMatches } from '../api';
import { loadElo, predict } from '../elo';
import MatchCard from './MatchCard';

export default function Home({ records, stats }) {
  const navigate = useNavigate();
  const today = new Date();
  const [selDate, setSelDate] = useState(today);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const elo = useState(() => loadElo())[0];

  const load = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const m = await fetchMatches(date);
      setMatches(m);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(selDate); }, [selDate, load]);

  const shiftDate = (days) => {
    const d = new Date(selDate);
    d.setDate(d.getDate() + days);
    setSelDate(d);
  };

  const ds = `${selDate.getFullYear()}-${String(selDate.getMonth() + 1).padStart(2, '0')}-${String(selDate.getDate()).padStart(2, '0')}`;
  const isToday = ds === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <main className="max-w-3xl mx-auto px-4 py-4">
      {/* 히어로 */}
      <section className="mb-5">
        <h1 className="text-2xl font-black text-gray-900">{isToday ? '오늘의 경기' : `${ds} 경기`}</h1>
        <p className="text-sm text-gray-500 mt-1">승무패 예측 · ELO 모델 기반 분석</p>
      </section>

      {/* 날짜 네비 */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => shiftDate(-1)} className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 text-lg">‹</button>
        <input type="date" value={ds}
          onChange={e => { const [y, m, d] = e.target.value.split('-').map(Number); setSelDate(new Date(y, m - 1, d)); }}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700" />
        <button onClick={() => shiftDate(1)} className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 text-lg">›</button>
        {!isToday && (
          <button onClick={() => setSelDate(today)} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm">오늘</button>
        )}
      </div>

      {/* 분석 요약 (간결) */}
      {stats.total > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { l: '기록', v: stats.total },
            { l: '승률', v: `${stats.winRate}%` },
            { l: 'ROI', v: `${stats.roi}%` },
            { l: '손익', v: `${stats.profit >= 0 ? '+' : ''}${stats.profit}` },
          ].map(c => (
            <div key={c.l} className="bg-white rounded-xl border border-gray-100 p-2.5 text-center">
              <div className="text-base font-black text-gray-900">{c.v}</div>
              <div className="text-[10px] text-gray-400">{c.l}</div>
            </div>
          ))}
        </div>
      )}

      {loading && <p className="text-gray-400 text-sm py-10 text-center">경기 불러오는 중...</p>}
      {error && <p className="text-red-500 text-sm py-10 text-center">오류: {error}</p>}
      {!loading && !error && matches.length === 0 && (
        <div className="py-16 text-center">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-gray-500 text-sm">해당 날짜에 축구/야구 경기가 없습니다.</p>
          <p className="text-gray-400 text-xs mt-1">오프시즌이거나 데이터 미제공일 수 있습니다.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {matches.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            eloPred={predict(m.homeTeam, m.awayTeam, elo, m.sport)}
            onClick={() => navigate(`/game/${encodeURIComponent(m.id)}`, { state: { date: ds } })}
          />
        ))}
      </div>
    </main>
  );
}
