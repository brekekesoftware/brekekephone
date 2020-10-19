const registerOnUnhandledError = (fn: (err: ErrorEvent) => void) => {
  window.addEventListener('error', fn)
}

export default registerOnUnhandledError
