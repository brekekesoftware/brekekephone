import { action, observable } from 'mobx'

export class RnLoadingStore {
  @observable count = 0

  @action show = () => {
    this.count += 1
  }
  @action hide = () => {
    this.count = Math.max(0, this.count - 1)
  }
}

export const RnLoading = new RnLoadingStore()
