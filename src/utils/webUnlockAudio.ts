// iOS/Safari requires a user gesture before any audio can be played.
// Call unlockAudio() inside a user gesture handler (click, touchstart, etc.)
// to resume the shared AudioContext. After this, all <audio>.play() calls work.

let audioCtx: AudioContext | null = null
const listeners: (() => void)[] = []
let unlocked = false

export const isAudioUnlocked = () => unlocked

export const onAudioUnlocked = (cb: () => void) => {
  if (unlocked) {
    cb()
    return () => {}
  }
  listeners.push(cb)
  return () => {
    const i = listeners.indexOf(cb)
    if (i >= 0) {
      listeners.splice(i, 1)
    }
  }
}

export const unlockAudio = async () => {
  if (unlocked) {
    return
  }
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext()
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume()
    }
    // play a silent buffer to fully unlock the audio pipeline on iOS
    const buffer = audioCtx.createBuffer(1, 1, 22050)
    const source = audioCtx.createBufferSource()
    source.buffer = buffer
    source.connect(audioCtx.destination)
    source.start(0)
    unlocked = true
    listeners.splice(0).forEach(cb => cb())
  } catch (e) {
    console.error('[webUnlockAudio]: Failed to unlock audio context', e)
  }
}
