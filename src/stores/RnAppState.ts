import { action, observable } from 'mobx'
import { AppState } from 'react-native'

class RnAppStateStore {
  @observable currentState = AppState.currentState
  constructor() {
    AppState.addEventListener(
      'change',
      action(() => {
        this.currentState = AppState.currentState
      }),
    )
  }
}

export const RnAppState = new RnAppStateStore()
