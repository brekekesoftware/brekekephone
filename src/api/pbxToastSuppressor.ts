import { ctx } from '#/stores/ctx'

// PBX Error Toast Suppressor
//
// Server Configuration:
// - webphone.error_toast.suppress_enabled: true/false (default: true)
// - webphone.error_toast.suppress_patterns: comma-separated patterns (default: UserImplException)
//
// Logic:
// - Case-insensitive substring matching
// - Empty patterns = show all errors
// - Custom patterns override defaults (only when suppress_enabled is explicitly set)
//
// Examples:
// No config                                   -> Hide UserImplException (default)
// suppress_enabled=false                      -> Show all errors
// suppress_enabled=true, patterns=""          -> Hide UserImplException (default)
// suppress_enabled=true, patterns=abc     -> Hide "abc" only
// suppress_enabled=true, patterns=abc,xyz     -> Hide "abc" or "xyz"

const defaults = ['UserImplException']

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

  const p = getCfg('webphone.error_toast.suppress_patterns')

  if (!p) {
    return defaults
  }
  const v = p
    .split(',')
    .map(p => p.trim())
    .filter(Boolean)
  return v.length > 0 ? v : defaults
}

const isSuppressed = (err?: Error): boolean => {
  if (!err?.message) {
    return false
  }

  const p = getPatterns()
  if (p.length === 0) {
    return false
  }

  const msg = err.message.toLowerCase()
  return p.some(i => msg.includes(i.toLowerCase()))
}

export const shouldShowToast = (err?: Error): boolean =>
  !isEnabled() || !isSuppressed(err)
