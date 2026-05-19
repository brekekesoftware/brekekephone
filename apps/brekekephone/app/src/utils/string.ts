export const toBoolean = (s?: string) =>
  s === 'on' || s === 'true' || s === '1' || (s as any) === true ? true : false
export const toBooleanFalsy = (s?: string) =>
  !(s === 'off' || s === 'false' || s === '0' || (s as any) === false
    ? false
    : true)
