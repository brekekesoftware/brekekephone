import { Platform } from 'react-native'

import { webPlayDing } from './webPlayDing'

export const getAudioVideoPermission = () => {
  const cb = (stream: MediaStream) => stream.getTracks().forEach(t => t.stop())
  // @ts-ignore
  const eb = (err: MediaStreamError) => {
    /* TODO */
  }
  let p: Promise<MediaStream>
  if (navigator.mediaDevices?.getUserMedia) {
    // New syntax
    p = navigator.mediaDevices.getUserMedia({ audio: true, video: true })
  } else {
    // Old syntax
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
  if (Platform.OS === 'web') {
    // trigger audio permission
    webPlayDing()
  }
}
