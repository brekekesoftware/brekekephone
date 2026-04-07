// Bijective hex encoding for park numbers with special chars (e.g. `%^`).
// Encode before sending to PBX; decode after receiving from PBX.
// Safe chars [A-Za-z0-9-_.] pass through unchanged for backward compatibility.

// PREFIX uses '~' which is valid in SIP URI (RFC 3986 unreserved)
// but excluded from SAFE_RE, so old-version park numbers never start with it
const PREFIX = '~'
const SAFE_RE = /^[A-Za-z0-9\-_.]+$/

export const encodeParkNumber = (p: string): string => {
  if (SAFE_RE.test(p)) {
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
