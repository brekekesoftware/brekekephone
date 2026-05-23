import '#/init-global'

import { createRoot } from 'react-dom/client'

import '../tailwind.css'
import '#/index.scss'
import '#/theme/brekeke.scss'

import { webClassName } from '@/rn/core/tailwind'
import { composeProviders } from '@/rn/core/utils/compose-providers'
import { App } from '#/app'
import { AppWebContainer } from '#/app-web-container'
import { exposeEmbedApi } from '#/embed/expose-embed-api'
import { isEmbed } from '#/embed/polyfill'

const AppWeb = isEmbed ? App : composeProviders(AppWebContainer, App)

const runApp = (rootTag: HTMLElement) => {
  const r = createRoot(rootTag)
  r.render(<AppWeb />)
  return () => r.unmount()
}
exposeEmbedApi(runApp)

if (!isEmbed) {
  runApp(window._BrekekePhoneWebRoot as HTMLElement)
  document.documentElement.classList.add(...webClassName.split(' '))
}
