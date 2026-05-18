import { EmbedApi } from '#/embed/embed-api'

export const exposeEmbedApi = (
  renderApp: (rootTag: HTMLElement) => () => void,
) => {
  window.Brekeke.Phone = EmbedApi
  EmbedApi._renderApp = renderApp
}
