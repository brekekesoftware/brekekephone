import { action, makeObservable, observable } from 'mobx'

import { defaultTimeout } from '#/config'
import { BackgroundTimer } from '#/utils/BackgroundTimer'

export class DelayFlag {
  @observable enabled = false
  timeoutId = 0

  constructor() {
    makeObservable(this)
  }

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
