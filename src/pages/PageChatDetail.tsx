import { computed } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  TextInputSelectionChangeEventData,
  View,
} from 'react-native'
import EmojiSelector, { Categories } from 'react-native-emoji-selector'

import { uc } from '../api/uc'
import { numberOfChatsPerLoad } from '../components/chatConfig'
import { MessageList } from '../components/ChatMessageList'
import { ChatInput } from '../components/FooterChatInput'
import { Layout } from '../components/Layout'
import { RnText, RnTouchableOpacity } from '../components/Rn'
import { v } from '../components/variables'
import { ChatFile, ChatMessage, chatStore } from '../stores/chatStore'
import { contactStore, getPartyName } from '../stores/contactStore'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { formatFileType } from '../utils/formatFileType'
import { pickFile } from '../utils/pickFile'
import { saveBlob } from '../utils/saveBlob'
import { saveBlobFile } from '../utils/saveBlob.web'
import { arrToMap } from '../utils/toMap'

const css = StyleSheet.create({
  LoadMore: {
    alignSelf: 'center',
    paddingBottom: 15,
    fontSize: v.fontSizeSmall,
    paddingHorizontal: 10,
  },
  LoadMore__btn: {
    color: v.colors.primary,
  },
  LoadMore__finished: {
    color: v.colors.warning,
  },
})

