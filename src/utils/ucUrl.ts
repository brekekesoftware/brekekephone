const appPathRe = /^[A-Za-z0-9._~-]+(\/[A-Za-z0-9._~-]+)*$/

const fullUrlRe = /^(https?:\/\/[^/?#]+)(\/[^?#]*)?$/i
const hostPathRe = /^([^/?#\s]*[.:][^/?#\s]*)(\/[^?#]*)$/

const toBaseUrl = (rawHost: string) => {
  const withScheme = /^(https?):\/\/([^/?#]+)/i.exec(rawHost)
  if (withScheme) {
    return `${withScheme[1].toLowerCase()}://${withScheme[2]}`
  }
  const host = rawHost.indexOf(':') < 0 ? `${rawHost}:443` : rawHost
  return `${host.endsWith(':80') ? 'http' : 'https'}://${host}`
}

export const buildUcUrl = (o: {
  ucHost?: string
  ucApp?: string
  pbxHostname: string
  pbxPort: string
}) => {
  const rawHost = o.ucHost?.trim() || `${o.pbxHostname}:${o.pbxPort}`
  let rawApp = (o.ucApp || '').trim()
  let appHost = ''
  const embedded = fullUrlRe.exec(rawApp) || hostPathRe.exec(rawApp)
  if (embedded) {
    appHost = embedded[1]
    rawApp = embedded[2] || ''
  }
  const app = rawApp.replace(/^\/+|\/+$/g, '')
  const path = appPathRe.test(app) ? app : 'uc'
  const useAppHost = appHost && (app === '' || path === app)
  return { baseUrl: toBaseUrl(useAppHost ? appHost : rawHost), path }
}
