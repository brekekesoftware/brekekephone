import { AppState } from 'react-native'

import { BackgroundTimer } from '#/utils/BackgroundTimer'

export const waitForActiveAppState = () =>
  new Promise<boolean>(resolve => {
    if (AppState.currentState === 'active') {
      return resolve(true)
    }
    const id = BackgroundTimer.setTimeout(() => {
      resolve(false)
      l.remove()
    }, 1000)
    const l = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        return
      }
      resolve(true)
      l.remove()
      BackgroundTimer.clearTimeout(id)
    })
  })
