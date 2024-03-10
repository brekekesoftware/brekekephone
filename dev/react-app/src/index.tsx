import './index.css'

import { createRoot } from 'react-dom/client'

import { App } from './app/App'

const d = document.getElementById('root')
if (
  d &&
  (window.location.pathname === '/dev' ||
    window.location.pathname === '/dev/invoke-example')
) {
  createRoot(d).render(<App />)
}
