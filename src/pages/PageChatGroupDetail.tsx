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
import { Constants } from '../brekekejs/ucclient'
import { numberOfChatsPerLoad } from '../components/chatConfig'
import { MessageList } from '../components/ChatMessageList'
import { ChatInput } from '../components/FooterChatInput'
import { Layout } from '../components/Layout'
import { RnText } from '../components/RnText'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { v } from '../components/variables'
import { waitUc } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import {
  ChatFile,
  ChatGroup,
  ChatMessage,
  chatStore,
} from '../stores/chatStore'
import { contactStore } from '../stores/contactStore'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
import { arrToMap } from '../utils/arrToMap'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { formatFileType } from '../utils/formatFileType'
import { pickFile } from '../utils/pickFile'
import { saveBlob } from '../utils/saveBlob'
import { saveBlobFile } from '../utils/saveBlob.web'

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
export class PageChatGroupDetail extends Component<{
  groupId: string
}> {
  @computed get chatById() {
    return arrToMap(
      chatStore.getMessagesByThreadId(this.props.groupId),
      'id',
      (m: ChatMessage) => m,
    ) as { [k: string]: ChatMessage }
  }

  state = {
    target: '',
    loadingRecent: false,
    loadingMore: false,
    editingText: '',
    blobFile: {
      url: '',
      fileType: '',
    },
    topic_id: '',
    emojiTurnOn: false,
  }
  numberOfChatsPerLoadMore = numberOfChatsPerLoad
  edittingTextEmoji = ''
  editingTextReplace = false
  componentDidMount() {
    this.componentDidMountAsync()
  }
  componentDidMountAsync = async () => {
    const { groupId } = this.props
    this.setState({ loadingRecent: true })
    await waitUc()
    await uc
      .getGroupChats(groupId, {
        max: numberOfChatsPerLoad,
      })
      .then(chats => {
        chatStore.pushMessages(groupId, chats)
        BackgroundTimer.setTimeout(this.onContentSizeChange, 300)
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to get recent chats`,
          err,
        })
      })
    this.setState({ loadingRecent: false })
    chatStore.updateThreadConfig(groupId, true, {
      isUnread: false,
    })
  }
  componentDidUpdate() {
    const { groupId } = this.props
    if (chatStore.getThreadConfig(groupId).isUnread) {
      chatStore.updateThreadConfig(groupId, false, {
        isUnread: false,
      })
    }
  }
  componentWillUnmount() {
    if (Platform.OS === 'web') {
      const { topic_id } = this.state
      if (topic_id) {
        caches.delete(topic_id)
      }
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
    const id = this.props.groupId
    const gr = chatStore.getGroupById(id)
    const { allMessagesLoaded } = chatStore.getThreadConfig(id)
    const { loadingMore, loadingRecent } = this.state
    const chats = chatStore.getMessagesByThreadId(this.props.groupId)
    return (
      <Layout
        compact
        containerOnContentSizeChange={this.onContentSizeChange}
        containerOnScroll={this.onScroll}
        fabRender={this.renderChatInput}
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
        onBack={Nav().backToPageChatRecents}
        title={gr?.name}
      >
        {loadingRecent ? (
          <RnText style={css.LoadMore}>{intl`Loading...`}</RnText>
        ) : allMessagesLoaded ? (
          <RnText center style={[css.LoadMore, css.LoadMore__finished]}>
            {!chatStore.getMessagesByThreadId(this.props.groupId).length
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
          isGroupChat
          list={chats}
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

  me = uc.me()
  resolveBuddy = (creator: string) => {
    if (creator === this.me.id) {
      return this.me
    }
    if (creator.startsWith('#')) {
      // check message come from guest
      return { id: creator.replace('#', ''), name: 'Guest', avatar: null }
    }
    return contactStore.getUcUserById(creator) || {}
  }
  resolveChat = (id: string) => {
    const chat = this.chatById[id] as ChatMessage
    const text = chat.text
    const file = chatStore.getFileById(chat.file)
    const creator = this.resolveBuddy(chat.creator)
    return {
      id,
      creatorId: creator.id,
      creatorName: creator.name || creator.id,
      creatorAvatar: creator.avatar,
      file,
      text,
      type: chat.type,
      created: chat.created,
      createdByMe: creator.id === this.me.id,
    }
  }

  loadMore = () => {
    this.isLoadingMore = true
    this.setState({ loadingMore: true })
    this.numberOfChatsPerLoadMore =
      this.numberOfChatsPerLoadMore + numberOfChatsPerLoad
    const oldestChat =
      chatStore.getMessagesByThreadId(this.props.groupId)[0] ||
      ({} as ChatMessage)
    const oldestCreated = oldestChat.created || 0
    const max = this.numberOfChatsPerLoadMore
    const end = oldestCreated
    const query = {
      max,
      end,
    }
    uc.getGroupChats(this.props.groupId, query)
      .then(chats => {
        chatStore.pushMessages(this.props.groupId, chats)
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
        const id = this.props.groupId
        const totalChatLoaded = chatStore.getMessagesByThreadId(id).length
        if (totalChatLoaded < this.numberOfChatsPerLoadMore) {
          chatStore.updateThreadConfig(id, true, {
            allMessagesLoaded: true,
          })
        }
      })
  }

  setEditingText = (editingText: string) => {
    this.setState({
      editingText,
    })
  }

  submitting = false
  submitEditingText = () => {
    if (this.submitting) {
      return
    }
    const txt = this.state.editingText.trim()
    if (!txt) {
      return
    }
    if (this.state.emojiTurnOn) {
      this.setState({ emojiTurnOn: !this.state.emojiTurnOn })
    }
    this.submitting = true
    uc.sendGroupChatText(this.props.groupId, txt)
      .then(chat => {
        chatStore.pushMessages(this.props.groupId, [chat as ChatMessage])
        this.setState({ editingText: '' })
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to send the message`,
          err,
        })
      })
      .then(() => {
        this.submitting = false
      })
  }
  updateConfStatus = (conf_id: string, isClose: boolean) => {
    const g = chatStore.getGroupById(conf_id)
    const newItem = {
      ...g,
      webchat: {
        ...g.webchat,
        conf_status: isClose
          ? Constants.CONF_STATUS_INACTIVE
          : Constants.CONF_STATUS_INVITED,
      },
    } as ChatGroup
    chatStore.upsertGroup(newItem)
  }
  leave = () => {
    const conf_id = this.props.groupId
    uc.leaveChatConference(conf_id, true)
      .then(res => {
        const isWebchat = chatStore.isWebchat(conf_id)
        if (isWebchat) {
          // leave webchat then close conference
          // update conf_status
          this.updateConfStatus(conf_id, res.closes)
        } else {
          chatStore.removeGroup(conf_id)
        }
        Nav().backToPageChatRecents()
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to leave the group`,
          err,
        })
      })
  }

  invite = () => {
    Nav().goToPageChatGroupInvite({ groupId: this.props.groupId })
  }
  call = (target: string, bVideoEnabled: boolean) => {
    if (bVideoEnabled) {
      getCallStore().startVideoCall(target)
    } else {
      getCallStore().startCall(target)
    }
  }
  callVoiceConference = () => {
    let target = this.props.groupId
    if (!target.startsWith('uc')) {
      target = 'uc' + this.props.groupId
    }
    this.call(target, false)
  }
  callVideoConference = () => {
    let target = this.props.groupId
    if (!target.startsWith('uc')) {
      target = 'uc' + this.props.groupId
    }
    this.call(target, true)
  }

  readFile = (file: { type: string; name: string; uri: string }) => {
    const fileType = formatFileType(file.name)
    this.setState({ blobFile: { url: file.uri, fileType } })
  }

  sendFile = (file: { type: string; name: string; uri: string }) => {
    this.readFile(file)
    const groupId = this.props.groupId
    uc.sendFiles(groupId, file as any as Blob)
      .then(res => this.onSendFileSuccess(res, file as any as Blob))
      .catch(this.onSendFileFailure)
  }
  handleSaveBlobFileWeb = async (
    data: Blob,
    file: ChatFile,
    chat: ChatMessage,
  ) => {
    const { groupId } = this.props
    try {
      const url = await saveBlobFile(
        file.id,
        file.topic_id,
        file.fileType,
        data,
      )
      Object.assign(file, { url })
      chatStore.upsertFile(file)
      chatStore.pushMessages(groupId, chat)
    } catch (err) {
      console.error('PageChatGroupDetail.handleSaveBlobFileWeb err', err)
    }
  }
  onSendFileSuccess = (
    res: { file: ChatFile; chat: ChatMessage },
    file: Blob,
  ) => {
    const groupId = this.props.groupId
    const { blobFile } = this.state
    this.setState({ topic_id: res.file.topic_id })
    Object.assign(res.file, blobFile, { save: 'success' })
    if (Platform.OS === 'web') {
      this.handleSaveBlobFileWeb(file, res.file as ChatFile, res.chat)
    } else {
      chatStore.upsertFile(res.file)
      chatStore.pushMessages(groupId, res.chat)
    }
  }
  onSendFileFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to send file`,
      err,
    })
  }
  acceptFile = (file: { id: string; name: string }) => {
    uc.acceptFile(file.id)
      .then(blob => this.onAcceptFileSuccess(blob as Blob, file))
      .catch(this.onAcceptFileFailure)
  }

  onAcceptFileSuccess = (
    blob: Blob,
    file: {
      id: string
      name: string
    },
  ) => {
    const type = ['PNG', 'JPG', 'JPEG', 'GIF']
    const fileType = type.includes(
      file.name.split('.').pop()?.toUpperCase() || '',
    )
      ? 'image'
      : 'other'
    const reader = new FileReader()
    reader.onload = async event => {
      const url = event.target?.result
      const f = chatStore.getFileById(file.id)
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
  rejectFile = (file: { id: string }) => {
    uc.rejectFile(file).catch(this.onRejectFileFailure)
  }
  onRejectFileFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to reject file`,
      err,
    })
  }
}
