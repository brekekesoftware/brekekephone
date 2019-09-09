import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import arrToMap from '../../shared/arrToMap';
import chatStore from '../../shared/chatStore';
import contactStore from '../../shared/contactStore';
import pickFile from '../../shared/pickFile';
import routerStore from '../../shared/routerStore';
import saveBlob from '../../shared/saveBlob';
import stripTags from '../../shared/stripTags';
import Toast from '../../shared/Toast';
import ChatsDetail from '../components-Chats/Chat-Detail';

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
  time = time.replace(' ', 'T') + 'Z';
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

const miniChatDuration = 60000;
const isMiniChat = (chat, prev = {}) =>
  chat.creator === prev.creator &&
  chat.created - prev.created < miniChatDuration;
const numberOfChatsPerLoad = 50;

@observer
class View extends React.Component {
  @computed get chatIds() {
    return (
      chatStore.messagesByThreadId[this.props.match.params.buddy] || []
    ).map(m => m.id);
  }
  @computed get chatById() {
    return arrToMap(
      chatStore.messagesByThreadId[this.props.match.params.buddy] || [],
      'id',
      m => m,
    );
  }
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  state = {
    loadingRecent: false,
    loadingMore: false,
    editingText: '',
  };

  componentDidMount() {
    const noChat = !this.chatIds.length;

    if (noChat) this.loadRecent();
  }

  render() {
    const u = contactStore.getUCUser(this.props.match.params.buddy);
    return (
      <ChatsDetail
        hasMore={this.chatIds.length > 0 && !this.state.loadingMore}
        loadingRecent={this.state.loadingRecent}
        loadingMore={this.state.loadingMore}
        buddyName={u?.name}
        buddyId={this.props.match.params.buddy}
        chatIds={this.chatIds}
        resolveChat={this.resolveChat}
        resolveCreator={this.resolveCreator}
        editingText={this.state.editingText}
        setEditingText={this.setEditingText}
        submitEditingText={this.submitEditingText}
        loadMore={this.loadMore}
        acceptFile={this.acceptFile}
        rejectFile={this.rejectFile}
        pickFile={this.pickFile}
        back={routerStore.goToChatsRecent}
      />
    );
  }

  resolveChat = (id, index) => {
    const chat = this.chatById[id];
    const prev = this.chatById[this.chatIds[index - 1]] || {};
    const mini = isMiniChat(chat, prev);
    const created = chat.created && formatTime(chat.created);
    const file = chatStore.filesMap[chat.file];
    const text = stripTags(chat.text);

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
    Toast.error(`Failed to get recent chats, err: ${err?.message}`);
    console.error(err);
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
    Toast.error('Failed to get more chats');
    console.error(err);
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
    this.setState({ editingText: '' });
  };
  onSubmitEditingTextFailure = err => {
    Toast.error(`Failed to send the message, err: ${err?.message}`);
    console.error(err);
  };

  acceptFile = file => {
    this.context.uc
      .acceptFile(file.id)
      .then(blob => saveBlob(blob, file.name))
      .catch(this.onAcceptFileFailure);
  };
  onAcceptFileFailure = err => {
    Toast.error(`Failed to accept file, err: ${err?.message}`);
    console.error(err);
  };

  rejectFile = file => {
    this.context.uc.rejectFile(file.id).catch(this.onRejectFileFailure);
  };
  onRejectFileFailure = err => {
    Toast.error(`Failed to reject file, err: ${err?.message}`);
    console.error(err);
  };

  pickFile = () => {
    pickFile(this.sendFile);
  };
  sendFile = file => {
    const { uc } = this.context;
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
    Toast.error(`Failed to send file, err: ${err?.message}`);
    console.error(err);
  };
}

export default View;
