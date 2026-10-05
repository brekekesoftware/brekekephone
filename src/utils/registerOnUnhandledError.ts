const errorUtils = ErrorUtils as typeof ErrorUtils & {
  reportError: (error: unknown) => void
}

export const registerOnUnhandledError = (
  fn: (error: any, isFatal?: boolean) => void,
) => {
  if (__DEV__) {
    return
  }
  errorUtils.setGlobalHandler(fn)
  const consoleError = console.error
  console.error = (...args) => {
    errorUtils.reportError(args[0])
    consoleError(...args)
  }
}
