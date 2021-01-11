import { action, observable } from 'mobx'
import { AppState } from 'react-native'

export class RnAppState {
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

export default new RnAppState()
