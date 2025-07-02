import { RnAsyncStorage } from '#/components/Rn'

// TODO: review and improve
export const saveFirstRunToLocalStorage = async () => {
  try {
    await RnAsyncStorage.setItem('_first_run', 'true')
  } catch (err) {
    console.error('saveFirstRunToLocalStorage error:', err)
  }
}
export const isFirstRunFromLocalStorage = async () => {
  try {
    const isFirstRun = await RnAsyncStorage.getItem('_first_run')
    return !!isFirstRun
  } catch (err) {
    console.error('isFirstRunFromLocalStorage error:', err)
    return false
  }
}
