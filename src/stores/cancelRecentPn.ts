import { getCallStore } from './callStore'

export const cancelRecentPn = (n?: CancelRecentPn) =>
  getCallStore().onSipUaCancel(n)

export type CancelRecentPn = {
  pnId?: string
  completedElseWhere?: boolean
}
