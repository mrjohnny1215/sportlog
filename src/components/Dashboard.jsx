import React from 'react';

export default function Dashboard({ stats }) {
  const cards = [
    { label: '누적 손익', value: `${stats.profit >= 0 ? '+' : ''}${stats.profit.toLocaleString()}`, color: stats.profit >= 0 ? 'text-emerald-600' : 'text-red-600' },
    { label: 'ROI', value: `${stats.roi}%`, color: stats.roi >= 0 ? 'text-emerald-600' : 'text-red-600' },
    { label: '승률', value: `${stats.winRate}%`, color: 'text-gray-800' },
    { label: '기록 수', value: stats.total, color: 'text-gray-800' },
  ];
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-sm font-bold text-gray-700 mb-3">📊 내 분석</h2>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c) => (
          <div key={c.label} className="text-center">
            <div className={`text-lg font-black ${c.color}`}>{c.value}</div>
            <div className="text-[10px] text-gray-400">{c.label}</div>
          </div>
        ))}
      </div>
      {stats.total > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-[11px] text-gray-500 mb-1">리그별</div>
          <div className="space-y-1">
            {Object.entries(stats.byLeague).map(([lg, v]) => (
              <div key={lg} className="flex justify-between text-xs">
                <span className="text-gray-600">{lg}</span>
                <span className={v.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {v.wins}/{v.total} · {v.profit >= 0 ? '+' : ''}{Math.round(v.profit).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
