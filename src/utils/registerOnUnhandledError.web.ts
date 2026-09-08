import { isEmbed } from '#/embed/polyfill'

export const registerOnUnhandledError = (fn: (err: ErrorEvent) => void) => {
  if (isEmbed) {
    return
  }
  window.addEventListener('error', fn)
}
