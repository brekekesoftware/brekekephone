import { action, observable } from 'mobx'

export default class DelayFlag {
  @observable enabled = false
  timeoutId = 0

  setEnabled = enabled => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    this.timeoutId = setTimeout(
      action(() => {
        this.enabled = enabled
        this.timeoutId = 0
      }),
      300,
    )
  }
}
