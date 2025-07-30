import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

export const getConnectionStatus = () => {
  const signedInId = ctx.auth.signedInId
  const serviceConnectingOrFailure = ctx.auth.pbxConnectingOrFailure()
    ? 'PBX'
    : ctx.auth.sipConnectingOrFailure()
      ? 'SIP'
      : ctx.auth.ucConnectingOrFailure()
        ? 'UC'
        : ''
  const isRequestRetrying = ctx.pbx.retryingRequests.length > 0

  const isFailure = ctx.auth.isConnFailure()
  let message = ''
  if (
    ctx.auth.pbxLoginFromAnotherPlace &&
    !ctx.auth.showMsgPbxLoginFromAnotherPlace
  ) {
    // Case: logged in from another location but the notification has not been shown yet
    return {
      signedInId,
      message,
      isFailure: isFailure || isRequestRetrying,
      onPress: undefined,
    }
  }

  if (isFailure) {
    if (ctx.auth.showMsgPbxLoginFromAnotherPlace) {
      message = intl`Logged in from another location as the same phone`
    } else if (ctx.auth.ucLoginFromAnotherPlace) {
      message = intl`UC signed in from another location`
    } else {
      message = intl`Internet connection failure`
    }
  } else if (!serviceConnectingOrFailure) {
    if (isRequestRetrying) {
      message = intl`Internet connection failure`
    }
  } else {
    message = intl`Connecting to ${serviceConnectingOrFailure}...`
  }

  return {
    signedInId,
    message,
    isFailure: isFailure || isRequestRetrying,
    onPress:
      isFailure && !isRequestRetrying
        ? ctx.auth.resetFailureStateIncludePbxOrUc
        : undefined,
  }
}
