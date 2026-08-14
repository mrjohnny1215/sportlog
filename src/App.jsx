import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { loadRecords } from './storage';
import { analyze } from './analytics';
import { getGroqKey, setGroqKey } from './ai';
import Home from './components/Home';
import GameDetail from './components/GameDetail';

function SettingsModal({ open, onClose }) {
  const [key, setKey] = useState(getGroqKey());
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 space-y-3" onClick={e => e.stopPropagation()}>
        <div className="text-base font-bold text-gray-800">⚙ 설정</div>
        <div className="text-xs text-gray-500">Groq API 키 (무료) — 브라우저에만 저장됩니다. groq.com에서 발급.</div>
        <input type="password" value={key} onChange={e => setKey(e.target.value)}
          placeholder="gsk_..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <button onClick={() => { setGroqKey(key); onClose(); }}
          className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium">저장</button>
      </div>
    </div>
  );
}

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const records = useMemo(() => loadRecords(), []);
  const stats = useMemo(() => analyze(records), [records]);

  return (
    <BrowserRouter>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-black text-lg text-gray-900 no-underline">
            <span>⚾</span><span>SportLog</span>
          </a>
          <button onClick={() => setShowSettings(s => !s)}
            className="text-xs bg-gray-900 hover:bg-black px-3 py-1.5 rounded-lg text-white font-medium transition">
            ⚙ 설정
          </button>
        </div>
      </header>

      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />

      <Routes>
        <Route path="/" element={<Home stats={stats} />} />
        <Route path="/game/:id" element={<GameDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
