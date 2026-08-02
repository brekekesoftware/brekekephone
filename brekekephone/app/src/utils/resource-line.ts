export const shouldUseResourceLine = (
  l: string | undefined,
  number: string,
) => {
  if (!l) {
    return true
  }
  const p = l.trim()
  if (p) {
    try {
      const regex = new RegExp(p)
      if (!number || !regex.test(number)) {
        return false
      }
    } catch (err) {
      console.warn('Invalid resource-line p:', p, err)
    }
  }
  return true
}
