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
    // logged in from another location but the notification has not been shown yet
    return {
      signedInId,
      message,
      isFailure: isFailure || isRequestRetrying,
      onPress: undefined,
    }
  }

  const ca = ctx.auth.getCurrentAccount()
  const isMFAPending =
    !!ca &&
    (ctx.mfa.isShowing(ca.id) || ctx.account.mfaPendingAfterCallsId === ca.id)
  if (isFailure) {
    if (ctx.auth.showMsgPbxLoginFromAnotherPlace) {
      message = intl`Logged in from another location as the same phone`
    } else if (ctx.auth.ucLoginFromAnotherPlace) {
      message = intl`UC signed in from another location`
    } else {
      ctx.toast.clearAll()
      message = intl`Internet connection failed`
    }
  } else if (isMFAPending) {
    message = intl`Please complete the MFA verification to continue`
  } else if (!serviceConnectingOrFailure) {
    if (isRequestRetrying) {
      message = intl`Retrying connection...`
    }
  } else {
    message = intl`Connecting to ${serviceConnectingOrFailure}...`
  }

  return {
    signedInId,
    message,
    isFailure,
    onPress:
      isFailure && !isRequestRetrying
        ? ctx.auth.resetFailureStateIncludePbxOrUc
        : undefined,
    serviceConnectingOrFailure,
  }
}