@observer
export class PageChatDetail extends Component<{
  buddy: string
}> {
  @computed get chatIds() {
    return (chatStore.messagesByThreadId[this.props.buddy] || []).map(m => m.id)
  }
  @computed get chatById() {
    return arrToMap(
      chatStore.messagesByThreadId[this.props.buddy] || [],
      'id',
      (m: ChatMessage) => m,
    ) as { [k: string]: ChatMessage }
  }
  state = {
    loadingRecent: false,
    loadingMore: false,
    editingText: '',
    blobFile: {
      url: '',
      fileType: '',
    },
    topic_id: '',
    emojiTurnOn: false,
    blobVideo: undefined,
  }
  numberOfChatsPerLoadMore = numberOfChatsPerLoad
  edittingTextEmoji = ''
  editingTextReplace = false

  componentDidMount() {
    this.loadRecent()
    const { buddy: id } = this.props
    uc.readUnreadChats(id)
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
  componentWillUnmount() {
    if (Platform.OS === 'web') {
      const { topic_id } = this.state
      topic_id && caches.delete(topic_id)
    }
  }
  renderChatInput = () => {
    return (
      <ChatInput
        onEmojiTurnOn={() =>
          this.setState({ emojiTurnOn: !this.state.emojiTurnOn }, () => {
            this.view?.scrollToEnd()
          })
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
    const { allMessagesLoaded, isUnread } = chatStore.getThreadConfig(id)
    const { loadingMore, loadingRecent, emojiTurnOn } = this.state
    const listMessage = chatStore.messagesByThreadId[this.props.buddy]
    const incomingMessage = listMessage
      ? listMessage[listMessage.length - 1]?.text
      : undefined
    const isShowToastMessage = emojiTurnOn && isUnread

    return (
      <Layout
        compact
        containerOnContentSizeChange={this.onContentSizeChange}
        containerOnScroll={this.onScroll}
        containerRef={this.setViewRef}
        fabRender={this.renderChatInput}
        onBack={Nav().backToPageChatRecents}
        title={getPartyName(id)}
        isShowToastMessage={isShowToastMessage}
        incomingMessage={incomingMessage}
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
            onPress={loadingMore ? undefined : () => this.loadMore()}
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
          list={listMessage}
          loadMore={this.loadMore}
          rejectFile={this.rejectFile}
          resolveChat={this.resolveChat}
        />
        {emojiTurnOn && (
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
        {/* <video src={this.state.blobVideo}id='video' controls width='320' height='240'/> */}
      </Layout>
    )
  }

  onSelectionChange = (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => {
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
  emojiSelectFunc = (emoji: string) => {
    const newText = this.edittingTextEmoji.concat(emoji)
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
  setViewRef = (ref: ScrollView) => {
    this.view = ref
  }

  private justMounted = true
  private closeToBottom = true
  private currentScrollPosition = 0
  private isLoadingMore = false

  onContentSizeChange = (newWidth?: number, newHeight?: number) => {
    if (!this.view || this.state.emojiTurnOn) {
      return
    }
    if (this.closeToBottom) {
      this.view?.scrollToEnd({
        animated: !this.justMounted,
      })
      if (this.justMounted) {
        this.justMounted = false
      }
    }
    // scroll to last position after load more
    if (newHeight && this.isLoadingMore) {
      this.isLoadingMore = false
      this.view?.scrollTo({
        y: newHeight - this.currentScrollPosition,
        animated: false,
      })
    }
  }

  onScroll = (ev: NativeSyntheticEvent<NativeScrollEvent>) => {
    const layoutSize = ev.nativeEvent.layoutMeasurement
    const layoutHeight = layoutSize.height
    const contentOffset = ev.nativeEvent.contentOffset
    const contentSize = ev.nativeEvent.contentSize
    const contentHeight = contentSize.height
    const paddingToBottom = 20
    this.closeToBottom =
      layoutHeight + contentOffset.y >= contentHeight - paddingToBottom
    this.currentScrollPosition = contentHeight
  }

  resolveChat = (id: string) => {
    const chat = this.chatById[id] as ChatMessage
    const file = chatStore.getFileById(chat.file)
    const text = chat.text
    const creator = this.resolveCreator(chat.creator)
    return {
      id,
      creatorId: creator.id,
      creatorName: creator.name || creator.id,
      creatorAvatar: creator.avatar,
      text,
      type: chat.type,
      file,
      created: chat.created,
      createdByMe: creator.id === this.me.id,
    }
  }
  me = uc.me()
  resolveCreator = (creator: string) => {
    if (creator === this.me.id) {
      return this.me
    }
    return contactStore.getUcUserById(creator) || {}
  }
  loadRecent = () => {
    this.setState({ loadingRecent: true })
    const { buddy: id } = this.props
    uc.getBuddyChats(id, {
      max: numberOfChatsPerLoad,
    })
      .then(chats => {
        chatStore.pushMessages(id, chats)
        BackgroundTimer.setTimeout(this.onContentSizeChange, 300)
      })
      .catch((err: Error) => {
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
    this.isLoadingMore = true
    this.setState({ loadingMore: true })
    this.numberOfChatsPerLoadMore =
      this.numberOfChatsPerLoadMore + numberOfChatsPerLoad
    const oldestChat = (this.chatById[this.chatIds[0]] || {}) as ChatMessage
    const oldestCreated = oldestChat.created || 0
    const max = this.numberOfChatsPerLoadMore
    const end = oldestCreated
    const query = { max, end }
    const { buddy: id } = this.props
    uc.getBuddyChats(id, query)
      .then(chats => {
        chatStore.pushMessages(id, chats)
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to get more chats`,
          err,
        })
      })
      .then(() => {
        this.setState({ loadingMore: false })
      })
      .then(() => {
        const { buddy } = this.props
        const totalChatLoaded = chatStore.messagesByThreadId[buddy]?.length || 0
        if (totalChatLoaded < this.numberOfChatsPerLoadMore) {
          chatStore.updateThreadConfig(buddy, false, {
            allMessagesLoaded: true,
          })
        }
      })
  }

  setEditingText = (editingText: string) => {
    this.setState({ editingText })
  }
  submitting = false
  submitEditingText = () => {
    const txt = this.state.editingText.trim()
    if (!txt || this.submitting) {
      return
    }
    if (this.state.emojiTurnOn) {
      this.setState({ emojiTurnOn: !this.state.emojiTurnOn })
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
  onSubmitEditingTextSuccess = (chat: unknown) => {
    chatStore.pushMessages(this.props.buddy, chat as ChatMessage)
    this.setState({ editingText: '' })
  }
  onSubmitEditingTextFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to send the message`,
      err,
    })
  }
  acceptFile = (file: { id: string; name: string; fileType: string }) => {
    uc.acceptFile(file.id)
      .then(blob => this.onAcceptFileSuccess(blob as Blob, file))
      .catch(this.onAcceptFileFailure)
  }

  onAcceptFileSuccess = (blob: Blob, file: { id: string; name: string }) => {
    const fileType = formatFileType(file.name)
    const reader = new FileReader()
    reader.onload = async event => {
      const url = event.target?.result
      Object.assign(chatStore.getFileById(file.id), {
        url,
        fileType,
      })
    }

    reader.readAsDataURL(blob)

    saveBlob(blob, file.name)
  }
  onAcceptFileFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to accept file`,
      err,
    })
  }
  rejectFile = (file: object) => {
    uc.rejectFile(file).catch(this.onRejectFileFailure)
  }
  onRejectFileFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to reject file`,
      err,
    })
  }

  readFile = (file: { type: string; name: string; uri: string }) => {
    const fileType = formatFileType(file.name)
    this.setState({ blobFile: { url: file.uri, fileType } })
  }
  handleSaveBlobFileWeb = async (
    data: Blob,
    file: ChatFile,
    chat: ChatMessage,
  ) => {
    const buddyId = this.props.buddy
    try {
      const url = await saveBlobFile(
        file.id,
        file.topic_id,
        file.fileType,
        data,
      )
      Object.assign(file, { url })
      chatStore.upsertFile(file)
      chatStore.pushMessages(buddyId, chat)
    } catch (err) {
      console.error(`PageChatDetail.handleSaveBlobFileWeb err: ${err}`)
    }
  }
  sendFile = (file: { type: string; name: string; uri: string }) => {
    this.readFile(file)
    const u = contactStore.getUcUserById(this.props.buddy)
    uc.sendFile(u?.id, file as unknown as Blob)
      .then(res => {
        this.setState({ topic_id: res.file.topic_id })
        const buddyId = this.props.buddy
        Object.assign(res.file, this.state.blobFile)
        Object.assign(res.file, { target: { user_id: buddyId } })
        if (Platform.OS === 'web') {
          this.handleSaveBlobFileWeb(
            file as unknown as Blob,
            res.file as ChatFile,
            res.chat,
          )
        } else {
          chatStore.upsertFile(res.file)
          chatStore.pushMessages(buddyId, res.chat)
        }
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to send file`,
          err,
        })
      })
  }
}
