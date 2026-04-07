import { observer } from 'mobx-react'
import { Component, createRef, useEffect, useRef, useState } from 'react'

import ringback from '#/assets/incallmanager_ringback.mp3'
import ringtone from '#/assets/incallmanager_ringtone.mp3'
import { embedApi } from '#/embed/embedApi'
import { isEmbed } from '#/embed/polyfill'
import { ctx } from '#/stores/ctx'
import type { staticRingtones } from '#/utils/BrekekeUtils'

// all options are static on web
const ringtoneOptions: {
  // strong typing to make sure not missing static ringtone mp3
  [k in (typeof staticRingtones)[number]]: string
} = {
  incallmanager_ringtone: ringtone,
}
const _default = ringtoneOptions.incallmanager_ringtone

export const IncomingItem = observer(() => {
  // reset to make sure it will rerender
  const [loading, setLoading] = useState(false)
  const reset = () => {
    setLoading(true)
    setTimeout(() => setLoading(false))
  }
  // catch error
  const [error, setError] = useState<{ [k: string]: boolean }>({})
  const onError = (k: string) => {
    setError(e => (typeof e[k] === 'boolean' ? e : { ...e, [k]: true }))
    reset()
  }
  const onPlay = (k: string) => setError(e => ({ ...e, [k]: false }))
  // similar to validate in Ringtone.java
  const validate = (r?: string) => {
    if (!r) {
      return
    }
    if (
      r.startsWith('https://') ||
      r.startsWith('http://') ||
      r.startsWith('data:') ||
      r.startsWith('blob:') ||
      r.startsWith('file:')
    ) {
      return r
    }
    if (ringtoneOptions[r]) {
      return ringtoneOptions[r]
    }
    return
  }
  const validateWithError = (r?: string) => {
    r = validate(r)
    if (!r) {
      return
    }
    if (error[r]) {
      return
    }
    return r
  }
  // try each with the same priority in Ringtone.java
  const ca = ctx.auth.getCurrentAccount()
  const c = ctx.call.getCallInNotify()
  const priority = [
    ctx.call.ringtone,
    c?.ringtoneFromSip,
    ca?.ringtone,
    ca?.pbxRingtone,
  ]
  const r = ctx.global.buildEmbedStaticPath(
    priority.map(validateWithError).find(v => v) || _default,
  )
  // reset to make sure it will rerender
  useEffect(reset, [r])
  // register audio element for speaker selection in embed mode
  const audioRef = useRef<HTMLAudioElement>(null)
  useEffect(() => {
    const el = audioRef.current
    if (!el) {
      return
    }
    let cancelled = false
    const setup = async () => {
      if (isEmbed) {
        await embedApi.registerAudioElement(el)
      }
      if (!cancelled) {
        el.play().catch(() => {})
      }
    }
    setup()
    return () => {
      cancelled = true
      if (isEmbed) {
        embedApi.unregisterAudioElement(el)
      }
      el.pause()
    }
  }, [loading])
  // render
  return loading ? null : (
    <audio
      ref={audioRef}
      src={r}
      loop
      muted={false}
      onPlay={() => onPlay(r)}
      onError={() => onError(r)}
    />
  )
})
export const OutgoingItem = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  useEffect(() => {
    const el = audioRef.current
    if (!el) {
      return
    }
    let cancelled = false
    const setup = async () => {
      if (isEmbed) {
        await embedApi.registerAudioElement(el)
      }
      if (!cancelled) {
        el.play().catch(() => {})
      }
    }
    setup()
    return () => {
      cancelled = true
      if (isEmbed) {
        embedApi.unregisterAudioElement(el!)
      }
      el.pause()
    }
  }, [])
  return (
    <audio
      ref={audioRef}
      loop
      src={ctx.global.buildEmbedStaticPath(ringback)}
      muted={false}
    />
  )
}

export class OutgoingItemWithSDP extends Component<{
  earlyMedia: MediaStream | null
}> {
  audioRef = createRef<HTMLAudioElement>()
  _unmounted = false
  componentDidMount = () => {
    this._setup()
  }
  componentDidUpdate = () => {
    this._setup()
  }
  _setup = async () => {
    if (!this.audioRef.current) {
      return
    }
    if (isEmbed) {
      await embedApi.registerAudioElement(this.audioRef.current)
    }
    if (this._unmounted) {
      return
    }
    if (
      this.props.earlyMedia &&
      this.props.earlyMedia !== this.audioRef.current.srcObject
    ) {
      this.audioRef.current.srcObject = this.props.earlyMedia
      this.audioRef.current.play()
    }
  }
  componentWillUnmount = () => {
    this._unmounted = true
    if (isEmbed && this.audioRef.current) {
      embedApi.unregisterAudioElement(this.audioRef.current)
    }
  }
  render() {
    return <audio ref={this.audioRef} muted={false} />
  }
}
export class AnsweredItem extends Component<{
  voiceStreamObject: MediaStream | null
}> {
  audioRef = createRef<HTMLAudioElement>()
  _unmounted = false
  componentDidMount = () => {
    this._setup()
  }
  componentDidUpdate = () => {
    this._setup()
  }
  _setup = async () => {
    if (!this.audioRef.current) {
      return
    }
    if (isEmbed) {
      await embedApi.registerAudioElement(this.audioRef.current)
    }
    if (this._unmounted) {
      return
    }
    if (
      this.props.voiceStreamObject &&
      this.props.voiceStreamObject !== this.audioRef.current.srcObject
    ) {
      this.audioRef.current.srcObject = this.props.voiceStreamObject
      this.audioRef.current.play()
    }
  }
  componentWillUnmount = () => {
    this._unmounted = true
    if (isEmbed && this.audioRef.current) {
      embedApi.unregisterAudioElement(this.audioRef.current)
    }
  }
  render() {
    return <audio ref={this.audioRef} muted={false} />
  }
}
