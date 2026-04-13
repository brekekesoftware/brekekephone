import { isWeb } from '#/config'
import { webPlayDing } from '#/utils/webPlayDing'
import { preActivateAudio } from '#/utils/webPreActivateAudio'
import { unlockAudio } from '#/utils/webUnlockAudio'

export const getAudioVideoPermission = () => {
  if (isWeb) {
    // must call synchronously in the gesture stack so iOS/Safari allows autoplay
    unlockAudio()
    preActivateAudio()
  }
  const cb = (stream: MediaStream) => stream.getTracks().forEach(t => t.stop())
  const eb = (err: any) => console.error(err)
  let p: Promise<MediaStream>
  if (navigator.mediaDevices?.getUserMedia) {
    p = navigator.mediaDevices.getUserMedia({ audio: true, video: true })
  } else {
    // legacy old api compatible in rn
    // @ts-ignore
    p = window.navigator.getUserMedia(
      { audio: true, video: true },
      cb,
      eb,
    ) as any as Promise<MediaStream>
  }
  if (p?.then) {
    p.then(cb).catch(eb)
  }
  if (isWeb) {
    // trigger audio permission
    webPlayDing()
  }
}
