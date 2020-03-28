import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';

import uc from '../api/uc';
import ChatInput from '../Footer/ChatInput';
import g from '../global';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';
import intl, { intlDebug } from '../intl/intl';
import pickFile from '../native/pickFile';
import saveBlob from '../native/saveBlob';
import { StyleSheet, Text, TouchableOpacity, View } from '../Rn';
import Layout from '../shared/Layout';
import { arrToMap } from '../utils/toMap';
import { numberOfChatsPerLoad } from './config';
import MessageList from './MessageList';

const css = StyleSheet.create({
  LoadMore: {
    alignSelf: 'center',
    paddingBottom: 15,
    fontSize: g.fontSizeSmall,
    paddingHorizontal: 10,
  },
  LoadMore__btn: {
    color: g.colors.primary,
  },
  LoadMore__finished: {
    color: g.colors.warning,
  },
});

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
      'id',
      m => m,
    );
  }
  state = {
    loadingRecent: false,
    loadingMore: false,
    editingText: '',
    showImage: '',
    fileType: '',
    allMessagesLoaded: false,
    emojiTurnOn: false,
  };
  numberOfChatsPerLoadMore = numberOfChatsPerLoad;
  edittingTextEmoji = '';
  editingTextReplace = false;

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
        onEmojiTurnOn={() =>
          this.setState({ emojiTurnOn: !this.state.emojiTurnOn })
        }
        onSelectionChange={this.onSelectionChange}
        onTextChange={this.setEditingText}
        onTextSubmit={this.submitEditingText}
        openFilePicker={() => pickFile(this.sendFile)}
        text={this.state.editingText}
      />
    );
  };

  render() {
    const u = contactStore.getUCUser(this.props.buddy);
    const {
      allMessagesLoaded,
      fileType,
      loadingMore,
      loadingRecent,
      showImage,
    } = this.state;
    return (
      <Layout
        compact
        containerOnContentSizeChange={this.onContentSizeChange}
        containerOnScroll={this.onScroll}
        containerRef={this.setViewRef}
        fabRender={this.renderChatInput}
        onBack={g.backToPageChatRecents}
        title={u?.name}
      >
        {loadingRecent ? (
          <Text style={css.LoadMore}>{intl`Loading...`}</Text>
        ) : allMessagesLoaded ? (
          <Text center style={[css.LoadMore, css.LoadMore__finished]}>
            {this.chatIds.length === 0
              ? intl`There's currently no message in this thread`
              : intl`All messages in this thread have been loaded`}
          </Text>
        ) : (
          <TouchableOpacity
            onPress={loadingMore ? null : () => this.loadMore()}
          >
            <Text
              bold={!loadingMore}
              style={[css.LoadMore, !loadingMore && css.LoadMore__btn]}
            >
              {loadingMore ? intl`Loading...` : intl`Load more messages`}
            </Text>
          </TouchableOpacity>
        )}
        <MessageList
          acceptFile={this.acceptFile}
          fileType={fileType}
          list={chatStore.messagesByThreadId[this.props.buddy]}
          loadMore={this.loadMore}
          rejectFile={this.rejectFile}
          resolveChat={this.resolveChat}
          showImage={showImage}
        />
        {this.state.emojiTurnOn && (
          <View style={css.emojiTab}>
            <EmojiSelector
              category={Categories.emotion}
              columns={10}
              onEmojiSelected={emoji => this.emojiSelectFunc(emoji)}
              showHistory={true}
              showSearchBar={true}
              showSectionTitles={true}
              showTabs={true}
            />
          </View>
        )}
      </Layout>
    );
  }

  onSelectionChange = event => {
    const selection = event.nativeEvent.selection;
    this.editingTextReplace = false;
    if (selection.start !== selection.end) {
      this.edittingTextEmoji = this.state.editingText.substring(
        selection.start,
        selection.end,
      );
      this.editingTextReplace = true;
    } else {
      this.edittingTextEmoji = this.state.editingText.substring(
        0,
        selection.start,
      );
    }
  };
  emojiSelectFunc = emoji => {
    let newText = this.edittingTextEmoji.concat(emoji);
    if (this.state.editingText === '') {
      this.setState({ editingText: emoji });
      this.edittingTextEmoji = emoji;
    } else {
      if (!this.editingTextReplace) {
        this.setState({
          editingText: this.state.editingText.replace(
            this.edittingTextEmoji,
            newText,
          ),
        });
        this.edittingTextEmoji = this.edittingTextEmoji.concat(emoji);
      } else {
        this.setState({
          editingText: this.state.editingText.replace(
            this.edittingTextEmoji,
            emoji,
          ),
        });
        this.editingTextReplace = false;
        this.edittingTextEmoji = emoji;
      }
    }
  };

  setViewRef = ref => {
    this.view = ref;
  };
  _justMounted = true;
  _closeToBottom = true;
  onContentSizeChange = () => {
    if (!this.view) {
      return;
    }
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
    const file = chatStore.filesMap[chat.file];
    const text = chat.text;
    const creator = this.resolveCreator(chat.creator);
    return {
      id,
      creatorId: creator.id,
      creatorName: creator.name || creator.id,
      creatorAvatar: creator.avatar,
      text,
      file,
      created: chat.created,
      createdByMe: creator.id === this.me.id,
    };
  };
  me = uc.me();
  resolveCreator = creator => {
    if (creator === this.me.id) {
      return this.me;
    }
    return contactStore.getUCUser(creator) || {};
  };
  loadRecent = () => {
    this.setState({ loadingRecent: true });
    uc.getBuddyChats(this.props.buddy, {
      max: numberOfChatsPerLoad,
    })
      .then(chats => {
        const u = contactStore.getUCUser(this.props.buddy);
        chatStore.pushMessages(u.id, chats);
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
      })
      .then(() => {
        if (this.chatIds.length < numberOfChatsPerLoad) {
          this.setState({ allMessagesLoaded: true });
        }
      });
  };

  removeDuplicates = (array, key) => {
    let lookup = new Set();
    return array.filter(obj => !lookup.has(obj[key]) && lookup.add(obj[key]));
  };

  loadMore = () => {
    this.setState({ loadingMore: true });
    this.numberOfChatsPerLoadMore =
      this.numberOfChatsPerLoadMore + numberOfChatsPerLoad;
    const oldestChat = this.chatById[this.chatIds[0]] || {};
    const oldestCreated = oldestChat.created || 0;
    const max = this.numberOfChatsPerLoadMore;
    const end = oldestCreated;
    const query = { max, end };
    const u = contactStore.getUCUser(this.props.buddy);
    uc.getBuddyChats(u?.id, query)
      .then(chats => {
        const u = contactStore.getUCUser(this.props.buddy);
        chatStore.pushMessages(u.id, chats);
      })
      .catch(err => {
        g.showError({
          message: intlDebug`Failed to get more chats`,
          err,
        });
      })
      .then(() => {
        this.setState({ loadingMore: false });
      })
      .then(() => {
        const totalChatLoaded = this.removeDuplicates(
          chatStore.messagesByThreadId[this.props.buddy],
          'id',
        ).length;
        if (totalChatLoaded < this.numberOfChatsPerLoadMore) {
          this.setState({ allMessagesLoaded: true });
        }
      });
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
    this.setState({ editingText: '' });
  };
  onSubmitEditingTextFailure = err => {
    g.showError({
      message: intlDebug`Failed to send the message`,
      err,
    });
  };
  acceptFile = file => {
    uc.acceptFile(file.id)
      .then(blob => saveBlob(blob, file.name))
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
  sendFile = file => {
    const u = contactStore.getUCUser(this.props.buddy);
    uc.sendFile(u?.id, file)
      .then(this.onSendFileSuccess)
      .catch(this.onSendFileFailure);
  };
  onSendFileSuccess = res => {
    const buddyId = this.props.buddy;
    chatStore.upsertFile(res.file);
    chatStore.pushMessages(buddyId, res.chat);
  };
  onSendFileFailure = err => {
    g.showError({
      message: intlDebug`Failed to send file`,
      err,
    });
  };
}

export default PageChatDetail;
