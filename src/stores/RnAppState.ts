import { action, observable } from 'mobx'
import { AppState } from 'react-native'

class RnAppStateStore {
  @observable currentState = AppState.currentState
  constructor() {
    AppState.addEventListener(
      'change',
      action(nextAppState => {
        this.currentState = nextAppState
      }),
    )
  }
}

export const RnAppState = new RnAppStateStore()
