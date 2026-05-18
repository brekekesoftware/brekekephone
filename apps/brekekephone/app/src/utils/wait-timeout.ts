import { defaultTimeout } from '#/config'
import { BackgroundTimer } from '#/utils/background-timer'

export const waitTimeout = (time = defaultTimeout) =>
  new Promise<undefined>(resolve => {
    BackgroundTimer.setTimeout(() => resolve(undefined), time)
  })
