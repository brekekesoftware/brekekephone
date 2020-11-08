import { action, observable } from 'mobx'

export default class DelayFlag {
  @observable enabled = false
  timeoutId = 0

  setEnabled = (enabled?: boolean) => {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId)
    }
    this.timeoutId = window.setTimeout(
      action(() => {
        this.enabled = !!enabled
        this.timeoutId = 0
      }),
      300,
    )
  }
}
