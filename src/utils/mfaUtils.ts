import { ctx } from '#/stores/ctx'
import { compareSemVer } from '#/stores/debugStore'

export const isMFAEnabled = () => {
  const c = ctx.auth.pbxConfig
  if (!c) {
    console.log('[MFA DEBUG] isMFAEnabled: no pbxConfig')
    return false
  }
  if (compareSemVer(c.version, '3.18') < 0) {
    console.log(
      `[MFA DEBUG] isMFAEnabled: pbx version ${c.version} < 3.18, skip MFA`,
    )
    return false
  }
  const enabled = c['webphone.pal.mfa']
  console.log(
    `[MFA DEBUG] isMFAEnabled: version=${c.version} webphone.pal.mfa=${enabled}`,
  )
  return enabled
}

export const isDeviceTokenModeEnabled = () => {
  const c = ctx.auth.pbxConfig
  if (!c) {
    console.log('[MFA DEBUG] isDeviceTokenModeEnabled: no pbxConfig')
    return false
  }
  const enabled =
    c['pal.mode_device_token'] || c['webphone.pal.mode_device_token']
  console.log(
    `[MFA DEBUG] isDeviceTokenModeEnabled: pal.mode_device_token=${enabled}`,
  )
  return enabled
}
