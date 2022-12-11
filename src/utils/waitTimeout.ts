import { BackgroundTimer } from '../utils/BackgroundTimer'

export const waitTimeout = (time = 300) =>
  new Promise(resolve => {
    BackgroundTimer.setTimeout(() => resolve(null), time)
  })
