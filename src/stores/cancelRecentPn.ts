import { getCallStore } from '#/stores/callStore'

export const cancelRecentPn = (n?: CancelRecentPn) =>
  getCallStore().onSipUaCancel(n)

export type CancelRecentPn = {
  pnId?: string
  completedElseWhere?: boolean
  completedBy?: string
}
