import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import uc from '../api/uc';
import ChatInput from '../Footer/ChatInput';
import g from '../global';
import callStore from '../global/callStore';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';
import intl, { intlDebug } from '../intl/intl';
import pickFile from '../native/pickFile';
import saveBlob from '../native/saveBlob';
import Layout from '../shared/Layout';
import { arrToMap } from '../utils/toMap';
import { numberOfChatsPerLoad } from './config';
import MessageList from './MessageList';

@observer
class PageChatGroupDetail extends React.Component {
  @computed get chatIds() {
    return (chatStore.messagesByThreadId[this.props.groupId] || []).map(
      m => m.id,
    );
  }
  @computed get chatById() {
    return arrToMap(
      chatStore.messagesByThreadId[this.props.groupId] || [],
      'id',
      m => m,
    );
  }

  state = {
    target: '',
    loadingRecent: false,
    loadingMore: false,
    editingText: '',
  };
  componentDidMount() {
    const noChat = !this.chatIds.length;
    if (noChat) {
      this.loadRecent();
    } else {
      setTimeout(this.onContentSizeChange, 170);
    }
  }

  renderChatInput = () => {
    return (
      <ChatInput
        onTextChange={this.setEditingText}
        onTextSubmit={this.submitEditingText}
        openFilePicker={() => pickFile(this.sendFile)}
        text={this.state.editingText}
      />
    );
  };
  render() {
    const gr = chatStore.getGroup(this.props.groupId);
    return (
      <Layout
        compact
        containerOnContentSizeChange={this.onContentSizeChange}
        containerOnScroll={this.onScroll}
        containerRef={this.setViewRef}
        dropdown={[
          {
            label: intl`Invite more people`,
            onPress: this.invite,
          },
          {
            label: intl`Start voice call`,
            onPress: this.callVoiceConference,
          },
          {
            label: intl`Start video call`,
            onPress: this.callVideoConference,
          },
          {
            label: intl`Leave group`,
            onPress: this.leave,
            danger: true,
          },
        ]}
        fabRender={this.renderChatInput}
        onBack={g.backToPageChatRecents}
        title={gr?.name}
      >
        <MessageList
          acceptFile={this.acceptFile}
          fileType={this.state.fileType}
          isGroupChat
          list={chatStore.messagesByThreadId[this.props.groupId]}
          loadMore={this.loadMore}
          rejectFile={this.rejectFile}
          resolveChat={this.resolveChat}
          showImage={this.state.showImage}
        />
      </Layout>
    );
  }

  setViewRef = ref => {
    this.view = ref;
  };

  _justMounted = true;
  _closeToBottom = true;
  onContentSizeChange = () => {
    if (this._closeToBottom) {
      this.view.scrollToEnd({
        animated: !this._justMounted,
      });
      if (this._justMounted) {
        this._justMounted = false;
      }
    }
  };
  onScroll = ev => {
    ev = ev.nativeEvent;
    const layoutSize = ev.layoutMeasurement;
    const layoutHeight = layoutSize.height;
    const contentOffset = ev.contentOffset;
    const contentSize = ev.contentSize;
    const contentHeight = contentSize.height;
    const paddingToBottom = 20;
    this._closeToBottom =
      layoutHeight + contentOffset.y >= contentHeight - paddingToBottom;
  };

  me = uc.me();
  resolveBuddy = creator => {
    if (creator === this.me.id) return this.me;
    return contactStore.getUCUser(creator) || {};
  };
  resolveChat = (id, index) => {
    const chat = this.chatById[id];
    const text = chat.text;
    const file = chatStore.filesMap[chat.file];
    const creator = this.resolveBuddy(chat.creator);
    return {
      id,
      creatorId: creator.id,
      creatorName: creator.name || creator.id,
      creatorAvatar: creator.avatar,
      file,
      text,
      created: chat.created,
      createdByMe: creator.id === this.me.id,
    };
  };

