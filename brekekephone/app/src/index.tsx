import '#/init-global'

import { webClassName } from '@rntwsc/rn/core/tailwind'
import { composeProviders } from '@rntwsc/rn/core/utils/compose-providers'
import { createRoot } from 'react-dom/client'

import '../tailwind.css'
import '#/index.scss'
import '#/theme/brekeke.scss'

import { App } from '#/app'
import { AppWebContainer } from '#/app-web-container'
import { exposeEmbedApi } from '#/embed/expose-embed-api'

const AppWeb = composeProviders(AppWebContainer, App)
document.documentElement.classList.add(...webClassName.split(' '))

const runApp = (rootTag: HTMLElement) => {
  const r = createRoot(rootTag)
  r.render(<AppWeb />)
  return () => r.unmount()
}
exposeEmbedApi(runApp)

if (window._BrekekePhoneWebRoot) {
  runApp(window._BrekekePhoneWebRoot)
}
