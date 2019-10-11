import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import chatStore from '../-/chatStore';
import contactStore from '../-/contactStore';
import pickFile from '../-/pickFile';
import saveBlob from '../-/saveBlob';
import g from '../global';
import Layout from '../shared/Layout';
import { arrToMap } from '../utils/toMap';
import Message from './Message';

const monthName = [
  `Jan`,
  `Feb`,
  `Mar`,
  `Apr`,
  `May`,
  `Jun`,
  `Jul`,
  `Aug`,
  `Sep`,
  `Oct`,
  `Nov`,
  `Dec`,
];

const isToday = time => {
  const now = new Date();
  const beginOfToday = now.setHours(0, 0, 0, 0);
  const endOfTday = now.setHours(23, 59, 59, 999);
  return time >= beginOfToday && time <= endOfTday;
};

const formatTime = time => {
  time = time.replace(` `, `T`) + `Z`;
  time = new Date(time);
  const hour = time
    .getHours()
    .toString()
    .padStart(2, `0`);
  const min = time
    .getMinutes()
    .toString()
    .padStart(2, `0`);

  if (isToday(time)) return `${hour}:${min}`;

  const month = monthName[time.getMonth()];
  const day = time.getDate();
  return `${month} ${day} - ${hour}:${min}`;
};

const miniChatDuration = 60000;
const isMiniChat = (chat, prev = {}) =>
  chat.creator === prev.creator &&
  chat.created - prev.created < miniChatDuration;
const numberOfChatsPerLoad = 50;

@observer
class ChatGroupDetail extends React.Component {
  @computed get chatIds() {
    return (
      chatStore.messagesByThreadId[this.props.match.params.group] || []
    ).map(m => m.id);
  }
  @computed get chatById() {
    return arrToMap(
      chatStore.messagesByThreadId[this.props.match.params.group] || [],
      `id`,
      m => m,
    );
  }
  static contextTypes = {
    uc: PropTypes.object.isRequired,
    sip: PropTypes.object.isRequired,
  };

  state = {
    target: ``,
    loadingRecent: false,
    loadingMore: false,
    editingText: ``,
  };

  componentDidMount() {
    const noChat = !this.chatIds.length;

    if (noChat) this.loadRecent();
  }
  render() {
    const u = contactStore.getUCUser(this.props.match.params.buddy);
    return (
      <Layout
        header={{
          onBackBtnPress: g.goToChatsRecent,
          title: u?.name,
        }}
        footer={{
          actions: {
            selectFile: this.pickFile,
            inputChat: true,
            text: this.state.editingText,
            setText: this.setEditingText,
            submitText: this.submitEditingText,
          },
        }}
      >
        {this.chatIds.map((id, index) => (
          <Message
            last={index === this.chatIds.length - 1}
            hasMore={this.chatIds.length > 0 && !this.state.loadingMore}
            loadingMore={this.state.loadingMore}
            {...this.resolveChat(id, index)}
            loadMore={this.loadMore}
            acceptFile={this.acceptFile}
            rejectFile={this.rejectFile}
            showImage={this.state.showImage}
            fileType={this.state.fileType}
          />
        ))}
      </Layout>
    );
  }
}

export default ChatGroupDetail;
