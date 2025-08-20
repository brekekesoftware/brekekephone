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

  const isFailure = ctx.auth.isConnFailure()
  const message =
    ctx.auth.pbxLoginFromAnotherPlace &&
    !ctx.auth.showMsgPbxLoginFromAnotherPlace
      ? ''
      : isFailure && ctx.auth.showMsgPbxLoginFromAnotherPlace
        ? intl`Logged in from another location as the same phone`
        : isFailure && ctx.auth.ucLoginFromAnotherPlace
          ? intl`UC signed in from another location`
          : !serviceConnectingOrFailure
            ? ''
            : isFailure
              ? intl`${serviceConnectingOrFailure} connection failed`
              : intl`Connecting to ${serviceConnectingOrFailure}...`

  return {
    signedInId,
    message,
    isFailure,
    onPress: isFailure ? ctx.auth.resetFailureStateIncludePbxOrUc : undefined,
    serviceConnectingOrFailure,
  }
}
