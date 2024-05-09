import type { TSyncPnToken } from './syncPnToken2'

let m: TSyncPnToken = null!
export const setSyncPnTokenModule = (m0: TSyncPnToken) => {
  m = m0
}
export const SyncPnToken = () => m
