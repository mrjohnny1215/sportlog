// 베팅 기록 localStorage 저장/로드
const KEY = 'sportlog_records_v1';

export function loadRecords() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records) {
  localStorage.setItem(KEY, JSON.stringify(records));
}

// 경기 1건에 대한 기록 추가/갱신
export function upsertRecord(records, matchId, data) {
  const idx = records.findIndex((r) => r.matchId === matchId);
  const rec = { matchId, ...data, updatedAt: Date.now() };
  if (idx >= 0) {
    records[idx] = { ...records[idx], ...rec };
  } else {
    records.push(rec);
  }
  return records;
}

export function getRecord(records, matchId) {
  return records.find((r) => r.matchId === matchId) || null;
}
