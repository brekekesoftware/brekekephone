import { AppState } from 'react-native'

export const waitForActiveAppState = () =>
  new Promise<void>(resolve => {
    if (AppState.currentState === 'active') {
      return resolve()
    }
    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'active') {
        resolve()
        appState.remove()
      }
    }
    const appState = AppState.addEventListener('change', handleAppStateChange)
  })
