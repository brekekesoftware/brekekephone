const os = 1000
const om = 60 * os
const oh = 60 * om

export default ms => {
  const h = Math.floor(ms / oh)
  ms %= oh
  let m: number | string = Math.floor(ms / om)
  if (m < 10) {
    m = '0' + m
  }
  ms %= om
  let s: number | string = Math.floor(ms / os)
  if (s < 10) {
    s = '0' + s
  }
  return (h ? `${h}:` : '') + `${m}:${s}`
}
