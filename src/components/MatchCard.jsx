import React, { useState } from 'react';

const PICKS = [
  { key: 'home', label: '홈 승' },
  { key: 'draw', label: '무/패스' },
  { key: 'away', label: '원정 승' },
];
const RESULTS = [
  { key: 'win', label: '✅ 승' },
  { key: 'lose', label: '❌ 패' },
  { key: 'push', label: '➖ 무효' },
];

export default function MatchCard({ match, record, open, onToggle, onSave }) {
  const [pick, setPick] = useState(record?.pick || 'home');
  const [stake, setStake] = useState(record?.stake || '');
  const [odds, setOdds] = useState(record?.odds || '');
  const [result, setResult] = useState(record?.result || '');

  const savedColor = record?.result === 'win' ? 'border-emerald-400' : record?.result === 'lose' ? 'border-red-400' : record?.result === 'push' ? 'border-gray-300' : 'border-gray-100';

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 ${savedColor} p-3`}>
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[11px] text-gray-400">{match.league} · {match.time || '시간미정'}</div>
            <div className="font-bold text-gray-800">{match.homeTeam} vs {match.awayTeam}</div>
          </div>
          <div className="text-xs text-emerald-600">{open ? '△' : '▽'}</div>
        </div>
        {record?.result && (
          <div className="mt-1 text-xs text-gray-500">
            기록: {PICKS.find(p=>p.key===record.pick)?.label} · 배팅 {record.stake} @ {record.odds} · {RESULTS.find(r=>r.key===record.result)?.label}
          </div>
        )}
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          <div>
            <div className="text-xs font-bold text-gray-600 mb-1">예측</div>
            <div className="flex gap-2">
              {PICKS.map((p) => (
                <button key={p.key} onClick={() => setPick(p.key)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${pick===p.key ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-600">배팅액</label>
              <input type="number" value={stake} onChange={(e)=>setStake(e.target.value)}
                placeholder="예: 10000" className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-600">배당(odds)</label>
              <input type="number" step="0.01" value={odds} onChange={(e)=>setOdds(e.target.value)}
                placeholder="예: 1.85" className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-600 mb-1">결과</div>
            <div className="flex gap-2">
              {RESULTS.map((r) => (
                <button key={r.key} onClick={() => setResult(r.key)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${result===r.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => onSave({ pick, stake: Number(stake), odds: Number(odds), result })}
            className="w-full bg-emerald-700 text-white py-2.5 rounded-lg font-bold text-sm">
            저장
          </button>
        </div>
      )}
    </div>
  );
}
