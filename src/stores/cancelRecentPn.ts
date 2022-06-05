import { CallStore } from './callStore'

export const getCallStore = () => store

let store: CallStore
export const setCallStore = (s: CallStore) => {
  store = s
}
export const cancelRecentPn = (n?: CancelRecentPn) => store.onSipUaCancel(n)

export type CancelRecentPn = {
  pnId?: string
  completedElseWhere?: boolean
}
