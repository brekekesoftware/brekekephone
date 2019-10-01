import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import arrToMap from '../-/arrToMap';
import chatStore from '../-/chatStore';
import contactStore from '../-/contactStore';
import pickFile from '../-/pickFile';
import saveBlob from '../-/saveBlob';
import g from '../global';
import Layout from '../shared/Layout';
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
class ChatDetail extends React.Component {
  @computed get chatIds() {
    return (
      chatStore.messagesByThreadId[this.props.match.params.buddy] || []
    ).map(m => m.id);
  }
  @computed get chatById() {
    return arrToMap(
      chatStore.messagesByThreadId[this.props.match.params.buddy] || [],
      `id`,
      m => m,
    );
  }

  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  state = {
    loadingRecent: false,
    loadingMore: false,
    editingText: ``,
    showImage: ``,
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
            urlImage={this.state.showImage}
            hasMore={this.chatIds.length > 0 && !this.state.loadingMore}
            loadingMore={this.state.loadingMore}
            {...this.resolveChat(id, index)}
            loadMore={this.loadMore}
          />
        ))}
      </Layout>
    );
  }

  resolveChat = (id, index) => {
    const chat = this.chatById[id];
    const prev = this.chatById[this.chatIds[index - 1]] || {};
    const mini = isMiniChat(chat, prev);
    const created = chat.created && formatTime(chat.created);
    const file = chatStore.filesMap[chat.file];
    const text = chat.text;

    if (mini) {
      return {
        mini: true,
        created,
        text,
        file,
      };
    }

    const creator = this.resolveCreator(chat.creator);
    const creatorName =
      !creator.name || creator.name.length === 0 ? creator.id : creator.name;

    return {
      creatorName: creatorName,
      creatorAvatar: creator.avatar,
      text,
      file,
      created,
    };
  };

  me = this.context.uc.me();

  resolveCreator = creator => {
    if (creator === this.me.id) {
      return this.me;
    }
    return contactStore.getUCUser(creator) || {};
  };

  loadRecent() {
    this.context.uc
      .getBuddyChats(this.props.match.params.buddy, {
        max: numberOfChatsPerLoad,
      })
      .then(this.onLoadRecentSuccess)
      .catch(this.onLoadRecentFailure);
    //
    this.setState({ loadingRecent: true });
  }

  onLoadRecentSuccess = chats => {
    this.setState({
      loadingRecent: false,
    });
    chats = chats.reverse();
    const u = contactStore.getUCUser(this.props.match.params.buddy);
    chatStore.pushMessages(u.id, chats);
  };
  onLoadRecentFailure = err => {
    this.setState({ loadingRecent: false });
    g.showError({ err, message: `get recent chats` });
  };

  loadMore = () => {
    const oldestChat = this.chatById[this.chatIds[0]] || {};
    const oldestCreated = oldestChat.created || 0;
    const max = numberOfChatsPerLoad;
    const end = oldestCreated;

    const query = { max, end };

    const { uc } = this.context;
    const u = contactStore.getUCUser(this.props.match.params.buddy);

    uc.getBuddyChats(u?.id, query)
      .then(this.onLoadMoreSuccess)
      .catch(this.onLoadMoreFailure);

    this.setState({
      loadingMore: true,
    });
  };

  onLoadMoreSuccess = chats => {
    this.setState({
      loadingMore: false,
    });
    chats = chats.reverse();
    const u = contactStore.getUCUser(this.props.match.params.buddy);
    chatStore.pushMessages(u.id, chats);
  };

  onLoadMoreFailure = err => {
    this.setState({
      loadingMore: false,
    });
    g.showError({ err, message: `get more chats` });
  };

  setEditingText = editingText => {
    this.setState({ editingText });
  };

  submitting = false;

  submitEditingText = () => {
    const txt = this.state.editingText.trim();
    if (!txt || this.submitting) {
      return;
    }
    this.submitting = true;
    //
    this.context.uc
      .sendBuddyChatText(this.props.match.params.buddy, txt)
      .then(this.onSubmitEditingTextSuccess)
      .catch(this.onSubmitEditingTextFailure)
      .then(() => {
        this.submitting = false;
      });
  };
  onSubmitEditingTextSuccess = chat => {
    chatStore.pushMessages(this.props.match.params.buddy, chat);
    this.setState({ editingText: `` });
  };
  onSubmitEditingTextFailure = err => {
    g.showError({ err, message: `send the message` });
  };

  acceptFile = file => {
    this.context.uc
      .acceptFile(file.id)
      .then(blob => saveBlob(blob, file.name))
      .catch(this.onAcceptFileFailure);
  };
  onAcceptFileFailure = err => {
    g.showError({ err, message: `accept file` });
  };

  rejectFile = file => {
    this.context.uc.rejectFile(file.id).catch(this.onRejectFileFailure);
  };
  onRejectFileFailure = err => {
    g.showError({ err, message: `reject file` });
  };

  pickFile = () => {
    pickFile(this.sendFile);
  };

  blob = file => {
    const reader = new FileReader();
    reader.onload = async () => {
      const url = reader.result;
      this.setState({ showImage: url });
    };
    reader.readAsDataURL(file);
  };

  sendFile = file => {
    const { uc } = this.context;
    this.blob(file);
    const u = contactStore.getUCUser(this.props.match.params.buddy);
    uc.sendFile(u?.id, file)
      .then(this.onSendFileSuccess)
      .catch(this.onSendFileFailure);
  };
  onSendFileSuccess = res => {
    const buddyId = this.props.match.params.buddy;
    chatStore.pushMessages(buddyId, res.chat);
    chatStore.upsertFile(res.file);
  };
  onSendFileFailure = err => {
    g.showError({ err, message: `send file` });
  };
}

export default ChatDetail;
