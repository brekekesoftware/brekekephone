import { defaultTimeout } from '#/config'
import { BackgroundTimer } from '#/utils/BackgroundTimer'

export const waitTimeout = (time = defaultTimeout) =>
  new Promise<undefined>(resolve => {
    BackgroundTimer.setTimeout(() => resolve(undefined), time)
  })
