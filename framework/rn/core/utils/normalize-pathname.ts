export const normalizePathname = (pathname: string) => {
  if (!pathname) {
    pathname = '/'
  }
  pathname = pathname.replace(/\/{2,}/g, '/')
  if (pathname.endsWith('/') && pathname !== '/') {
    return pathname.slice(0, -1)
  }
  return pathname
}
