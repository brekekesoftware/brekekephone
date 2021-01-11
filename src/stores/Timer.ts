import { action, observable } from 'mobx'
import BackgroundTimer from 'react-native-background-timer'

export class Timer {
  @observable now = Date.now()
  constructor() {
    BackgroundTimer.setInterval(this.updateNow, 1000)
  }
  @action private updateNow = () => {
    this.now = Date.now()
  }
}

export default new Timer()
