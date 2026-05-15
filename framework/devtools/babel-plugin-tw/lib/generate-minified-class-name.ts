const p1 = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const p2 = p1 + '0123456789-'
const l1 = p1.length
const l2 = p2.length

export const generateMinifiedClassName = (n: number) => {
  if (n < l1) {
    return p1[n]
  }

  let idx = n - l1

  let L = 2
  let pow2 = l2
  let blockSize = l1 * pow2

  while (idx >= blockSize) {
    idx -= blockSize
    pow2 *= l2
    L += 1
    blockSize = l1 * pow2
  }

  const chars = new Array(L)
  const firstIndex = Math.floor(idx / pow2)
  chars[0] = p1[firstIndex]

  let rest = idx % pow2
  for (let pos = L - 1; pos >= 1; pos--) {
    const d = rest % l2
    chars[pos] = p2[d]
    rest = Math.floor(rest / l2)
  }

  return chars.join('')
}
