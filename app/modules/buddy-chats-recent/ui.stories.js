import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

const partyName = faker.name.findName();
const partyAvatar = { uri: faker.image.avatar() };
const meName = faker.name.findName();
const meAvatar = { uri: faker.image.avatar() };
const lastestCreated = faker.date.recent();

const monthName = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const isToday = time => {
  const now = new Date();
  const beginOfToday = now.setHours(0, 0, 0, 0);
  const endOfTday = now.setHours(23, 59, 59, 999);
  return time >= beginOfToday && time <= endOfTday;
};

const formatTime = time => {
  time = new Date(time);
  const hour = time
    .getHours()
    .toString()
    .padStart(2, '0');
  const min = time
    .getMinutes()
    .toString()
    .padStart(2, '0');
  if (isToday(time)) return `${hour}:${min}`;

  const month = monthName[time.getMonth()];
  const day = time.getDate();
  return `${month} ${day} - ${hour}:${min}`;
};

const chats = [
  {
    creatorName: partyName,
    creatorAvatar: partyAvatar,
    created: formatTime(lastestCreated - 140000),
    text: faker.lorem.sentence(),
  },
  {
    creatorName: meName,
    creatorAvatar: meAvatar,
    created: formatTime(lastestCreated - 130000),
    text: faker.lorem.text(),
    mini: faker.random.boolean(),
  },
  {
    creatorName: meName,
    creatorAvatar: meAvatar,
    created: formatTime(lastestCreated - 120000),
    text: faker.lorem.paragraph(),
    mini: faker.random.boolean(),
  },
  {
    creatorName: partyName,
    creatorAvatar: partyAvatar,
    created: formatTime(lastestCreated - 60000),
    text: faker.lorem.words(),
    mini: faker.random.boolean(),
  },
  {
    creatorName: partyName,
    creatorAvatar: partyAvatar,
    created: formatTime(lastestCreated - 30000),
    text: faker.lorem.paragraph(),
    mini: faker.random.boolean(),
  },
  {
    creatorName: meName,
    creatorAvatar: meAvatar,
    created: formatTime(lastestCreated - 15000),
    text: faker.lorem.paragraph(),
    mini: faker.random.boolean(),
  },
  {
    creatorName: meName,
    creatorAvatar: meAvatar,
    created: formatTime(lastestCreated - 10000),
    text: faker.lorem.text(),
    mini: faker.random.boolean(),
  },
  {
    creatorName: partyName,
    creatorAvatar: partyAvatar,
    created: formatTime(lastestCreated - 5000),
    text: faker.lorem.sentence(),
    mini: faker.random.boolean(),
  },
  {
    creatorName: partyName,
    creatorAvatar: partyAvatar,
    created: formatTime(lastestCreated - 1000),
    text: faker.lorem.words(),
    mini: faker.random.boolean(),
  },
  {
    creatorName: partyName,
    creatorAvatar: partyAvatar,
    created: formatTime(lastestCreated),
    text: faker.lorem.paragraph(),
    mini: faker.random.boolean(),
  },
  {
    creatorName: partyName,
    creatorAvatar: partyAvatar,
    created: formatTime(lastestCreated),
    file: {
      incoming: true,
      name: faker.system.fileName(),
      size: '1.5KB',
      transferPercent: 0,
      transferWaiting: true,
      transferStarted: false,
      transferStopped: false,
      transferSuccess: false,
      transferFailure: false,
    },
    mini: faker.random.boolean(),
  },
  {
    creatorName: partyName,
    creatorAvatar: partyAvatar,
    created: formatTime(lastestCreated),
    file: {
      name: faker.system.fileName(),
      size: '1.5KB',
      transferPercent: 0,
      transferWaiting: true,
      transferStarted: false,
      transferStopped: false,
      transferSuccess: false,
      transferFailure: false,
    },
    mini: faker.random.boolean(),
  },
  {
    creatorName: partyName,
    creatorAvatar: partyAvatar,
    created: formatTime(lastestCreated),
    file: {
      name: faker.system.fileName(),
      size: '1.5KB',
      transferPercent: faker.random.number() % 100,
      transferWaiting: false,
      transferStarted: true,
      transferStopped: false,
      transferSuccess: false,
      transferFailure: false,
    },
    mini: faker.random.boolean(),
  },
  {
    creatorName: partyName,
    creatorAvatar: partyAvatar,
    created: formatTime(lastestCreated),
    file: {
      name: faker.system.fileName(),
      size: '1.5KB',
      transferPercent: 100,
      transferWaiting: false,
      transferStarted: false,
      transferStopped: false,
      transferSuccess: true,
      transferFailure: false,
    },
    mini: faker.random.boolean(),
  },
  {
    creatorName: partyName,
    creatorAvatar: partyAvatar,
    created: formatTime(lastestCreated),
    file: {
      name: faker.system.fileName(),
      size: '1.5KB',
      transferPercent: faker.random.number() % 100,
      transferWaiting: false,
      transferStarted: false,
      transferStopped: false,
      transferSuccess: false,
      transferFailure: true,
    },
    mini: faker.random.boolean(),
  },
  {
    creatorName: partyName,
    creatorAvatar: partyAvatar,
    created: formatTime(lastestCreated),
    file: {
      name: faker.system.fileName(),
      size: '1.5KB',
      transferPercent: faker.random.number() % 100,
      transferWaiting: false,
      transferStarted: false,
      transferStopped: true,
      transferSuccess: false,
      transferFailure: false,
    },
    mini: faker.random.boolean(),
  },
];

const resolveChat = i => chats[i];

storiesOf(UI.name, module)
  .add('normal', () => (
    <UI
      hasMore
      buddyName={partyName}
      resolveChat={resolveChat}
      chatIds={Array.from(chats, (_, i) => i)}
      setEditingText={action('setEditingText')}
      submitEditingText={action('submitEditingText')}
      loadMore={action('loadMore')}
      acceptFile={action('acceptFile')}
      rejectFile={action('rejectFile')}
      pickFile={action('pickFile')}
    />
  ))
  .add('loading recent', () => <UI loadingRecent buddyName={partyName} />)
  .add('loading more', () => (
    <UI
      loadingMore
      buddyName={partyName}
      chatIds={Array.from(chats, (_, i) => i)}
      resolveChat={resolveChat}
      setEditingText={action('setEditingText')}
      submitEditingText={action('submitEditingText')}
      acceptFile={action('acceptFile')}
      rejectFile={action('rejectFile')}
      pickFile={action('pickFile')}
    />
  ));
