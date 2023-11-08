export const toBoolean = (s?: string) =>
  s === 'on' || s === 'true' || s === '1' || (s as any) === true ? true : false
export const toBooleanFalsy = (s?: string) =>
  !(s === 'off' || s === 'false' || s === '0' || (s as any) === false
    ? false
    : true)
export const isURL = (str: string) => {
  const pattern =
    '^(https?:\\/\\/)?' + // protocol
    '((([a-zA-Z\\d]([a-zA-Z\\d-]{0,61}[a-zA-Z\\d])*\\.)+' + // sub-domain + domain name
    '[a-zA-Z]{2,13})' + // extension
    '|((\\d{1,3}\\.){3}\\d{1,3})' + // OR ip (v4) address
    '|localhost)' + // OR localhost
    '(\\:\\d{1,5})?' + // port
    '(\\/[a-zA-Z\\&\\d%_.~+-:@]*)*' + // path
    '(\\?[a-zA-Z\\&\\d%_.,~+-:@=;&]*)?' //+ // query string
  const regex = new RegExp(pattern)
  return regex.test(str)
}
