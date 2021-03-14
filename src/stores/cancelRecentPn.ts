import { CallStore } from './callStore'

let store: CallStore
export const setCallStore = (s: CallStore) => {
  store = s
}
export const cancelRecentPn = () => store.cancelRecentPn()
