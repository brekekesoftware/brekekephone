import { BackgroundTimer } from '../utils/BackgroundTimer'

const waitTimeout = (time = 300) =>
  new Promise(resolve => {
    BackgroundTimer.setTimeout(() => resolve(null), time)
  })

export default waitTimeout
