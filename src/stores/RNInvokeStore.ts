import { action, observable } from 'mobx'

class RNInvokeStore {
  @observable isHasInvoke = false

  @action updateStateInvoke = (flag: boolean) => {
    this.isHasInvoke = flag
  }
}

export const RNInvokeState = new RNInvokeStore()
