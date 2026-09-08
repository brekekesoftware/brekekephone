import { EmbedApi } from '#/embed/embedApi'

export const exposeEmbedApi = (renderApp: (rootTag: HTMLElement) => void) => {
  window.Brekeke.Phone = EmbedApi
  EmbedApi._renderApp = renderApp
}
