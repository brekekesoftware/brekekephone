import { computed } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TextInputSelectionChangeEventData,
} from 'react-native'
import { StyleSheet, View } from 'react-native'
import EmojiSelector, { Categories } from 'react-native-emoji-selector'

import { numberOfChatsPerLoad } from '#/components/chatConfig'
import { MessageList } from '#/components/ChatMessageList'
import { ChatInput } from '#/components/FooterChatInput'
import { Layout } from '#/components/Layout'
import { RnText, RnTouchableOpacity } from '#/components/Rn'
import { v } from '#/components/variables'
import { DEFAULT_TIMEOUT, isWeb } from '#/config'
import type { ChatFile, ChatMessage } from '#/stores/chatStore'
import { getPartyName } from '#/stores/contactStore'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { arrToMap } from '#/utils/arrToMap'
import { BackgroundTimer } from '#/utils/BackgroundTimer'
import { formatFileType } from '#/utils/formatFileType'
import { pickFile } from '#/utils/pickFile'
import { saveBlob } from '#/utils/saveBlob'
import { saveBlobFile } from '#/utils/saveBlob.web'

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
  @computed get chatById() {
    return arrToMap(
      ctx.chat.getMessagesByThreadId(this.props.buddy),
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

  componentDidMount = () => {
    this.componentDidMountAsync()
  }
  componentDidMountAsync = async () => {
    const { buddy: id } = this.props
    this.setState({ loadingRecent: true })
    await ctx.auth.waitPbx()
    await ctx.auth.waitUc()
    await ctx.uc
      .getBuddyChats(id, { max: numberOfChatsPerLoad })
      .then(chats => {
        ctx.chat.pushMessages(id, chats)
        BackgroundTimer.setTimeout(this.onContentSizeChange, DEFAULT_TIMEOUT)
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to get recent chats`,
          err,
        })
      })
    this.setState({ loadingRecent: false })
    ctx.uc.readUnreadChats(id)
    ctx.chat.updateThreadConfig(id, false, {
      isUnread: false,
    })
  }
  componentDidUpdate = () => {
    const { buddy: id } = this.props
    if (ctx.chat.getThreadConfig(id).isUnread) {
      ctx.chat.updateThreadConfig(id, false, {
        isUnread: false,
      })
    }
  }
  componentWillUnmount = () => {
    if (isWeb) {
      const { topic_id } = this.state
      if (topic_id) {
        caches.delete(topic_id)
      }
    }
  }
  renderChatInput = () => (
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

  render() {
    const { buddy: id } = this.props
    const { allMessagesLoaded, isUnread } = ctx.chat.getThreadConfig(id)
    const { loadingMore, loadingRecent, emojiTurnOn } = this.state
    const listMessage = ctx.chat.getMessagesByThreadId(this.props.buddy)
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
        onBack={ctx.nav.backToPageChatRecents}
        title={getPartyName({ partyNumber: id, preferPbxName: true }) || id} // for user not set username
        isShowToastMessage={isShowToastMessage}
        incomingMessage={incomingMessage}
        dropdown={[
          {
            label: intl`Start voice call`,
            onPress: () => ctx.call.startCall(id),
          },
          {
            label: intl`Start video call`,
            onPress: () => ctx.call.startVideoCall(id),
          },
        ]}
      >
        {loadingRecent ? (
          <RnText style={css.LoadMore}>{intl`Loading...`}</RnText>
        ) : allMessagesLoaded ? (
          <RnText center style={[css.LoadMore, css.LoadMore__finished]}>
            {!ctx.chat.getMessagesByThreadId(this.props.buddy).length
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
    const file = ctx.chat.getFileById(chat.file)
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
  me = ctx.uc.me()
  resolveCreator = (creator: string) => {
    if (creator === this.me.id) {
      return this.me
    }
    return ctx.contact.getUcUserById(creator) || {}
  }

  loadMore = () => {
    this.isLoadingMore = true
    this.setState({ loadingMore: true })
    this.numberOfChatsPerLoadMore =
      this.numberOfChatsPerLoadMore + numberOfChatsPerLoad
    const oldestChat =
      ctx.chat.getMessagesByThreadId(this.props.buddy)[0] || ({} as ChatMessage)
    const oldestCreated = oldestChat.created || 0
    const max = this.numberOfChatsPerLoadMore
    const end = oldestCreated
    const query = { max, end }
    const { buddy: id } = this.props
    ctx.uc
      .getBuddyChats(id, query)
      .then(chats => {
        ctx.chat.pushMessages(id, chats)
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
        const totalChatLoaded = ctx.chat.getMessagesByThreadId(buddy).length
        if (totalChatLoaded < this.numberOfChatsPerLoadMore) {
          ctx.chat.updateThreadConfig(buddy, false, {
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
    ctx.uc
      .sendBuddyChatText(this.props.buddy, txt)
      .then(this.onSubmitEditingTextSuccess)
      .catch(this.onSubmitEditingTextFailure)
      .then(() => {
        this.submitting = false
      })
  }
  onSubmitEditingTextSuccess = (chat: unknown) => {
    ctx.chat.pushMessages(this.props.buddy, chat as ChatMessage)
    this.setState({ editingText: '' })
  }
  onSubmitEditingTextFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to send the message`,
      err,
    })
  }
  acceptFile = (file: { id: string; name: string; fileType: string }) => {
    ctx.uc
      .acceptFile(file.id)
      .then(blob => this.onAcceptFileSuccess(blob as Blob, file))
      .catch(this.onAcceptFileFailure)
  }

  onAcceptFileSuccess = (blob: Blob, file: { id: string; name: string }) => {
    const fileType = formatFileType(file.name)
    const reader = new FileReader()
    reader.onload = async event => {
      const url = event.target?.result
      const f = ctx.chat.getFileById(file.id)
      if (!f) {
        return
      }
      Object.assign(f, {
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
    ctx.uc.rejectFile(file).catch(this.onRejectFileFailure)
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
      ctx.chat.upsertFile(file)
      ctx.chat.pushMessages(buddyId, chat)
    } catch (err) {
      console.error('PageChatDetail.handleSaveBlobFileWeb err', err)
    }
  }
  sendFile = (file: { type: string; name: string; uri: string }) => {
    this.readFile(file)
    const u = ctx.contact.getUcUserById(this.props.buddy)
    ctx.uc
      .sendFile(u?.id, file as any as Blob)
      .then(res => {
        this.setState({ topic_id: res.file.topic_id })
        const buddyId = this.props.buddy
        Object.assign(res.file, this.state.blobFile, { save: 'success' })
        Object.assign(res.file, { target: { user_id: buddyId } })
        if (isWeb) {
          this.handleSaveBlobFileWeb(
            file as any as Blob,
            res.file as ChatFile,
            res.chat,
          )
        } else {
          ctx.chat.upsertFile(res.file)
          ctx.chat.pushMessages(buddyId, res.chat)
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
