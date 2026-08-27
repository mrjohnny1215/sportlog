"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PredictionDetail } from "@/types/sports";

function fmtTime(iso: string | null) {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export default function PredictionModal({
  gameId,
  onClose,
}: {
  gameId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<PredictionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .prediction(gameId)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
    };
  }, [gameId, onClose]);

  const g = data?.game;
  const p = g?.prediction;
  const h2h = data?.h2h;
  const momentum = data?.momentum;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-board-border bg-board-card p-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md border border-board-border px-2 py-1 text-xs text-[#8b98a9] hover:text-white"
        >
          닫기
        </button>

        {loading && (
          <div className="py-10 text-center text-sm text-[#8b98a9]">불러오는 중…</div>
        )}
        {error && <div className="py-6 text-center text-sm text-red-400">{error}</div>}

        {!loading && !error && g && (
          <>
            {/* header */}
            <div className="flex items-center justify-between text-xs text-[#8b98a9] mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold">{g.league}</span>
                <span className="rounded-md border border-board-border px-1.5 py-0.5">
                  {g.sport.toUpperCase()}
                </span>
                <span>{fmtTime(g.game_datetime)}</span>
              </div>
              <span>{g.status === "scheduled" ? "예정" : g.status}</span>
            </div>

            {/* teams */}
            <div className="flex items-center justify-between rounded-xl border border-board-border bg-[#0B0E14] p-4">
              <div className="flex-1 text-center">
                <div className="text-base font-black">{g.away_team_name}</div>
                <div className="text-[10px] text-[#8b98a9]">원정</div>
              </div>
              <div className="px-4 text-2xl font-black tabular text-[#8b98a9]">VS</div>
              <div className="flex-1 text-center">
                <div className="text-base font-black">{g.home_team_name}</div>
                <div className="text-[10px] text-[#8b98a9]">홈</div>
              </div>
            </div>

            {/* starters */}
            {g.sport === "baseball" && (g.away_starter || g.home_starter) && (
              <div className="mt-3 text-[11px] text-[#8b98a9] flex justify-between rounded-lg border border-board-border p-2">
                <span>
                  선발(원) {g.away_starter}
                  {g.away_starter_era ? ` ERA ${g.away_starter_era}` : ""}
                </span>
                <span>
                  선발(홈) {g.home_starter}
                  {g.home_starter_era ? ` ERA ${g.home_starter_era}` : ""}
                </span>
              </div>
            )}

            {/* AI prediction */}
            {p && (
              <div className="mt-4 rounded-xl border border-board-border p-3">
                <h3 className="text-sm font-black text-led-gold mb-2">🤖 AI 예측</h3>
                <p className="text-xs text-[#8b98a9] mb-2">{p.ai_summary}</p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-board-border p-2">
                    <div className="text-[#8b98a9]">승/무/패</div>
                    <div className="font-bold">
                      {p.ml_pick === "home"
                        ? g.home_team_name
                        : p.ml_pick === "away"
                        ? g.away_team_name
                        : "무승부"}{" "}
                      {p.ml_pick === "home"
                        ? p.ml_home_pct
                        : p.ml_pick === "away"
                        ? p.ml_away_pct
                        : p.ml_draw_pct}
                      %
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded bg-[#232D3F]">
                      <div
                        className="h-1.5 rounded bg-led-win"
                        style={{ width: `${Math.max(p.ml_home_pct, p.ml_away_pct, p.ml_draw_pct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-board-border p-2">
                    <div className="text-[#8b98a9]">핸디캡</div>
                    <div className="font-bold">
                      {p.hc_pick === "home" ? "홈" : "원정"} {p.hc_line} (
                      {p.hc_cover_pct}%)
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded bg-[#232D3F]">
                      <div
                        className="h-1.5 rounded bg-[#00E5FF]"
                        style={{ width: `${p.hc_cover_pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-board-border p-2">
                    <div className="text-[#8b98a9]">언/오버 {p.tot_line}</div>
                    <div className="font-bold">
                      {p.tot_pick === "over" ? "OVER" : "UNDER"} ({p.tot_pct}%)
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded bg-[#232D3F]">
                      <div
                        className="h-1.5 rounded bg-[#FFD000]"
                        style={{ width: `${p.tot_pct}%` }}
                      />
                    </div>
                  </div>

                  {p.nrfi_pick && (
                    <div className="rounded-lg border border-board-border p-2">
                      <div className="text-[#8b98a9]">1회 득점</div>
                      <div className="font-bold">
                        {p.nrfi_pick === "NRFI" ? "NRFI" : "YRFI"} (
                        {p.nrfi_pick === "NRFI" ? p.nrfi_pct : p.yrfi_pct}%)
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded bg-[#232D3F]">
                        <div
                          className="h-1.5 rounded bg-[#FF8C00]"
                          style={{
                            width: `${p.nrfi_pick === "NRFI" ? p.nrfi_pct : p.yrfi_pct}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-2 text-[11px] text-[#8b98a9]">
                  AI 신뢰도 <span className="text-led-gold font-bold">{p.confidence}%</span>
                  {p.value_bet && (
                    <span className="ml-2 rounded-md border border-[#FF3B30] px-1.5 py-0.5 text-[10px] text-[#FF3B30]">
                      🔥 가치역배
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* H2H + Momentum */}
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-board-border p-3">
                <h3 className="text-sm font-black text-[#e6edf3] mb-1">📚 상대전적</h3>
                <div className="text-xs text-[#8b98a9]">
                  {h2h ? (
                    <>
                      <span className="text-led-win">홈 {h2h.home_wins}승 </span>
                      <span>무 {h2h.draws} </span>
                      <span className="text-[#00E5FF]">원정 {h2h.away_wins}승</span>
                      <span className="ml-2 text-[#8b98a9]">({h2h.games}경기)</span>
                    </>
                  ) : (
                    "상대전적 데이터 없음"
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-board-border p-3">
                <h3 className="text-sm font-black text-[#e6edf3] mb-1">📈 최근 폼</h3>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex-1">
                    <div className="text-[#8b98a9]">홈 {g?.home_team_name}</div>
                    <div className="mt-1 flex gap-1">
                      {(momentum?.home || []).map((v, i) => (
                        <span
                          key={i}
                          className="tabular rounded border border-board-border px-1 py-0.5"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[#8b98a9]">원정 {g?.away_team_name}</div>
                    <div className="mt-1 flex gap-1">
                      {(momentum?.away || []).map((v, i) => (
                        <span
                          key={i}
                          className="tabular rounded border border-board-border px-1 py-0.5"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* lineup placeholder */}
            <div className="mt-4 rounded-xl border border-dashed border-board-border p-3 text-xs text-[#8b98a9]">
              라인업 정보는 현재 경기 2시간 전 PROJECTED 라인업 이후 CONFIRMED 라인업으로 자동 노출됩니다.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
