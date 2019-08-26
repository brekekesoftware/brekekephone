import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';

import ChatsDetail from '../../components-Chats/Chat-Detail';
import * as routerUtils from '../../mobx/routerStore';
import toast from '../../nativeModules/toast';
import stripTags from '../../utils/stripTags';
import pickFile from './pickFile';
import saveBlob from './saveBlob';

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
@createModelView(
  getter => (state, props) => {
    const duplicatedMap = {};

    return {
      buddy: getter.ucUsers.detailMapById(state)[props.match.params.buddy],

      chatIds: (
        getter.buddyChats.idsMapByBuddy(state)[props.match.params.buddy] || []
      ).filter(id => {
        if (duplicatedMap[id]) {
          return false;
        }

        duplicatedMap[id] = true;
        return true;
      }),

      chatById: getter.buddyChats.detailMapById(state),
      ucUserById: getter.ucUsers.detailMapById(state),
      fileById: getter.chatFiles.byId(state),
    };
  },
  action => emit => ({
    appendChats(buddy, chats) {
      emit(action.buddyChats.appendByBuddy(buddy, chats));
    },

    prependChats(buddy, chats) {
      emit(action.buddyChats.prependByBuddy(buddy, chats));
    },

    createChatFile(file) {
      emit(action.chatFiles.create(file));
    },
  }),
)
@observer
class View extends React.Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  static defaultProps = {
    buddy: {},
    chatIds: [],
    chatById: {},
    ucUserById: {},
    fileById: {},
  };

  state = {
    loadingRecent: false,
    loadingMore: false,
    editingText: '',
  };

  componentDidMount() {
    const { chatIds } = this.props;

    const noChat = !chatIds.length;

    if (noChat) this.loadRecent();
  }

  render = () => (
    <ChatsDetail
      hasMore={this.props.chatIds.length > 0 && !this.state.loadingMore}
      loadingRecent={this.state.loadingRecent}
      loadingMore={this.state.loadingMore}
      buddyName={this.props.buddy.name}
      buddyId={this.props.buddy.id}
      chatIds={this.props.chatIds}
      resolveChat={this.resolveChat}
      resolveCreator={this.resolveCreator}
      editingText={this.state.editingText}
      setEditingText={this.setEditingText}
      submitEditingText={this.submitEditingText}
      loadMore={this.loadMore}
      acceptFile={this.acceptFile}
      rejectFile={this.rejectFile}
      pickFile={this.pickFile}
      back={routerUtils.goToChatsRecent}
    />
  );

  resolveChat = (id, index) => {
    const { chatIds, chatById, fileById } = this.props;

    const chat = chatById[id];
    const prev = chatById[chatIds[index - 1]] || {};
    const mini = isMiniChat(chat, prev);
    const created = chat.created && formatTime(chat.created);
    const file = fileById[chat.file];
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
    const { ucUserById } = this.props;
    return ucUserById[creator] || {};
  };

  loadRecent() {
    this.context.uc
      .getBuddyChats(this.props.buddy.id, { max: numberOfChatsPerLoad })
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

    const { buddy, appendChats } = this.props;

    appendChats(buddy.id, chats);
  };
  onLoadRecentFailure = err => {
    this.setState({ loadingRecent: false });
    toast.error(`Failed to get recent chats, err: ${err?.message}`);
    console.error(err);
  };

  loadMore = () => {
    const { buddy, chatIds, chatById } = this.props;

    const oldestChat = chatById[chatIds[0]] || {};
    const oldestCreated = oldestChat.created || 0;
    const max = numberOfChatsPerLoad;
    const end = oldestCreated;

    const query = { max, end };

    const { uc } = this.context;

    uc.getBuddyChats(buddy.id, query)
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

    const { buddy, prependChats } = this.props;

    prependChats(buddy.id, chats);
  };

  onLoadMoreFailure = err => {
    this.setState({
      loadingMore: false,
    });
    toast.error('Failed to get more chats');
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
      .sendBuddyChatText(this.props.buddy.id, txt)
      .then(this.onSubmitEditingTextSuccess)
      .catch(this.onSubmitEditingTextFailure)
      .then(() => {
        this.submitting = false;
      });
  };
  onSubmitEditingTextSuccess = chat => {
    this.props.appendChats(this.props.buddy.id, [chat]);
    this.setState({ editingText: '' });
  };
  onSubmitEditingTextFailure = err => {
    toast.error(`Failed to send the message, err: ${err?.message}`);
    console.error(err);
  };

  acceptFile = file => {
    this.context.uc
      .acceptFile(file.id)
      .then(blob => saveBlob(blob, file.name))
      .catch(this.onAcceptFileFailure);
  };
  onAcceptFileFailure = err => {
    toast.error(`Failed to accept file, err: ${err?.message}`);
    console.error(err);
  };

  rejectFile = file => {
    this.context.uc.rejectFile(file.id).catch(this.onRejectFileFailure);
  };
  onRejectFileFailure = err => {
    toast.error(`Failed to reject file, err: ${err?.message}`);
    console.error(err);
  };

  pickFile = () => {
    pickFile(this.sendFile);
  };
  sendFile = file => {
    const { uc } = this.context;
    const { buddy } = this.props;
    uc.sendFile(buddy.id, file)
      .then(this.onSendFileSuccess)
      .catch(this.onSendFileFailure);
  };
  onSendFileSuccess = res => {
    const buddyId = this.props.buddy.id;
    this.props.appendChats(buddyId, [res.chat]);
    this.props.createChatFile(res.file);
  };
  onSendFileFailure = err => {
    toast.error(`Failed to send file, err: ${err?.message}`);
    console.error(err);
  };
}

export default View;
