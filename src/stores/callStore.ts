import type { CallStore } from '#/stores/callStore2'

let callStore: CallStore
export const setCallStore = (c: CallStore) => {
  callStore = c
}
export const getCallStore = () => callStore
