import { action, makeObservable, observable } from 'mobx'
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
    makeObservable(this)
  }
}

export const RnAppState = new RnAppStateStore()
