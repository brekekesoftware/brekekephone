import { Component, createRef } from 'react'

import ringback from '../assets/incallmanager_ringback.mp3'
import ringtone from '../assets/incallmanager_ringtone.mp3'

export const IncomingItem = () => (
  <audio autoPlay loop src={ringtone} muted={false} />
)
export const OutgoingItem = () => (
  <audio autoPlay loop src={ringback} muted={false} />
)

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
