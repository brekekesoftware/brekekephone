import React from 'react';
import { storiesOf } from '@storybook/react-native';
import UI from './ui';

const calls = [
  {
    enabled: true,
    source: 'http://video.webmfiles.org/big-buck-bunny_trailer.webm',
  },
  {
    enabled: true,
    source: null,
  },
  {
    source: 'http://video.webmfiles.org/big-buck-bunny_trailer.webm',
  },
];

storiesOf(UI.name, module).add('normal', () => (
  <UI callIds={Object.keys(calls)} resolveCall={id => calls[id]} />
));
