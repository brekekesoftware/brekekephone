import React, { Fragment } from 'react';

import ringback from './incallmanager_ringback.mp3';
import ringtone from './incallmanager_ringtone.mp3';

const IncomingItem = p => (
  <audio key={p.id} autoPlay volume={1} loop src={ringtone} />
);
const IncomingList = p => p.ids.map(id => <IncomingItem key={id} />);
const OutgoingItem = p => (
  <audio key={p.id} autoPlay volume={1} loop src={ringback} />
);
const OutgoingList = p => p.ids.map(id => <OutgoingItem key={id} />);

const AnsweredItem = p => (
  <audio
    key={p.id}
    autoPlay
    volume={1}
    ref={audio => {
      if (audio) {
        audio.srcObject = p.voiceStreamObject;
      }
    }}
  />
);

const AnsweredList = p =>
  p.ids.map(id => <AnsweredItem key={id} {...p.resolve(id)} />);

const CallVoices = p => (
  <Fragment>
    <IncomingList ids={p.incomingCallIds} resolve={p.resolveCall} />
    <OutgoingList ids={p.outgoingCallIds} resolve={p.resolveCall} />
    <AnsweredList ids={p.answeredCallIds} resolve={p.resolveCall} />
  </Fragment>
);

export default CallVoices;
