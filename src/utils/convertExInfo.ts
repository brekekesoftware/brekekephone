export const convertExInfo = (exInfo): boolean => {
  const info = JSON.parse(exInfo || '{}')
  return info.enableVideo
}
