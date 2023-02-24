import { action, observable } from 'mobx'
import { AppState } from 'react-native'

class RnAppStateStore {
  @observable foregroundOnce = AppState.currentState === 'active'
  @observable currentState = AppState.currentState
  constructor() {
    AppState.addEventListener(
      'change',
      action(nextAppState => {
        this.currentState = nextAppState
        this.foregroundOnce = this.foregroundOnce || nextAppState === 'active'
      }),
    )
  }
}

export const RnAppState = new RnAppStateStore()
