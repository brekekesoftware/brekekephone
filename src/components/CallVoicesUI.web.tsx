import { observer } from 'mobx-react'
import React, { Component, createRef } from 'react'

import ringback from '../assets/incallmanager_ringback.mp3'
import ringtone from '../assets/incallmanager_ringtone.mp3'
import { Call } from '../stores/Call'

class AnsweredItem extends Component<{
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

export const CallVoicesUI = observer(
  (p: {
    incomingCallIds: string[]
    outgoingCallIds: string[]
    answeredCallIds: string[]
    resolveCall: (id: string) => Call
  }) => (
    <>
      {!!p.incomingCallIds.length && (
        <audio autoPlay loop src={ringtone} muted={false} />
      )}
      {!!p.outgoingCallIds.length && (
        <audio autoPlay loop src={ringback} muted={false} />
      )}
      {p.answeredCallIds.map(id => {
        const c = p.resolveCall(id)
        return (
          <AnsweredItem
            key={c.voiceStreamObject?.id || c.id}
            voiceStreamObject={c.voiceStreamObject}
          />
        )
      })}
    </>
  ),
)
