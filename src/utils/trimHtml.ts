export const trimHtml = (s: string) =>
  s
    .replace(/\/html\s+/, '')
    .replace(/<([^>]+)>/gi, '')
    .trim()
