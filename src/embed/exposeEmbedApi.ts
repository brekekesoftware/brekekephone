import { embedApi } from '#/embed/embedApi'

export const exposeEmbedApi = (renderApp: (rootTag: HTMLElement) => void) => {
  window.Brekeke.Phone.render = (rootTag, options) => {
    embedApi._rootTag = renderApp(rootTag)
    embedApi._signIn(options)
    return embedApi
  }
}
