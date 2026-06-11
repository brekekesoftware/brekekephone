import { makeAutoObservable } from 'mobx'
import { AppState } from 'react-native'

class RnAppStateStore {
  constructor() {
    makeAutoObservable(this)

    AppState.addEventListener('change', nextAppState => {
      this.currentState = nextAppState
      this.foregroundOnce = this.foregroundOnce || nextAppState === 'active'
    })
  }
  foregroundOnce = AppState.currentState === 'active'
  currentState = AppState.currentState
}

export const RnAppState = new RnAppStateStore()
