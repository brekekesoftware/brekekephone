import { ctx } from '#/stores/ctx'

export const cancelRecentPn = (n?: CancelRecentPn) => ctx.call.onSipUaCancel(n)

export type CancelRecentPn = {
  pnId?: string
  completedElseWhere?: boolean
  completedBy?: string
}
