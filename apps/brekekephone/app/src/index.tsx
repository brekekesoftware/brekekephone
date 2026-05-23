import '#/index.native'

import { createRoot } from 'react-dom/client'

import '#/theme/brekeke.scss'

import { App } from '#/components/app'
import { exposeEmbedApi } from '#/embed/expose-embed-api'

const runApp = (rootTag: HTMLElement) => {
  const r = createRoot(rootTag)
  r.render(<App />)
  return () => r.unmount()
}
exposeEmbedApi(runApp)

if (window._BrekekePhoneWebRoot) {
  runApp(window._BrekekePhoneWebRoot)
  document.documentElement.classList.add('web-', 'mac-scrollbar')
}
