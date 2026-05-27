import type { PbxGetProductInfoRes } from '#/brekekejs'
import { isEmbed } from '#/embed/polyfill'
import { ctx } from '#/stores/ctx'
import { compareSemVer } from '#/stores/debugStore'
import { toBoolean } from '#/utils/string'

// Check if MFA flow should be triggered for this PBX.
// 3-tier decision rule:
//   1. webphone.pal.mfa explicit (true/false) → trust admin's intent absolutely.
//   2. webphone.pal.mfa absent → fallback to per-user model (trust mfa/start).
// Embed mode: always skip — host owns UX.
export const isMFASupported = (pc?: PbxGetProductInfoRes) => {
  if (isEmbed) {
    return false
  }
  const c = pc || ctx.auth.pbxConfig
  if (!c) {
    return false
  }
  if (compareSemVer(c.version, '3.18') < 0) {
    return false
  }
  // Tier 1: explicit flag → trust admin's intent
  const flag = c['webphone.pal.mfa']
  if (flag !== undefined) {
    return toBoolean(flag)
  }
  if (compareSemVer(c.version, '3.19') < 0) {
    return false
  }
  // Tier 2: flag absent → fallback to per-user model (trust mfa/start)
  return true
}
