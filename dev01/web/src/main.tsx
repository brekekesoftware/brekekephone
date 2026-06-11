import { createRoot } from 'react-dom/client'

// @ts-ignore
import './main.css'

import { App } from './app/app'

const d = document.getElementById('root')
if (
  d &&
  (process.env.NODE_ENV !== 'production' ||
    window.location.pathname === '/dev' ||
    window.location.pathname === '/dev/invoke-example')
) {
  createRoot(d).render(<App />)
}
