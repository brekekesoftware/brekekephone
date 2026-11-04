export const handleWebviewConsoleMessage = (data?: string): boolean => {
  try {
    if (!data) {
      return false
    }
    const json = JSON.parse(data)
    const c = json?.__brekekeConsole
    if (!c) {
      return false
    }
    // the message is still ours to swallow even when capturing is off, so the
    // caller does not try to parse it as a page-load message
    if (!window.debugStore?.isCapturingWebviewLog()) {
      return true
    }
    window.debugStore.captureConsoleOutput(c.level, c.msg)
    return true
  } catch (err) {
    return false
  }
}
