import { intl } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'
import { triggerAudioPermission } from './triggerAudioPermission'

export const getAudioVideoPermission = () => {
  const cb = (stream: MediaStream) => stream.getTracks().forEach(t => t.stop())
  // @ts-ignore
  const eb = (err: MediaStreamError) => {
    /* TODO */
  }
  // @ts-ignore
  const p = window.navigator.getUserMedia(
    { audio: true, video: true },
    cb,
    eb,
  ) as any as Promise<MediaStream>
  if (p?.then) {
    p.then(cb).catch(eb)
  }
  triggerAudioPermission()
}
let browserPermissionAlreadyPrompted = false
export const promptBrowserPermission = () => {
  if (browserPermissionAlreadyPrompted) {
    return
  }
  browserPermissionAlreadyPrompted = true
  RnAlert.prompt({
    title: intl`Action Required`,
    message: intl`Web Phone needs your action to work well on browser. Press OK to continue`,
    confirmText: 'OK',
    dismissText: false,
    onConfirm: getAudioVideoPermission,
    onDismiss: getAudioVideoPermission,
  })
}
