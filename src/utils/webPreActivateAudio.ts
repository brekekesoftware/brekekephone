import ringback from '#/assets/incallmanager_ringback.mp3'
import ringtone from '#/assets/incallmanager_ringtone.mp3'

export let preActivatedRingtone: HTMLAudioElement | null = null
export let preActivatedRingback: HTMLAudioElement | null = null

// Must be called synchronously inside a user gesture handler (click/touchstart).
// iOS Safari only allows audio.play() from async code if the element was first
// played inside a gesture. Calling play()+pause() here "activates" the elements.
export const preActivateAudio = () => {
  if (preActivatedRingtone || preActivatedRingback) {
    return
  }
  const make = (src: string) => {
    const el = new Audio()
    el.loop = true
    el.src = src
    return el
  }
  preActivatedRingtone = make(ringtone)
  preActivatedRingback = make(ringback)
  preActivatedRingtone.play().catch(() => {})
  preActivatedRingtone.pause()
  preActivatedRingback.play().catch(() => {})
  preActivatedRingback.pause()
}
