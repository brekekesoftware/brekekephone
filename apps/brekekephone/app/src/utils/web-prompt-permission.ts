import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { getAudioVideoPermission } from '#/utils/get-audio-video-permission'

let alreadyPrompted = false
export const webPromptPermission = () => {
  if (alreadyPrompted) {
    return
  }
  alreadyPrompted = true
  RnAlert.prompt({
    title: intl`Action Required`,
    message: intl`${ctx.global.productName} needs your action to work well on browser. Press OK to continue`,
    confirmText: 'OK',
    dismissText: false,
    onConfirm: getAudioVideoPermission,
    onDismiss: getAudioVideoPermission,
  })
}
