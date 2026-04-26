import type { PbxGetProductInfoRes } from '#/brekekejs'
import { isEmbed } from '#/embed/polyfill'
import { ctx } from '#/stores/ctx'
import { compareSemVer } from '#/stores/debugStore'

// Check if PBX version supports MFA API (>= 3.18).
// Unlike isMFAEnabled, this does NOT check the global webphone.pal.mfa flag —
// per-account MFA state is determined by mfa/start returning type=none or type=code/url.
// Embed mode: skip MFA entirely — host owns UX, no UI surface for OTP modal.
export const isMFASupported = (pc?: PbxGetProductInfoRes) => {
  if (isEmbed) {
    return false
  }
  const c = pc || ctx.auth.pbxConfig
  if (!c) {
    return false
  }
  return compareSemVer(c.version, '3.18') >= 0
}
