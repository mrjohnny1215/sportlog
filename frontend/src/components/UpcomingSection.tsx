"use client";

import { useEffect, useState } from "react";
import ScoreboardMatchCard from "@/components/ScoreboardMatchCard";
import type { Game } from "@/types/sports";

const API = process.env.NEXT_PUBLIC_API_BASE || "https://sportlog-backend-production.up.railway.app";

function fmtDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  }).format(d);
}

export default function UpcomingSection({ days = 7 }: { days?: number }) {
  const [items, setItems] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API}/api/upcoming?days=${days}`)
      .then((r) => r.json())
      .then((d) => setItems(d.games || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-[#8b98a9] tracking-widest">
          📅 앞으로 7일 예정 경기
        </h2>
        <span className="text-[11px] text-[#8b98a9]">
          {loading ? "불러오는 중…" : `총 ${items.length}경기`}
        </span>
      </div>

      {error && (
        <div className="text-center py-6 text-red-400 text-sm">{error}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-8 text-[#8b98a9] text-sm border border-dashed border-board-border rounded-xl">
          앞으로 7일간 예정된 경기가 없습니다.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {items.map((g) => (
          <ScoreboardMatchCard key={g.id} game={g} />
        ))}
      </div>
    </section>
  );
}
