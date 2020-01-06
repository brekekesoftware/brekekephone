import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import ChatInput from '../-/Footer/ChatInput';
import sip from '../api/sip';
import uc from '../api/uc';
import g from '../global';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';
import Layout from '../shared/Layout';
import formatTime from '../utils/formatTime';
import { arrToMap } from '../utils/toMap';
import Message from './Message';
import m from './MiniChat';

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
      `id`,
      m => m,
    );
  }

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

  renderChatInput = () => {
    return (
      <ChatInput
        onTextChange={this.setEditingText}
        onTextSubmit={this.submitEditingText}
        openFilePicker={() => {
          /* TODO implement send file chat group here */
        }}
        text={this.state.editingText}
      />
    );
  };
  render() {
    const gr = chatStore.getGroup(this.props.groupId);
    return (
      <Layout
        compact={true}
        dropdown={[
          {
            label: `Invite more people`,
            onPress: this.invite,
          },
          {
            label: `Start voice call`,
            onPress: this.callVideoConference,
          },
          {
            label: `Start video call`,
            onPress: this.callVoiceConference,
          },
          {
            label: `Leave group`,
            onPress: this.leave,
            danger: true,
          },
        ]}
        isChat={{
          ref: this.setViewRef,
          onContentSizeChange: this.onContentSizeChange,
          onScroll: this.onScroll,
        }}
        onBack={g.goToPageChatRecents}
        title={gr?.name}
      >
        {this.chatIds.map((id, index) => (
          <Message
            hasMore={this.chatIds.length > 0 && !this.state.loadingMore}
            key={index}
            last={index === this.chatIds.length - 1}
            loadingMore={this.state.loadingMore}
            {...this.resolveChat(id, index)}
            acceptFile={this.acceptFile}
            fileType={this.state.fileType}
            loadMore={this.loadMore}
            rejectFile={this.rejectFile}
            showImage={this.state.showImage}
          />
        ))}
      </Layout>
    );
  }

  setViewRef = ref => {
    this.view = ref;
  };
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
    const prev = this.chatById[this.chatIds[index - 1]] || {};
    const mini = m.isMiniChat(chat, prev);
    const created = formatTime(chat.created);
    const text = chat.text;
    if (mini) {
      return {
        mini: true,
        created,
        text,
      };
    }
    const creator = this.resolveBuddy(chat.creator);
    const creatorName =
      !creator.name || creator.name.length === 0 ? creator.id : creator.name;
    return {
      creatorName: creatorName,
      creatorAvatar: creator.avatar,
      text,
      created,
    };
  };

  loadRecent() {
    const max = m.numberOfChatsPerLoad;
    const query = {
      max,
    };
    uc.getGroupChats(this.props.groupId, query)
      .then(this.onLoadRecentSuccess)
      .catch(this.onLoadRecentFailure);
    this.setState({
      loadingRecent: true,
    });
  }
  onLoadRecentSuccess = chats => {
    chatStore.pushMessages(this.props.groupId, chats.reverse());
    this.setState({
      loadingRecent: false,
    });
  };
  onLoadRecentFailure = err => {
    this.setState({
      loadingRecent: false,
    });
    g.showError({ message: `Failed to get recent chats`, err });
  };

  loadMore = () => {
    const oldestChat = this.chatById[this.chatIds[0]] || {};
    const oldestCreated = oldestChat.created || 0;
    const max = m.numberOfChatsPerLoad;
    const end = oldestCreated;
    const query = {
      max,
      end,
    };
    uc.getGroupChats(this.props.groupId, query)
      .then(this.onLoadMoreSuccess)
      .catch(this.onLoadMoreFailure);
    this.setState({
      loadingMore: true,
    });
  };
  onLoadMoreSuccess = chats => {
    chatStore.pushMessages(this.props.groupId, chats.reverse());
    this.setState({
      loadingMore: false,
    });
  };
  onLoadMoreFailure = err => {
    g.showError({ message: `Failed to get more chats`, err });
    this.setState({
      loadingMore: false,
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
      .then(this.onSubmitEditingTextSuccess)
      .catch(this.onSubmitEditingTextFailure)
      .then(() => {
        this.submitting = false;
      });
  };
  onSubmitEditingTextSuccess = chat => {
    chatStore.pushMessages(this.props.groupId, [chat]);
    this.setState({
      editingText: ``,
    });
  };
  onSubmitEditingTextFailure = err => {
    g.showError({ message: `Failed to send the message`, err });
  };

  leave = () => {
    uc.leaveChatGroup(this.props.groupId)
      .then(this.onLeaveSuccess)
      .catch(this.onLeaveFailure);
  };
  onLeaveSuccess = () => {
    chatStore.removeGroup(this.props.groupId);
    g.goToPageChatRecents();
  };
  onLeaveFailure = err => {
    g.showError({ message: `Failed to leave the group`, err });
  };

  invite = () => {
    g.goToPageChatGroupInvite({ groupId: this.props.groupId });
  };
  call = (target, bVideoEnabled) => {
    sip.createSession(target, {
      videoEnabled: bVideoEnabled,
    });
    g.goToPageCallManage();
  };
  callVoiceConference = () => {
    let target = this.props.groupId;
    if (!target.startsWith(`uc`)) {
      target = `uc` + this.props.groupId;
    }
    this.call(target, false);
  };
  callVideoConference = () => {
    let target = this.props.groupId;
    if (!target.startsWith(`uc`)) {
      target = `uc` + this.props.groupId;
    }
    this.call(target, true);
  };
}

export default PageChatGroupDetail;
