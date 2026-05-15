import './index.native'

import { createRoot } from 'react-dom/client'

import { exposeEmbedApi } from '#/embed/expose-embed-api'

import App from './components/app'

const runApp = (rootTag: HTMLElement) => {
  const r = createRoot(rootTag)
  r.render(<App />)
  return () => r.unmount()
}
exposeEmbedApi(runApp)

if (window._BrekekePhoneWebRoot) {
  runApp(window._BrekekePhoneWebRoot)
}
