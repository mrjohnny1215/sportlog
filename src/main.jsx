import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import seedElo from '../public/seed_elo.json'
import { setSeed } from './elo'

// Wikipedia 시즌 순위표 기반 ELO 시드 주입 (빈 1500 시작 방지)
setSeed(seedElo)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
