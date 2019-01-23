import React, { Component, Fragment } from 'react';
import InCall from 'react-native-incall-manager';

class IncomingItem extends Component {
  componentDidMount() {
    InCall.startRingtone('_BUNDLE_');
  }

  componentWillUnmount() {
    InCall.stopRingtone();
  }

  render = () => null;
}

const IncomingList = p =>
  p.ids.map(id => <IncomingItem key={id} {...p.resolve(id)} />);

class OutgoingItem extends Component {
  componentDidMount() {
    InCall.start({ ringback: '_BUNDLE_' });
  }

  componentWillUnmount() {
    InCall.stopRingback();
  }

  render = () => null;
}

const OutgoingList = p =>
  p.ids.map(id => <OutgoingItem key={id} {...p.resolve(id)} />);

const CallVoices = p => (
  <Fragment>
    <IncomingList ids={p.incomingCallIds} resolve={p.resolveCall} />
    <OutgoingList ids={p.outgoingCallIds} resolve={p.resolveCall} />
  </Fragment>
);

export default CallVoices;
