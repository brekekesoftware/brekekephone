import { RnAsyncStorage } from '../components/Rn'
import { intlDebug } from './intl'
import { RnAlert } from './RnAlert'

export const saveFirstRunToLocalStorage = async () => {
  try {
    await RnAsyncStorage.setItem('_first_run', 'true')
  } catch (err) {
    RnAlert.error({
      message: intlDebug`Failed to save Brekeke Phone first run to local storage`,
      err: err as Error,
    })
  }
}
export const isFirstRunFromLocalStorage = async () => {
  try {
    const isFirstRun = await RnAsyncStorage.getItem('_first_run')
    return !!isFirstRun
  } catch (err) {
    RnAlert.error({
      message: intlDebug`Failed to read Brekeke Phone first run from local storage`,
      err: err as Error,
    })
    return false
  }
}
