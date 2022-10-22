import { parsePalParams } from '../api/parsePalParams'
import { embedApi, EmbedSignInOptions } from './embedApi'

export const exposeEmbedApi = (renderApp: (rootTag: HTMLElement) => void) => {
  window.Brekeke.Phone.render = (
    rootTag: HTMLElement,
    o: EmbedSignInOptions,
  ) => {
    renderApp(rootTag)
    embedApi._signIn(o)
    embedApi._rootTag = rootTag
    embedApi._palParams = parsePalParams(o)
    return embedApi
  }
}
