import { action, observable } from 'mobx'

class RNInvokeStore {
  @observable isHaveInvoke = false
  @observable callTo = ''
  @observable timeNow = 0

  @action updateStateInvoke = (flag: boolean) => {
    this.isHaveInvoke = flag
  }

  @action updateCallTo = (number: string) => {
    this.callTo = number
  }

  @action updateTime = () => {
    this.timeNow = Date.now()
  }
}

export const RNInvokeState = new RNInvokeStore()
