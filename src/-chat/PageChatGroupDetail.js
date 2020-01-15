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
        compact
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
        fabRender={this.renderChatInput}
        isChat={{
          ref: this.setViewRef,
          onContentSizeChange: this.onContentSizeChange,
          onScroll: this.onScroll,
        }}
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
    const creator = this.resolveBuddy(chat.creator);
    return {
      id,
      creatorId: creator.id,
      creatorName: creator.name || creator.id,
      creatorAvatar: creator.avatar,
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
        g.showError({ message: `Failed to get recent chats`, err });
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
        g.showError({ message: `Failed to get more chats`, err });
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
        this.setState({ editingText: `` });
      })
      .catch(err => {
        g.showError({ message: `Failed to send the message`, err });
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
        g.showError({ message: `Failed to leave the group`, err });
      });
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
