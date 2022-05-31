export const toLowerCaseFirstChar = (s: string) =>
  s.charAt(0).toLowerCase() + s.substr(1)
export const toUpperCaseFirstChar = (s: string) =>
  s.charAt(0).toUpperCase() + s.substr(1)

export const toBoolean = (s?: string) =>
  s === 'true' || s === '1' ? true : false
