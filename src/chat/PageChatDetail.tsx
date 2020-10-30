import { computed } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'
import { Platform, ScrollView, StyleSheet, View } from 'react-native'
import EmojiSelector, { Categories } from 'react-native-emoji-selector'

import uc from '../api/uc'
import ChatInput from '../Footer/ChatInput'
import chatStore from '../global/chatStore'
import contactStore from '../global/contactStore'
import Nav from '../global/Nav'
import RnAlert from '../global/RnAlert'
import intl, { intlDebug } from '../intl/intl'
import pickFile from '../native/pickFile'
import saveBlob from '../native/saveBlob'
import { RnText, RnTouchableOpacity } from '../Rn'
import Layout from '../shared/Layout'
import { arrToMap } from '../utils/toMap'
import g from '../variables'
import { numberOfChatsPerLoad } from './chatConfig'
import MessageList from './MessageList'

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
})

@observer
class PageChatDetail extends React.Component<{
  buddy: string
}> {
  @computed get chatIds() {
    return (chatStore.messagesByThreadId[this.props.buddy] || []).map(m => m.id)
  }
  @computed get chatById() {
    return arrToMap(
      chatStore.messagesByThreadId[this.props.buddy] || [],
      'id',
      m => m,
    )
  }
  state = {
    loadingRecent: false,
    loadingMore: false,
    editingText: '',
    blobFile: {
      url: '',
      fileType: '',
    },
    emojiTurnOn: false,
  }
  numberOfChatsPerLoadMore = numberOfChatsPerLoad
  edittingTextEmoji = ''
  editingTextReplace = false

  componentDidMount() {
    const noChat = !this.chatIds.length
    if (noChat) {
      this.loadRecent()
    } else {
      window.setTimeout(this.onContentSizeChange, 170)
    }
    const { buddy: id } = this.props
    chatStore.updateThreadConfig(id, false, {
      isUnread: false,
    })
  }
  componentDidUpdate() {
    const { buddy: id } = this.props
    if (chatStore.getThreadConfig(id).isUnread) {
      chatStore.updateThreadConfig(id, false, {
        isUnread: false,
      })
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
        openFileRnPicker={() => pickFile(this.sendFile)}
        text={this.state.editingText}
      />
    )
  }

  render() {
    const { buddy: id } = this.props
    const u = contactStore.getUCUser(id)
    const { allMessagesLoaded } = chatStore.getThreadConfig(id)
    const { loadingMore, loadingRecent } = this.state
    return (
      <Layout
        compact
        containerOnContentSizeChange={this.onContentSizeChange}
        containerOnScroll={this.onScroll}
        containerRef={this.setViewRef}
        fabRender={this.renderChatInput}
        onBack={Nav.backToPageChatRecents}
        title={u?.name}
      >
        {loadingRecent ? (
          <RnText style={css.LoadMore}>{intl`Loading...`}</RnText>
        ) : allMessagesLoaded ? (
          <RnText center style={[css.LoadMore, css.LoadMore__finished]}>
            {this.chatIds.length === 0
              ? intl`There's currently no message in this thread`
              : intl`All messages in this thread have been loaded`}
          </RnText>
        ) : (
          <RnTouchableOpacity
            onPress={loadingMore ? null : () => this.loadMore()}
          >
            <RnText
              bold={!loadingMore}
              style={[css.LoadMore, !loadingMore && css.LoadMore__btn]}
            >
              {loadingMore ? intl`Loading...` : intl`Load more messages`}
            </RnText>
          </RnTouchableOpacity>
        )}
        <MessageList
          acceptFile={this.acceptFile}
          list={chatStore.messagesByThreadId[this.props.buddy]}
          loadMore={this.loadMore}
          rejectFile={this.rejectFile}
          resolveChat={this.resolveChat}
        />
        {this.state.emojiTurnOn && (
          <View>
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
    )
  }

  onSelectionChange = event => {
    const selection = event.nativeEvent.selection
    this.editingTextReplace = false
    if (selection.start !== selection.end) {
      this.edittingTextEmoji = this.state.editingText.substring(
        selection.start,
        selection.end,
      )
      this.editingTextReplace = true
    } else {
      this.edittingTextEmoji = this.state.editingText.substring(
        0,
        selection.start,
      )
    }
  }
  emojiSelectFunc = emoji => {
    let newText = this.edittingTextEmoji.concat(emoji)
    if (this.state.editingText === '') {
      this.setState({ editingText: emoji })
      this.edittingTextEmoji = emoji
    } else {
      if (!this.editingTextReplace) {
        this.setState({
          editingText: this.state.editingText.replace(
            this.edittingTextEmoji,
            newText,
          ),
        })
        this.edittingTextEmoji = this.edittingTextEmoji.concat(emoji)
      } else {
        this.setState({
          editingText: this.state.editingText.replace(
            this.edittingTextEmoji,
            emoji,
          ),
        })
        this.editingTextReplace = false
        this.edittingTextEmoji = emoji
      }
    }
  }

  view?: ScrollView
  setViewRef = ref => {
    this.view = ref
  }
  _justMounted = true
  _closeToBottom = true
  onContentSizeChange = () => {
    if (!this.view) {
      return
    }
    if (this._closeToBottom) {
      this.view?.scrollToEnd({
        animated: !this._justMounted,
      })
      if (this._justMounted) {
        this._justMounted = false
      }
    }
  }
  onScroll = ev => {
    ev = ev.nativeEvent
    const layoutSize = ev.layoutMeasurement
    const layoutHeight = layoutSize.height
    const contentOffset = ev.contentOffset
    const contentSize = ev.contentSize
    const contentHeight = contentSize.height
    const paddingToBottom = 20
    this._closeToBottom =
      layoutHeight + contentOffset.y >= contentHeight - paddingToBottom
  }
  resolveChat = id => {
    const chat = this.chatById[id]
    const file = chatStore.filesMap[chat.file]
    const text = chat.text
    const creator = this.resolveCreator(chat.creator)
    return {
      id,
      creatorId: creator.id,
      creatorName: creator.name || creator.id,
      creatorAvatar: creator.avatar,
      text,
      file,
      created: chat.created,
      createdByMe: creator.id === this.me.id,
    }
  }
  me = uc.me()
  resolveCreator = creator => {
    if (creator === this.me.id) {
      return this.me
    }
    return contactStore.getUCUser(creator) || {}
  }
  loadRecent = () => {
    this.setState({ loadingRecent: true })
    const { buddy: id } = this.props
    uc.getBuddyChats(id, {
      max: numberOfChatsPerLoad,
    })
      .then(chats => {
        chatStore.pushMessages(id, chats)
        window.setTimeout(this.onContentSizeChange, 170)
      })
      .catch(err => {
        RnAlert.error({
          message: intlDebug`Failed to get recent chats`,
          err,
        })
      })
      .then(() => {
        this.setState({ loadingRecent: false })
      })
  }

  loadMore = () => {
    this.setState({ loadingMore: true })
    this.numberOfChatsPerLoadMore =
      this.numberOfChatsPerLoadMore + numberOfChatsPerLoad
    const oldestChat = this.chatById[this.chatIds[0]] || {}
    const oldestCreated = oldestChat.created || 0
    const max = this.numberOfChatsPerLoadMore
    const end = oldestCreated
    const query = { max, end }
    const { buddy: id } = this.props
    uc.getBuddyChats(id, query)
      .then(chats => {
        chatStore.pushMessages(id, chats)
      })
      .catch(err => {
        RnAlert.error({
          message: intlDebug`Failed to get more chats`,
          err,
        })
      })
      .then(() => {
        this.setState({ loadingMore: false })
      })
      .then(() => {
        const { buddy: id } = this.props
        const totalChatLoaded = chatStore.messagesByThreadId[id]?.length || 0
        if (totalChatLoaded < this.numberOfChatsPerLoadMore) {
          chatStore.updateThreadConfig(id, false, {
            allMessagesLoaded: true,
          })
        }
      })
  }

  setEditingText = editingText => {
    this.setState({ editingText })
  }
  submitting = false
  submitEditingText = () => {
    const txt = this.state.editingText.trim()
    if (!txt || this.submitting) {
      return
    }
    this.submitting = true
    //
    uc.sendBuddyChatText(this.props.buddy, txt)
      .then(this.onSubmitEditingTextSuccess)
      .catch(this.onSubmitEditingTextFailure)
      .then(() => {
        this.submitting = false
      })
  }
  onSubmitEditingTextSuccess = chat => {
    chatStore.pushMessages(this.props.buddy, chat)
    this.setState({ editingText: '' })
  }
  onSubmitEditingTextFailure = err => {
    RnAlert.error({
      message: intlDebug`Failed to send the message`,
      err,
    })
  }
  acceptFile = file => {
    uc.acceptFile(file.id)
      .then(blob => this.onAcceptFileSuccess(blob, file))
      .catch(this.onAcceptFileFailure)
  }

  onAcceptFileSuccess = (blob, file) => {
    const type = ['PNG', 'JPG', 'JPEG', 'GIF']
    const fileType = type.includes(file.name.split('.').pop().toUpperCase())
      ? 'image'
      : 'other'
    const reader = new FileReader()
    reader.onload = async event => {
      const url = event.target?.result
      await Object.assign(chatStore.filesMap[file.id], {
        url: url,
        fileType: fileType,
      })
    }

    reader.readAsDataURL(blob)

    saveBlob(blob, file.name)
  }
  onAcceptFileFailure = err => {
    RnAlert.error({
      message: intlDebug`Failed to accept file`,
      err,
    })
  }
  rejectFile = file => {
    uc.rejectFile(file).catch(this.onRejectFileFailure)
  }
  onRejectFileFailure = err => {
    RnAlert.error({
      message: intlDebug`Failed to reject file`,
      err,
    })
  }

  readFile = file => {
    if (Platform.OS === 'web') {
      const reader = new FileReader()

      const fileType = file.type ? file.type.split('/')[0] : ''
      reader.onload = async event => {
        const url = event.target?.result
        this.setState({ blobFile: { url: url, fileType: fileType } })
      }
      reader.readAsDataURL(file)
    } else {
      const type = ['PNG', 'JPG', 'JPEG', 'GIF']
      const fileType = type.includes(file.name.split('.').pop().toUpperCase())
        ? 'image'
        : 'other'
      this.setState({ blobFile: { url: file.uri, fileType: fileType } })
    }
  }

  sendFile = file => {
    this.readFile(file)
    const u = contactStore.getUCUser(this.props.buddy)
    uc.sendFile(u?.id, file)
      .then(this.onSendFileSuccess)
      .catch(this.onSendFileFailure)
  }
  onSendFileSuccess = res => {
    const buddyId = this.props.buddy
    Object.assign(res.file, this.state.blobFile)
    chatStore.upsertFile(res.file)
    chatStore.pushMessages(buddyId, res.chat)
  }
  onSendFileFailure = err => {
    RnAlert.error({
      message: intlDebug`Failed to send file`,
      err,
    })
  }
}

export default PageChatDetail
