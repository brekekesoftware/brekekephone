import { RnAsyncStorage } from '#/components/Rn'

export const saveFirstRunToLocalStorage = async () => {
  try {
    await RnAsyncStorage.setItem('_first_run', 'true')
  } catch (err) {
    console.error(
      'Failed to save Brekeke Phone first run to local storage ' +
        JSON.stringify(err),
    )
  }
}
export const isFirstRunFromLocalStorage = async () => {
  try {
    const isFirstRun = await RnAsyncStorage.getItem('_first_run')
    return !!isFirstRun
  } catch (err) {
    console.error(
      'Failed to read Brekeke Phone first run from local storage ' +
        JSON.stringify(err),
    )
    return false
  }
}
