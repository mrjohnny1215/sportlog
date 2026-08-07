// 베팅 기록 분석
// record: { matchId, pick: 'home'|'draw'|'away', stake, odds, result: 'win'|'lose'|'push' }

export function analyze(records) {
  const done = records.filter((r) => r.result && r.stake != null && r.odds != null);
  const total = done.length;
  const wins = done.filter((r) => r.result === 'win');
  const loses = done.filter((r) => r.result === 'lose');
  const pushes = done.filter((r) => r.result === 'push');

  // 누적 손익: 승= stake*(odds-1), 패= -stake, 무= 0
  let profit = 0;
  let stakeTotal = 0;
  for (const r of done) {
    const s = Number(r.stake) || 0;
    const o = Number(r.odds) || 0;
    stakeTotal += s;
    if (r.result === 'win') profit += s * (o - 1);
    else if (r.result === 'lose') profit -= s;
  }

  const winRate = done.length ? (wins.length / (wins.length + loses.length)) * 100 : 0;
  const roi = stakeTotal ? (profit / stakeTotal) * 100 : 0;

  // 리그별
  const byLeague = {};
  for (const r of done) {
    const lg = r.league || '기타';
    if (!byLeague[lg]) byLeague[lg] = { total: 0, wins: 0, profit: 0 };
    byLeague[lg].total += 1;
    if (r.result === 'win') {
      byLeague[lg].wins += 1;
      byLeague[lg].profit += Number(r.stake) * (Number(r.odds) - 1);
    } else if (r.result === 'lose') {
      byLeague[lg].profit -= Number(r.stake);
    }
  }

  return {
    total,
    wins: wins.length,
    loses: loses.length,
    pushes: pushes.length,
    profit: Math.round(profit),
    stakeTotal: Math.round(stakeTotal),
    winRate: Math.round(winRate * 10) / 10,
    roi: Math.round(roi * 10) / 10,
    byLeague,
  };
}
