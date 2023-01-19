import { parsePalParams } from '../api/parseParamsWithPrefix'
import { embedApi, EmbedSignInOptions } from './embedApi'

export const exposeEmbedApi = (renderApp: (rootTag: HTMLElement) => void) => {
  window.Brekeke.Phone.render = (
    rootTag: HTMLElement,
    o: EmbedSignInOptions,
  ) => {
    embedApi._rootTag = rootTag
    embedApi._palParams = parsePalParams(o)
    renderApp(rootTag)
    embedApi._signIn(o)
    return embedApi
  }
}
