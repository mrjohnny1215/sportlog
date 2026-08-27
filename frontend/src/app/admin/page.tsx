"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type AdminHealth = {
  status: string;
  db: string;
  games: number;
  predictions: number;
  tz: string;
};

type AdminGame = {
  id: string;
  league: string;
  sport: string;
  game_datetime: string | null;
  status: string;
  home_team_name: string;
  away_team_name: string;
  home_score: number | null;
  away_score: number | null;
  prediction: {
    ml_pick: string;
    confidence: number;
    resolved: boolean;
    ml_correct: boolean | null;
    hc_correct: boolean | null;
    tot_correct: boolean | null;
    nrfi_correct: boolean | null;
  } | null;
};

export default function AdminDashboard() {
  const [health, setHealth] = useState<AdminHealth | null>(null);
  const [games, setGames] = useState<AdminGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setActionMsg(null);
    try {
      const [h, g] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE || "https://sportlog-backend-production.up.railway.app"}/api/health`).then(r => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE || "https://sportlog-backend-production.up.railway.app"}/api/games?limit=100`).then(r => r.json()),
      ]);
      setHealth(h);
      setGames((g.games || []).map((x: any) => ({ ...x, prediction: x.prediction || null })));
    } catch (e: any) {
      setActionMsg(`로드 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function runPredictions() {
    setActionMsg("예측 생성 중…");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "https://sportlog-backend-production.up.railway.app"}/api/admin/run-predictions`, { method: "POST" });
      const data = await res.json();
      setActionMsg(`완료: ${data.generated}건 생성`);
      load();
    } catch (e: any) {
      setActionMsg(`실패: ${e.message}`);
    }
  }

  async function seedNow() {
    setActionMsg("시드 실행 중…");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "https://sportlog-backend-production.up.railway.app"}/api/admin/seed`, { method: "POST" });
      const data = await res.json();
      setActionMsg(`완료: teams=${data.teams_ok}, logs=${data.logs}, games=${data.games}`);
      load();
    } catch (e: any) {
      setActionMsg(`실패: ${e.message}`);
    }
  }

  const stats = {
    total: games.length,
    scheduled: games.filter(g => g.status === "scheduled").length,
    withPred: games.filter(g => !!g.prediction).length,
    resolved: games.filter(g => g.prediction?.resolved).length,
  };

  return (
    <main className="max-w-6xl mx-auto px-3 pb-16">
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-lg font-black text-led-gold">🛠 Admin Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={load} className="px-3 py-1.5 rounded-md border border-board-border text-xs font-bold text-[#8b98a9] hover:text-white">새로고침</button>
          <button onClick={runPredictions} className="px-3 py-1.5 rounded-md border border-[#00FF87] text-xs font-bold text-[#00FF87] hover:bg-[#00FF87]/10">예측 재생성</button>
          <button onClick={seedNow} className="px-3 py-1.5 rounded-md border border-[#00E5FF] text-xs font-bold text-[#00E5FF] hover:bg-[#00E5FF]/10">시드/크롤 실행</button>
        </div>
      </div>

      {actionMsg && <div className="mt-3 text-xs text-[#8b98a9] border border-board-border rounded-lg p-2">{actionMsg}</div>}

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "게임 수", value: health?.games ?? stats.total, color: "#e6edf3" },
          { label: "예측 수", value: health?.predictions ?? stats.withPred, color: "#00FF87" },
          { label: "예정 경기", value: stats.scheduled, color: "#00E5FF" },
          { label: "정산 완료", value: stats.resolved, color: "#FFD000" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-board-border bg-board-card p-3">
            <div className="text-[11px] text-[#8b98a9]">{s.label}</div>
            <div className="text-xl font-black tabular" style={{ color: s.color }}>{s.value ?? "—"}</div>
          </div>
        ))}
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-bold text-[#8b98a9] tracking-widest mb-2">📋 예측 현황</h2>
        <div className="rounded-xl border border-board-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#0B0E14] text-[#8b98a9]">
                <tr>
                  <th className="text-left px-3 py-2">리그</th>
                  <th className="text-left px-3 py-2">경기</th>
                  <th className="text-left px-3 py-2">상태</th>
                  <th className="text-left px-3 py-2">예측 픽</th>
                  <th className="text-left px-3 py-2">신뢰도</th>
                  <th className="text-left px-3 py-2">정산</th>
                  <th className="text-left px-3 py-2">승패</th>
                  <th className="text-left px-3 py-2">핸디</th>
                  <th className="text-left px-3 py-2">언오버</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-board-border">
                {loading ? (
                  <tr><td colSpan={9} className="px-3 py-6 text-center text-[#8b98a9]">불러오는 중…</td></tr>
                ) : games.length === 0 ? (
                  <tr><td colSpan={9} className="px-3 py-6 text-center text-[#8b98a9]">데이터 없음</td></tr>
                ) : games.map((g) => {
                  const p = g.prediction;
                  return (
                    <tr key={g.id} className="hover:bg-white/5">
                      <td className="px-3 py-2">{g.league}</td>
                      <td className="px-3 py-2">{g.away_team_name} @ {g.home_team_name}</td>
                      <td className="px-3 py-2">{g.status}</td>
                      <td className="px-3 py-2">{p ? (p.ml_pick === "home" ? "홈" : p.ml_pick === "away" ? "원" : "무") : "—"}</td>
                      <td className="px-3 py-2 tabular">{p ? `${p.confidence}%` : "—"}</td>
                      <td className="px-3 py-2">{p ? (p.resolved ? "완료" : "대기") : "—"}</td>
                      <td className="px-3 py-2 tabular">{p ? (p.ml_correct == null ? "—" : p.ml_correct ? "✅" : "❌") : "—"}</td>
                      <td className="px-3 py-2 tabular">{p ? (p.hc_correct == null ? "—" : p.hc_correct ? "✅" : "❌") : "—"}</td>
                      <td className="px-3 py-2 tabular">{p ? (p.tot_correct == null ? "—" : p.tot_correct ? "✅" : "❌") : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
