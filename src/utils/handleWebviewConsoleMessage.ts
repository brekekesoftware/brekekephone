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
    window.debugStore?.captureConsoleOutput(c.level, c.msg)
    return true
  } catch (err) {
    return false
  }
}
