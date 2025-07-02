import { intl } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { getAudioVideoPermission } from '#/utils/getAudioVideoPermission'

let alreadyPrompted = false
export const webPromptPermission = () => {
  if (alreadyPrompted) {
    return
  }
  alreadyPrompted = true
  RnAlert.prompt({
    title: intl`Action Required`,
    message: intl`Web Phone needs your action to work well on browser. Press OK to continue`,
    confirmText: 'OK',
    dismissText: false,
    onConfirm: getAudioVideoPermission,
    onDismiss: getAudioVideoPermission,
  })
}
