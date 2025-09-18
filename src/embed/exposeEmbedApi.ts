import { embedApi } from '#/embed/embedApi'

export const exposeEmbedApi = (renderApp: (rootTag: HTMLElement) => void) => {
  window.Brekeke.Phone.render = (rootTag, options) => {
    renderApp(rootTag)
    embedApi._rootTag = rootTag
    embedApi._signIn(options)
    return embedApi
  }
}
