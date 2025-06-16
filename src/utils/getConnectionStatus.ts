import { getAuthStore } from '#/stores/authStore'
import { intl } from '#/stores/intl'

export const getConnectionStatus = () => {
  const s = getAuthStore()
  const signedInId = s.signedInId
  const serviceConnectingOrFailure = s.pbxConnectingOrFailure()
    ? 'PBX'
    : s.sipConnectingOrFailure()
      ? 'SIP'
      : s.ucConnectingOrFailure()
        ? 'UC'
        : ''

  const isFailure = s.isConnFailure()
  const message =
    s.pbxLoginFromAnotherPlace && !s.showMsgPbxLoginFromAnotherPlace
      ? ''
      : isFailure && s.showMsgPbxLoginFromAnotherPlace
        ? intl`Logged in from another location as the same phone`
        : isFailure && s.ucLoginFromAnotherPlace
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
    onPress: isFailure ? s.resetFailureStateIncludePbxOrUc : undefined,
  }
}
