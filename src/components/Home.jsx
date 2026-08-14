import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchMatches } from '../api';
import { loadElo, predict } from '../elo';
import MatchCard from './MatchCard';

export default function Home({ stats }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const today = new Date();
  const initial = searchParams.get('date');
  const initialDate = initial ? new Date(initial + 'T00:00:00') : today;
  const [selDate, setSelDate] = useState(initialDate);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const elo = useState(() => loadElo())[0];

  const load = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      let m = await fetchMatches(date);
      // 오늘 날짜인데 경기 없으면 가장 최근 경기 있는 날(7/15)로 폴백
      const isToday = date.toDateString() === new Date().toDateString();
      if (isToday && m.length === 0) {
        const fallback = new Date(2026, 6, 15);
        m = await fetchMatches(fallback);
        if (m.length > 0) setSelDate(fallback);
      }
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
      {/* 히어로 (스포츠풍 다크 그라데이션) */}
      <section className="relative mb-5 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 px-5 py-6 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Prediction
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5">
            {isToday ? '오늘의 경기' : `${ds} 경기`}
          </h1>
          <p className="text-sm text-slate-300 mt-1">승무패 예측 · ELO 모델 기반 분석</p>
        </div>
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
          <div className="text-4xl mb-3">📭</div>
          {isToday ? (
            <>
              <p className="text-gray-600 text-sm font-medium">오늘은 축구/야구 경기가 없어요</p>
              <p className="text-gray-400 text-xs mt-1.5">오프시즌이거나 데이터 미제공일 수 있습니다.</p>
              <button onClick={() => setSelDate(new Date(2026, 6, 15))}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
                최근 경기 있는 날 보기 (7/15)
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500 text-sm">해당 날짜에 축구/야구 경기가 없습니다.</p>
              <p className="text-gray-400 text-xs mt-1">오프시즌이거나 데이터 미제공일 수 있습니다.</p>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
