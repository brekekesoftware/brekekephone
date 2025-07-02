import { isEmbed } from '#/config'

export const registerOnUnhandledError = (fn: (err: ErrorEvent) => void) => {
  if (isEmbed) {
    return
  }
  window.addEventListener('error', fn)
}
