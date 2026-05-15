import { normalizePackageJson } from '@/devtools/normalize/package-json'

export const run = () => Promise.all([normalizePackageJson()])
