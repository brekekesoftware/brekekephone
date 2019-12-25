import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import uc from '../api/uc';
import g from '../global';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';
import pickFile from '../native/pickFile';
import saveBlob from '../native/saveBlob';
import Layout from '../shared/Layout';
import formatTime from '../utils/formatTime';
import { arrToMap } from '../utils/toMap';
import Message from './Message';
import m from './MiniChat';

@observer
class PageChatDetail extends React.Component {
  @computed get chatIds() {
    return (chatStore.messagesByThreadId[this.props.buddy] || []).map(
      m => m.id,
    );
  }
  @computed get chatById() {
    return arrToMap(
      chatStore.messagesByThreadId[this.props.buddy] || [],
      `id`,
      m => m,
    );
  }
  state = {
    loadingRecent: false,
    loadingMore: false,
    editingText: ``,
    showImage: ``,
    fileType: ``,
  };
  componentDidMount() {
    const noChat = !this.chatIds.length;
    if (noChat) this.loadRecent();
  }
  render() {
    const u = contactStore.getUCUser(this.props.buddy);
    return (
      <Layout
        footer={{
          actions: {
            selectFile: this.pickFile,
            text: this.state.editingText,
            setText: this.setEditingText,
            submitText: this.submitEditingText,
          },
          LayoutChat: true,
        }}
        header={{
          onBackBtnPress: g.goToPageChatRecents,
          title: u?.name,
        }}
        isChat={{
          ref: this.setViewRef,
          onContentSizeChange: this.onContentSizeChange,
          onScroll: this.onScroll,
        }}
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
  resolveChat = (id, index) => {
    const chat = this.chatById[id];
    const prev = this.chatById[this.chatIds[index - 1]] || {};
    const mini = m.isMiniChat(chat, prev);
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
  me = uc.me();
  resolveCreator = creator => {
    if (creator === this.me.id) {
      return this.me;
    }
    return contactStore.getUCUser(creator) || {};
  };
  loadRecent() {
    uc.getBuddyChats(this.props.buddy, {
      max: m.numberOfChatsPerLoad,
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
    const u = contactStore.getUCUser(this.props.buddy);
    chatStore.pushMessages(u.id, chats);
  };
  onLoadRecentFailure = err => {
    this.setState({ loadingRecent: false });
    g.showError({ err, message: `get recent chats` });
  };
  loadMore = () => {
    const oldestChat = this.chatById[this.chatIds[0]] || {};
    const oldestCreated = oldestChat.created || 0;
    const max = m.numberOfChatsPerLoad;
    const end = oldestCreated;
    const query = { max, end };
    const u = contactStore.getUCUser(this.props.buddy);
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
    const u = contactStore.getUCUser(this.props.buddy);
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
    uc.sendBuddyChatText(this.props.buddy, txt)
      .then(this.onSubmitEditingTextSuccess)
      .catch(this.onSubmitEditingTextFailure)
      .then(() => {
        this.submitting = false;
      });
  };
  onSubmitEditingTextSuccess = chat => {
    chatStore.pushMessages(this.props.buddy, chat);
    this.setState({ editingText: `` });
  };
  onSubmitEditingTextFailure = err => {
    g.showError({ err, message: `send the message` });
  };
  acceptFile = file => {
    uc.acceptFile(file.id)
      .then(blob => saveBlob(blob, file.name))
      .catch(this.onAcceptFileFailure);
  };
  onAcceptFileFailure = err => {
    g.showError({ err, message: `accept file` });
  };
  rejectFile = file => {
    uc.rejectFile(file.id).catch(this.onRejectFileFailure);
  };
  onRejectFileFailure = err => {
    g.showError({ err, message: `reject file` });
  };
  pickFile = () => {
    pickFile(this.sendFile);
  };
  blob = file => {
    const reader = new FileReader();
    const fileType = file.type.split(`/`)[0];
    reader.onload = async () => {
      const url = reader.result;
      this.setState({ showImage: url, fileType: fileType });
    };
    reader.readAsDataURL(file);
  };
  sendFile = file => {
    // TODO: fix error duplicate when upload 2 file.
    this.blob(file);
    const u = contactStore.getUCUser(this.props.buddy);
    uc.sendFile(u?.id, file)
      .then(this.onSendFileSuccess)
      .catch(this.onSendFileFailure);
  };
  onSendFileSuccess = res => {
    const buddyId = this.props.buddy;
    chatStore.pushMessages(buddyId, res.chat);
    chatStore.upsertFile(res.file);
  };
  onSendFileFailure = err => {
    g.showError({ err, message: `send file` });
  };
}

export default PageChatDetail;
