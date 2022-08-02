export const registerOnUnhandledError = (fn: (err: ErrorEvent) => void) => {
  if (!window._BrekekePhoneWebRoot) {
    return
  }
  window.addEventListener('error', fn)
}
