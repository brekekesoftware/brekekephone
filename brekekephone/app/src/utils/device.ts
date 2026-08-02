import Bowser from 'bowser'

const parser = Bowser.getParser(navigator.userAgent)

export const devicePlatform = () => 'Web'
export const deviceDetail = () => {
  const b = parser.getBrowserName()
  const bv = parser.getBrowserVersion()
  const os = parser.getOSName()
  const osv = parser.getOSVersion()
  return `${b} ${bv}; ${os} ${osv}`
}
