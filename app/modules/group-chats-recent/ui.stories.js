import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

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

const members = [
  { avatar: { uri: faker.image.avatar() }, name: faker.name.findName() },
  { avatar: { uri: faker.image.avatar() }, name: faker.name.findName() },
  { avatar: { uri: faker.image.avatar() }, name: faker.name.findName() },
  { avatar: { uri: faker.image.avatar() }, name: faker.name.findName() },
  { avatar: { uri: faker.image.avatar() }, name: faker.name.findName() },
  { avatar: { uri: faker.image.avatar() }, name: faker.name.findName() },
  { avatar: { uri: faker.image.avatar() }, name: faker.name.findName() },
  { avatar: { uri: faker.image.avatar() }, name: faker.name.findName() },
  { avatar: { uri: faker.image.avatar() }, name: faker.name.findName() },
  { avatar: { uri: faker.image.avatar() }, name: faker.name.findName() },
  { avatar: { uri: faker.image.avatar() }, name: faker.name.findName() },
];

const chats = [
  {
    creatorName: faker.name.findName(),
    creatorAvatar: { uri: faker.image.avatar() },
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
    creatorName: faker.name.findName(),
    creatorAvatar: { uri: faker.image.avatar() },
    created: formatTime(lastestCreated - 60000),
    text: faker.lorem.words(),
    mini: faker.random.boolean(),
  },
  {
    creatorName: faker.name.findName(),
    creatorAvatar: { uri: faker.image.avatar() },
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
    creatorName: faker.name.findName(),
    creatorAvatar: { uri: faker.image.avatar() },
    created: formatTime(lastestCreated - 5000),
    text: faker.lorem.sentence(),
    mini: faker.random.boolean(),
  },
  {
    creatorName: faker.name.findName(),
    creatorAvatar: { uri: faker.image.avatar() },
    created: formatTime(lastestCreated - 1000),
    text: faker.lorem.words(),
    mini: faker.random.boolean(),
  },
  {
    creatorName: faker.name.findName(),
    creatorAvatar: { uri: faker.image.avatar() },
    created: formatTime(lastestCreated),
    text: faker.lorem.paragraph(),
    mini: faker.random.boolean(),
  },
];

const resolveChat = i => chats[i];

storiesOf(UI.name, module)
  .add('normal', () => (
    <UI
      hasMore
      groupName={faker.commerce.department()}
      resolveChat={resolveChat}
      members={Array.from(members, (_, i) => i)}
      resolveMember={id => members[id]}
      chatIds={Array.from(chats, (_, i) => i)}
      setEditingText={action('setEditingText')}
      submitEditingText={action('submitEditingText')}
      loadMore={action('loadMore')}
      leave={action('leave')}
      back={action('back')}
    />
  ))
  .add('no member', () => (
    <UI
      hasMore
      groupName={faker.commerce.department()}
      resolveChat={resolveChat}
      members={[]}
      chatIds={Array.from(chats, (_, i) => i)}
      setEditingText={action('setEditingText')}
      submitEditingText={action('submitEditingText')}
      loadMore={action('loadMore')}
      leave={action('leave')}
      back={action('back')}
    />
  ))
  .add('loading recent', () => (
    <UI
      loadingRecent
      groupName={faker.commerce.department()}
      leave={action('leave')}
      back={action('back')}
    />
  ))
  .add('loading more', () => (
    <UI
      loadingMore
      groupName={faker.commerce.department()}
      resolveChat={resolveChat}
      members={Array.from(members, (_, i) => i)}
      resolveMember={id => members[id]}
      chatIds={Array.from(chats, (_, i) => i)}
      setEditingText={action('setEditingText')}
      submitEditingText={action('submitEditingText')}
      leave={action('leave')}
      back={action('back')}
    />
  ));
