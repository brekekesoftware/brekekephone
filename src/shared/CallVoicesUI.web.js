import React from 'react';

import ringback from '../assets/incallmanager_ringback.mp3';
import ringtone from '../assets/incallmanager_ringtone.mp3';

const IncomingItem = p => (
  <audio autoPlay key={p.id} loop src={ringtone} volume={1} />
);
const IncomingList = p => p.ids.map(id => <IncomingItem key={id} />);
const OutgoingItem = p => (
  <audio autoPlay key={p.id} loop src={ringback} volume={1} />
);
const OutgoingList = p => p.ids.map(id => <OutgoingItem key={id} />);

const AnsweredItem = p => (
  <audio
    autoPlay
    key={p.id}
    ref={audio => {
      if (audio) {
        audio.srcObject = p.voiceStreamObject;
      }
    }}
    volume={1}
  />
);

const AnsweredList = p =>
  p.ids.map(id => <AnsweredItem key={id} {...p.resolve(id)} />);

const CallVoicesUI = p => (
  <React.Fragment>
    <IncomingList
      ids={p.incomingCallIds.filter(i => i !== undefined)}
      resolve={p.resolveCall}
    />
    <OutgoingList
      ids={p.outgoingCallIds.filter(i => i !== undefined)}
      resolve={p.resolveCall}
    />
    <AnsweredList
      ids={p.answeredCallIds.filter(i => i !== undefined)}
      resolve={p.resolveCall}
    />
  </React.Fragment>
);

export default CallVoicesUI;
