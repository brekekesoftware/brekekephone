import { CallStore } from './callStore'

let store: Immutable<CallStore>
export const setCallStore = (s: Immutable<CallStore>) => {
  store = s
}
export const cancelRecentPn = (pnId?: string) => store.onSipUaCancel(pnId)