  loadRecent() {
    this.setState({ loadingRecent: true });
    uc.getGroupChats(this.props.groupId, {
      max: numberOfChatsPerLoad,
    })
      .then(chats => {
        chatStore.pushMessages(this.props.groupId, chats);
        setTimeout(this.onContentSizeChange, 170);
      })
      .catch(err => {
        g.showError({
          message: intlDebug`Failed to get recent chats`,
          err,
        });
      })
      .then(() => {
        this.setState({ loadingRecent: false });
      });
  }

  loadMore = () => {
    this.setState({ loadingMore: true });
    const oldestChat = this.chatById[this.chatIds[0]] || {};
    const oldestCreated = oldestChat.created || 0;
    const max = numberOfChatsPerLoad;
    const end = oldestCreated;
    const query = {
      max,
      end,
    };
    uc.getGroupChats(this.props.groupId, query)
      .then(chats => {
        chatStore.pushMessages(this.props.groupId, chats);
      })
      .catch(err => {
        g.showError({
          message: intlDebug`Failed to get more chats`,
          err,
        });
      })
      .then(() => {
        this.setState({ loadingMore: false });
      });
  };

  setEditingText = editingText => {
    this.setState({
      editingText,
    });
  };

  submitting = false;
  submitEditingText = () => {
    if (this.submitting) {
      return;
    }
    const txt = this.state.editingText.trim();
    if (!txt) {
      return;
    }
    this.submitting = true;
    uc.sendGroupChatText(this.props.groupId, txt)
      .then(chat => {
        chatStore.pushMessages(this.props.groupId, [chat]);
        this.setState({ editingText: '' });
      })
      .catch(err => {
        g.showError({
          message: intlDebug`Failed to send the message`,
          err,
        });
      })
      .then(() => {
        this.submitting = false;
      });
  };

  leave = () => {
    uc.leaveChatGroup(this.props.groupId)
      .then(() => {
        chatStore.removeGroup(this.props.groupId);
        g.goToPageChatRecents();
      })
      .catch(err => {
        g.showError({
          message: intlDebug`Failed to leave the group`,
          err,
        });
      });
  };

  invite = () => {
    g.goToPageChatGroupInvite({ groupId: this.props.groupId });
  };
  call = (target, bVideoEnabled) => {
    callStore.startCall(target, {
      videoEnabled: bVideoEnabled,
    });
  };
  callVoiceConference = () => {
    let target = this.props.groupId;
    if (!target.startsWith('uc')) {
      target = 'uc' + this.props.groupId;
    }
    this.call(target, false);
  };
  callVideoConference = () => {
    let target = this.props.groupId;
    if (!target.startsWith('uc')) {
      target = 'uc' + this.props.groupId;
    }
    this.call(target, true);
  };

  sendFile = file => {
    const groupId = this.props.groupId;
    uc.sendFiles(groupId, file)
      .then(this.onSendFileSuccess)
      .catch(this.onSendFileFailure);
  };
  onSendFileSuccess = res => {
    const groupId = this.props.groupId;
    chatStore.upsertFile(res.file);
    chatStore.pushMessages(groupId, res.chat);
  };
  onSendFileFailure = err => {
    g.showError({
      message: intlDebug`Failed to send file`,
      err,
    });
  };
  acceptFile = file => {
    uc.acceptFile(file.id)
      .then(blob => {
        saveBlob(blob, file.name);
      })
      .catch(this.onAcceptFileFailure);
  };
  onAcceptFileFailure = err => {
    g.showError({
      message: intlDebug`Failed to accept file`,
      err,
    });
  };
  rejectFile = file => {
    uc.rejectFile(file).catch(this.onRejectFileFailure);
  };
  onRejectFileFailure = err => {
    g.showError({
      message: intlDebug`Failed to reject file`,
      err,
    });
  };
}

export default PageChatGroupDetail;
