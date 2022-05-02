import { CallStore } from './callStore'

let store: Immutable<CallStore>
export const setCallStore = (s: Immutable<CallStore>) => {
  store = s
}
export const cancelRecentPn = (n?: CancelRecentPn) => store.onSipUaCancel(n)

export type CancelRecentPn = {
  pnId?: string
  completedElseWhere?: boolean
}
