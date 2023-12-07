import { observer } from 'mobx-react'
import { Component, createRef } from 'react'

import ringback from '../assets/incallmanager_ringback.mp3'
import ringtone from '../assets/incallmanager_ringtone.mp3'
import { getCallStore } from '../stores/callStore'

export const IncomingItem = observer(() => (
  <audio
    autoPlay
    loop
    src={getCallStore().ringtone || ringtone}
    muted={false}
  />
))
export const OutgoingItem = () => (
  <audio autoPlay loop src={ringback} muted={false} />
)

export class OutgoingItemWithSDP extends Component<{
  earlyMedia: MediaStream | null
}> {
  audioRef = createRef<HTMLAudioElement>()
  componentDidMount() {
    if (!this.audioRef.current) {
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
  componentDidUpdate() {
    this.componentDidMount()
  }
  render() {
    return <audio autoPlay ref={this.audioRef} muted={false} />
  }
}
export class AnsweredItem extends Component<{
  voiceStreamObject: MediaStream | null
}> {
  audioRef = createRef<HTMLAudioElement>()
  componentDidMount() {
    if (!this.audioRef.current) {
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
  componentDidUpdate() {
    this.componentDidMount()
  }
  render() {
    return <audio autoPlay ref={this.audioRef} muted={false} />
  }
}
