import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

const incoming = {
  id: 'incoming',
  partyName: faker.name.findName(),
  partyNumber: faker.phone.phoneNumber(),
  incoming: true,
  answered: false,
};

const outgoing = {
  id: 'outgoing',
  partyName: faker.name.findName(),
  partyNumber: faker.phone.phoneNumber(),
  incoming: false,
  answered: false,
};

const answered = {
  id: 'answered',
  partyName: faker.name.findName(),
  partyNumber: faker.phone.phoneNumber(),
  answered: true,
};

const recording = {
  id: 'recording',
  partyName: faker.name.findName(),
  partyNumber: faker.phone.phoneNumber(),
  answered: true,
  recording: true,
};

const holding = {
  id: 'holding',
  partyName: faker.name.findName(),
  partyNumber: faker.phone.phoneNumber(),
  answered: true,
  holding: true,
};

const video = {
  id: 'video',
  partyName: faker.name.findName(),
  partyNumber: faker.phone.phoneNumber(),
  answered: true,
  localVideoEnabled: true,
};

const opts = {
  create: action('create'),
  hangup: action('hangup'),
  answer: action('answer'),
  hold: action('hold'),
  unhold: action('unhold'),
  startRecording: action('startRecording'),
  stopRecording: action('stopRecording'),
  transfer: action('transfer'),
  dtmf: action('dtmf'),
  park: action('park'),
  unpark: action('unpark'),
  enableVideo: action('enableVideo'),
  disableVideo: action('disableVideo'),
};

storiesOf(UI.name, module)
  .add('no selecting call', () => (
    <UI
      runningIds={[
        'incoming',
        'outgoing',
        'answered',
        'recording',
        'holding',
        'video',
      ]}
      runningById={{ incoming, outgoing, answered, recording, holding, video }}
      parkingIds={[12001, 12002, 12003]}
      {...opts}
    />
  ))
  .add('selecting incoming call', () => (
    <UI
      runningIds={[
        'incoming',
        'outgoing',
        'answered',
        'recording',
        'holding',
        'video',
      ]}
      runningById={{ incoming, outgoing, answered, recording, holding, video }}
      selectedId="incoming"
      parkingIds={[12001, 12002, 12003]}
      {...opts}
    />
  ))
  .add('selecting outgoing call', () => (
    <UI
      runningIds={[
        'incoming',
        'outgoing',
        'answered',
        'recording',
        'holding',
        'video',
      ]}
      runningById={{ incoming, outgoing, answered, recording, holding, video }}
      selectedId="outgoing"
      parkingIds={[12001, 12002, 12003]}
      {...opts}
    />
  ))
  .add('selecting answered call', () => (
    <UI
      runningIds={[
        'incoming',
        'outgoing',
        'answered',
        'recording',
        'holding',
        'video',
      ]}
      runningById={{ incoming, outgoing, answered, recording, holding, video }}
      selectedId="answered"
      parkingIds={[12001, 12002, 12003]}
      {...opts}
    />
  ))
  .add('selecting holding call', () => (
    <UI
      runningIds={[
        'incoming',
        'outgoing',
        'answered',
        'recording',
        'holding',
        'video',
      ]}
      runningById={{ incoming, outgoing, answered, recording, holding, video }}
      selectedId="holding"
      parkingIds={[12001, 12002, 12003]}
      {...opts}
    />
  ))
  .add('selecting recording call', () => (
    <UI
      runningIds={[
        'incoming',
        'outgoing',
        'answered',
        'recording',
        'holding',
        'video',
      ]}
      runningById={{ incoming, outgoing, answered, recording, holding, video }}
      selectedId="recording"
      parkingIds={[12001, 12002, 12003]}
      {...opts}
    />
  ))
  .add('selecting video call', () => (
    <UI
      runningIds={[
        'incoming',
        'outgoing',
        'answered',
        'recording',
        'holding',
        'video',
      ]}
      runningById={{ incoming, outgoing, answered, recording, holding, video }}
      selectedId="video"
      parkingIds={[12001, 12002, 12003]}
      {...opts}
    />
  ));
