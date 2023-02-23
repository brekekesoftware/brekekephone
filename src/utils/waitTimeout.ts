import { BackgroundTimer } from '../utils/BackgroundTimer'

export const waitTimeout = (time = 300) =>
  new Promise<undefined>(resolve => {
    BackgroundTimer.setTimeout(() => resolve(undefined), time)
  })
