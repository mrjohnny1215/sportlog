import React, { useState, useEffect, useMemo } from 'react';
import { fetchMatches } from './api';
import { loadRecords, saveRecords, upsertRecord, getRecord } from './storage';
import { analyze } from './analytics';
import MatchCard from './components/MatchCard';
import Dashboard from './components/Dashboard';

export default function App() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState(loadRecords());
  const [selDate, setSelDate] = useState(new Date());
  const [openId, setOpenId] = useState(null);

  const load = async (date) => {
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
  };

  useEffect(() => { load(selDate); }, []);

  const stats = useMemo(() => analyze(records), [records]);

  const handleSave = (matchId, data) => {
    const next = upsertRecord([...records], matchId, data);
    setRecords(next);
    saveRecords(next);
    setOpenId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-black">⚽⚾ SportLog</h1>
          <p className="text-xs text-emerald-100">개인용 경기 분석 / 베팅 기록 (분석용)</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        <Dashboard stats={stats} />

        {/* 날짜 선택 */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={`${selDate.getFullYear()}-${String(selDate.getMonth()+1).padStart(2,'0')}-${String(selDate.getDate()).padStart(2,'0')}`}
            onChange={(e) => {
              const [y, m, d] = e.target.value.split('-').map(Number);
              setSelDate(new Date(y, m - 1, d));
              load(new Date(y, m - 1, d));
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button onClick={() => { setSelDate(new Date()); load(new Date()); }}
            className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm">오늘</button>
        </div>

        {loading && <p className="text-gray-500 text-sm">경기 불러오는 중...</p>}
        {error && <p className="text-red-500 text-sm">오류: {error}</p>}
        {!loading && !error && matches.length === 0 && (
          <p className="text-gray-500 text-sm py-8 text-center">해당 날짜에 축구/야구 경기가 없습니다 (오프시즌일 수 있음).</p>
        )}

        <div className="space-y-3">
          {matches.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              record={getRecord(records, m.id)}
              open={openId === m.id}
              onToggle={() => setOpenId(openId === m.id ? null : m.id)}
              onSave={(data) => handleSave(m.id, { ...data, league: m.league, homeTeam: m.homeTeam, awayTeam: m.awayTeam, event: m.event })}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
