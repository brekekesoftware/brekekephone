import { observer } from 'mobx-react'
import React from 'react'

import ringback from '../../assets/incallmanager_ringback.mp3'
import ringtone from '../../assets/incallmanager_ringtone.mp3'

const IncomingItem = observer(p => (
  <audio autoPlay key={p.id} loop src={ringtone} volume={1} />
))
const OutgoingItem = observer(p => (
  <audio autoPlay key={p.id} loop src={ringback} volume={1} />
))

const IncomingList = observer(p => p.ids.map(id => <IncomingItem key={id} />))
const OutgoingList = observer(p => p.ids.map(id => <OutgoingItem key={id} />))

class AnsweredItem extends React.Component {
  audioRef = React.createRef()
  componentDidMount() {
    this.audioRef.current.srcObject = this.props.voiceStreamObject
  }
  render() {
    return <audio autoPlay ref={this.audioRef} volume={1} />
  }
}

const AnsweredList = observer(p => {
  return p.ids.map(id => {
    const c = p.resolve(id)
    return (
      <AnsweredItem
        key={c.voiceStreamObject?.id || c.id}
        voiceStreamObject={c.voiceStreamObject}
      />
    )
  })
})

const CallVoicesUI = observer(p => (
  <React.Fragment>
    <IncomingList ids={p.incomingCallIds} resolve={p.resolveCall} />
    <OutgoingList ids={p.outgoingCallIds} resolve={p.resolveCall} />
    <AnsweredList ids={p.answeredCallIds} resolve={p.resolveCall} />
  </React.Fragment>
))

export default CallVoicesUI
