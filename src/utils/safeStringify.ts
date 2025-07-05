/**
 * safely converts an object to a JSON string,
 * handling circular references by replacing them with "[Circular]".
 */
export const safeStringify = obj => {
  const seen = new WeakSet()
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]'
        }
        seen.add(value)
      }
      return value
    },
    2,
  )
}
