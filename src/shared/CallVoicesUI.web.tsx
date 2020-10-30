import { observer } from 'mobx-react'
import React from 'react'

import ringback from '../assets/incallmanager_ringback.mp3'
import ringtone from '../assets/incallmanager_ringtone.mp3'
import Call from '../global/Call'

class AnsweredItem extends React.Component<{
  voiceStreamObject: MediaStream | null
}> {
  audioRef = React.createRef<HTMLAudioElement>()
  componentDidMount() {
    if (!this.audioRef.current) {
      return
    }
    this.audioRef.current.srcObject = this.props.voiceStreamObject
  }
  componentDidUpdate() {
    this.componentDidMount()
  }
  render() {
    return <audio autoPlay ref={this.audioRef} muted={false} />
  }
}

const CallVoicesUI = observer(
  (p: {
    incomingCallIds: string[]
    outgoingCallIds: string[]
    answeredCallIds: string[]
    resolveCall: (id: string) => Call
  }) => (
    <React.Fragment>
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
    </React.Fragment>
  ),
)

export default CallVoicesUI
