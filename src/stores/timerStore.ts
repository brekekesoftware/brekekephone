import { action, observable } from 'mobx'

import { BackgroundTimer } from '../utils/BackgroundTimer'

export class TimerStore {
  @observable now = Date.now()
  constructor() {
    BackgroundTimer.setInterval(this.updateNow, 1000)
  }
  @action private updateNow = () => {
    this.now = Date.now()
  }
}

export default new TimerStore()
