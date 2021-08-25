import { action, observable } from 'mobx'

import { BackgroundTimer } from './BackgroundTimer'

export class DelayFlag {
  @observable enabled = false
  timeoutId = 0

  setEnabled = (enabled?: boolean) => {
    if (this.timeoutId) {
      BackgroundTimer.clearTimeout(this.timeoutId)
    }
    this.timeoutId = BackgroundTimer.setTimeout(
      action(() => {
        this.enabled = !!enabled
        this.timeoutId = 0
      }),
      300,
    )
  }
}
