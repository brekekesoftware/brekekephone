// Bijective hex encoding for park numbers with special chars (e.g. `%^`).
// Encode before sending to PBX; decode after receiving from PBX.
// Safe chars [A-Za-z0-9-_.] pass through unchanged.

const PREFIX = 'H'
const SAFE_RE = /^[A-Za-z0-9\-_.]+$/

const looksEncoded = (p: string): boolean => {
  if (!p.startsWith(PREFIX)) {
    return false
  }
  const hex = p.slice(PREFIX.length)
  return hex.length > 0 && hex.length % 4 === 0 && /^[0-9a-f]+$/.test(hex)
}

export const encodeParkNumber = (p: string): string => {
  if (SAFE_RE.test(p) && !looksEncoded(p)) {
    return p
  }
  return (
    PREFIX +
    Array.from(p)
      .map(c => c.codePointAt(0)!.toString(16).padStart(4, '0'))
      .join('')
  )
}

export const decodeParkNumber = (p: string): string => {
  if (!p.startsWith(PREFIX)) {
    return p
  }
  const hex = p.slice(PREFIX.length)
  if (hex.length % 4 !== 0 || !/^[0-9a-f]+$/.test(hex)) {
    return p
  }
  return (hex.match(/.{4}/g) ?? [])
    .map(h => String.fromCodePoint(parseInt(h, 16)))
    .join('')
}
