import React from 'react';
import InCall from 'react-native-incall-manager';

class IncomingItem extends React.Component {
  componentDidMount() {
    InCall.startRingtone('_BUNDLE_');
  }

  componentWillUnmount() {
    InCall.stopRingtone();
  }

  render() {
    return null;
  }
}

const IncomingList = p =>
  p.ids.map(id => <IncomingItem key={id} {...p.resolve(id)} />);

class OutgoingItem extends React.Component {
  componentDidMount() {
    InCall.start({
      ringback: '_BUNDLE_',
    });
  }

  componentWillUnmount() {
    InCall.stopRingback();
  }

  render() {
    return null;
  }
}

const OutgoingList = p =>
  p.ids.map(id => <OutgoingItem key={id} {...p.resolve(id)} />);

const CallVoices = p => (
  <React.Fragment>
    <IncomingList ids={p.incomingCallIds} resolve={p.resolveCall} />
    <OutgoingList ids={p.outgoingCallIds} resolve={p.resolveCall} />
  </React.Fragment>
);

export default CallVoices;
