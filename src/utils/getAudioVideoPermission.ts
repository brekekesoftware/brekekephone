import { isWeb } from '#/config'
import { webPlayDing } from '#/utils/webPlayDing'

export const getAudioVideoPermission = () => {
  const cb = (stream: MediaStream) => stream.getTracks().forEach(t => t.stop())
  // @ts-ignore
  const eb = (err: MediaStreamError) => {
    /* TODO */
  }
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
