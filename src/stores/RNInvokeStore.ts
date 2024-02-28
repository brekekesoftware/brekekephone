import { action, observable } from 'mobx'

class RNInvokeStore {
  @observable isHaveInvoke = false
  @observable callTo = ''

  @action updateStateInvoke = (flag: boolean) => {
    this.isHaveInvoke = flag
  }

  @action updateCallTo = (number: string) => {
    this.callTo = number
  }
}

export const RNInvokeState = new RNInvokeStore()
