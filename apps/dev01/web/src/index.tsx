import { createRoot } from 'react-dom/client'

// @ts-ignore
import './index.css'

import { App } from './app/app'

const d = document.getElementById('root')
if (
  d &&
  (window.location.pathname === '/dev' ||
    window.location.pathname === '/dev/invoke-example')
) {
  createRoot(d).render(<App />)
}
