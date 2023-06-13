import './index.css'

import { render } from 'react-dom'

import { App } from './app/App'

if (window.location.pathname === '/dev') {
  render(<App />, document.getElementById('root'))
}
