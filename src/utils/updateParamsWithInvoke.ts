import { RNInvokeState } from '../stores/RNInvokeStore'
import { UrlParams } from './deeplink-parse'

// Handle enable UI invoke and receive phone number to call
export const updateParamsWithInvoke = ({ action, callTo }: UrlParams) => {
  if (action === 'invoke-example') {
    RNInvokeState.updateStateInvoke(true)
  }

  RNInvokeState.updateCallTo(callTo)
}
