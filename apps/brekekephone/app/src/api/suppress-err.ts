import { ctx } from '#/stores/ctx'

// pbx suppress error toast
//
// server configuration:
// - webphone.error_toast.suppress_enabled: true/false (default: true)
// - webphone.error_toast.suppress_patterns: comma-separated patterns (defaults variable below)
//
// logic:
// - case-insensitive substring matching
// - empty patterns = show all errors
// - custom patterns override defaults (only when suppress_enabled is explicitly set)
//
// examples:
// no config                                   // using defaults variable below
// suppress_enabled=false                      // show all errors
// suppress_enabled=true, patterns=""          // using defaults variable below
// suppress_enabled=true, patterns=abc         // hide "abc" only
// suppress_enabled=true, patterns=abc,xyz     // hide "abc" or "xyz"

const defaults = ['UserImplException', 'Invalid User Name'].map(v =>
  v.toLowerCase(),
)

const getCfg = (key: string): string | undefined =>
  ctx.auth.pbxConfig?.[key]?.trim()

const isEnabled = (): boolean => {
  const v = getCfg('webphone.error_toast.suppress_enabled')
  return (
    v === undefined || v === null || v === 'true' || v === '1' || v === 'on'
  )
}

const getPatterns = (): string[] => {
  const e = getCfg('webphone.error_toast.suppress_enabled')
  if (e === undefined || e === null) {
    return defaults
  }

  const patterns = getCfg('webphone.error_toast.suppress_patterns')
  if (!patterns) {
    return defaults
  }

  const v = patterns
    .split(',')
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => p.toLowerCase())
  return v.length ? v : defaults
}

const isSuppressed = (err?: Error): boolean => {
  if (!err?.message) {
    return false
  }

  const patterns = getPatterns()
  if (!patterns.length) {
    return false
  }

  const msg = err.message.toLowerCase()
  return patterns.some(p => msg.includes(p))
}

export const suppressErr = (err?: Error): boolean =>
  isEnabled() && isSuppressed(err)
