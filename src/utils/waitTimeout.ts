import { DEFAULT_TIMEOUT } from '#/config'
import { BackgroundTimer } from '#/utils/BackgroundTimer'

export const waitTimeout = (time = DEFAULT_TIMEOUT) =>
  new Promise<undefined>(resolve => {
    BackgroundTimer.setTimeout(() => resolve(undefined), time)
  })
