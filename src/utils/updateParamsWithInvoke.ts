import { RNInvokeState } from '../stores/RNInvokeStore'
import { UrlParams } from './deeplink-parse'
import { permReadPhoneNumber } from './permissions'

// Handle enable UI invoke and receive phone number to call
export const updateParamsWithInvoke = async ({ action, callTo }: UrlParams) => {
  await permReadPhoneNumber()
  if (action === 'invoke-example') {
    RNInvokeState.updateStateInvoke(true)
  }

  RNInvokeState.updateCallTo(callTo)
  RNInvokeState.updateTime()
}
