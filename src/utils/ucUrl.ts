const appPathRe = /^[A-Za-z0-9._~-]+(\/[A-Za-z0-9._~-]+)*$/

export const buildUcUrl = (o: {
  ucHost?: string
  ucApp?: string
  pbxHostname: string
  pbxPort: string
}) => {
  const rawHost = o.ucHost?.trim() || `${o.pbxHostname}:${o.pbxPort}`
  const withScheme = /^(https?):\/\/([^/?#]+)/i.exec(rawHost)
  let baseUrl: string
  if (withScheme) {
    baseUrl = `${withScheme[1].toLowerCase()}://${withScheme[2]}`
  } else {
    const host = rawHost.indexOf(':') < 0 ? `${rawHost}:443` : rawHost
    baseUrl = `${host.endsWith(':80') ? 'http' : 'https'}://${host}`
  }
  const app = (o.ucApp || '').trim().replace(/^\/+|\/+$/g, '')
  const path = appPathRe.test(app) ? app : 'uc'
  return { baseUrl, path }
}
