import type { EmbedSignInOptions } from './embedApi'
import { embedApi } from './embedApi'

export const exposeEmbedApi = (renderApp: (rootTag: HTMLElement) => void) => {
  window.Brekeke.Phone.render = (
    rootTag: HTMLElement,
    options: EmbedSignInOptions,
  ) => {
    renderApp(rootTag)
    embedApi._rootTag = rootTag
    embedApi._signIn(options)
    return embedApi
  }
}
