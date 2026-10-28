import { gcm } from '@noble/ciphers/aes'
import { Buffer } from 'buffer'

// probe key; the final key is Vu's open pick
const ENC_LINK_KEY = new TextEncoder().encode(
  '0123456789abcdef0123456789abcdef',
)

const FIELDS = [
  'host',
  'port',
  'tenant',
  'user',
  'password',
  'phone_idx',
] as const

type EncResult =
  | { fields: Partial<Record<(typeof FIELDS)[number], string>> }
  | { error: 'bad' | 'expired' }

export const decodeEnc = (
  enc: string,
  nowSec = Date.now() / 1000,
): EncResult => {
  if (!enc.startsWith('1.')) {
    return { error: 'bad' }
  }
  const b64 = enc.slice(2).replace(/-/g, '+').replace(/_/g, '/')
  const bytes = Buffer.from(
    b64 + '='.repeat((4 - (b64.length % 4)) % 4),
    'base64',
  )
  if (bytes.length < 12 + 16 + 2) {
    return { error: 'bad' }
  }
  let data: any
  try {
    const plain = gcm(ENC_LINK_KEY, bytes.subarray(0, 12)).decrypt(
      bytes.subarray(12),
    )
    data = JSON.parse(new TextDecoder().decode(plain))
  } catch {
    return { error: 'bad' }
  }
  if (!data || typeof data !== 'object' || typeof data.exp !== 'number') {
    return { error: 'bad' }
  }
  if (data.exp + 300 < nowSec) {
    return { error: 'expired' }
  }
  const fields: Partial<Record<(typeof FIELDS)[number], string>> = {}
  for (const k of FIELDS) {
    if (data[k] !== undefined && data[k] !== null) {
      fields[k] = String(data[k])
    }
  }
  return { fields }
}
