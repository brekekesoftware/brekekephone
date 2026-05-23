import '#/init-global'
import '#/embed/polyfill'

import { createRoot } from 'react-dom/client'

import '../tailwind.css'
import '#/index.scss'
import '#/theme/brekeke.scss'

import { webClassName } from '@/rn/core/tailwind'
import { composeProviders } from '@/rn/core/utils/compose-providers'
import { App } from '#/app'
import { AppWebContainer } from '#/app-web-container'
import { exposeEmbedApi } from '#/embed/expose-embed-api'

const AppWeb = composeProviders(AppWebContainer, App)
document.documentElement.classList.add(webClassName)

const runApp = (rootTag: HTMLElement) => {
  const r = createRoot(rootTag)
  r.render(<AppWeb />)
  return () => r.unmount()
}
exposeEmbedApi(runApp)

if (window._BrekekePhoneWebRoot) {
  runApp(window._BrekekePhoneWebRoot)
}
