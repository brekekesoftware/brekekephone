import { action, observable } from 'mobx'
import { AppState } from 'react-native'
import IncallManager from 'react-native-incall-manager'

class RnAppStateStore {
  @observable currentState = AppState.currentState
  constructor() {
    AppState.addEventListener(
      'change',
      action(() => {
        this.currentState = AppState.currentState
        if (this.currentState !== 'active') {
          IncallManager.stopRingtone()
        }
      }),
    )
  }
}

export const RnAppState = new RnAppStateStore()
