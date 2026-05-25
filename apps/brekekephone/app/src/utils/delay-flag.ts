import { action, makeAutoObservable, observable } from 'mobx'

import { defaultTimeout } from '#/config'
import { BackgroundTimer } from '#/utils/background-timer'

export class DelayFlag {
  constructor() {
    makeAutoObservable(this)
  }
  enabled = false
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
      defaultTimeout,
    )
  }
}
