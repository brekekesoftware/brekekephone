import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TextInputSelectionChangeEventData,
} from 'react-native'

import { isWeb } from '@/rn/core/utils/platform'
import { numberOfChatsPerLoad } from '#/components/chat-config'
import { MessageList } from '#/components/chat-message-list'
import { ChatInput } from '#/components/footer-chat-input'
import { Layout } from '#/components/layout'
import { RnText, RnTouchableOpacity } from '#/components/rn'
import { defaultTimeout } from '#/config'
import type { ChatFile, ChatMessage } from '#/stores/chat-store'
import { getPbxName } from '#/stores/contact-store'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { arrToMap } from '#/utils/arr-to-map'
import { BackgroundTimer } from '#/utils/background-timer'
import { formatFileType } from '#/utils/format-file-type'
import { pickFile } from '#/utils/pick-file'
import { saveBlob, saveBlobFile } from '#/utils/save-blob'

export const PageChatDetail = observer(({ buddy }: { buddy: string }) => {
  const [loadingRecent, setLoadingRecent] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [editingText, setEditingText] = useState('')
  const [blobFile, setBlobFile] = useState({ url: '', fileType: '' })
  const [topic_id, setTopicId] = useState('')
  const [emojiTurnOn, setEmojiTurnOn] = useState(false)
  const numberOfChatsPerLoadMoreRef = useRef(numberOfChatsPerLoad)
  const edittingTextEmojiRef = useRef('')
  const editingTextReplaceRef = useRef(false)
  const viewRef = useRef<ScrollView | undefined>(undefined)
  const justMountedRef = useRef(true)
  const closeToBottomRef = useRef(true)
  const currentScrollPositionRef = useRef(0)
  const isLoadingMoreRef = useRef(false)
  const submittingRef = useRef(false)
  const mountedRef = useRef(true)
  const sizeTimerRef = useRef<number | undefined>(undefined)

  // Keep a ref to topic_id so the cleanup closure always sees the latest value
  const topicIdRef = useRef('')
  topicIdRef.current = topic_id

  // me is called each render and tracked by observer
  const me = ctx.uc.me()

  // chatById computed as a regular const - observer re-renders when underlying
  // observables change, so this is always fresh
  const chatById = arrToMap(
    ctx.chat.getMessagesByThreadId(buddy),
    'id',
    (m: ChatMessage) => m,
  ) as { [k: string]: ChatMessage }

  const { allMessagesLoaded, isUnread } = ctx.chat.getThreadConfig(buddy)

  const onContentSizeChange = (newWidth?: number, newHeight?: number) => {
    if (!viewRef.current || emojiTurnOn) {
      return
    }
    if (closeToBottomRef.current) {
      viewRef.current?.scrollToEnd({
        animated: !justMountedRef.current,
      })
      if (justMountedRef.current) {
        justMountedRef.current = false
      }
    }
    // scroll to last position after load more
    if (newHeight && isLoadingMoreRef.current) {
      isLoadingMoreRef.current = false
      viewRef.current?.scrollTo({
        y: newHeight - currentScrollPositionRef.current,
        animated: false,
      })
    }
  }

  const componentDidMountAsync = async () => {
    const id = buddy
    setLoadingRecent(true)
    await ctx.auth.waitPbx()
    await ctx.auth.waitUc()
    await ctx.uc
      .getBuddyChats(id, { max: numberOfChatsPerLoad })
      .then(chats => {
        ctx.chat.pushMessages(id, chats)
        if (mountedRef.current) {
          sizeTimerRef.current = BackgroundTimer.setTimeout(
            onContentSizeChange,
            defaultTimeout,
          )
        }
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to get recent chats`,
          err,
        })
      })
    if (mountedRef.current) {
      setLoadingRecent(false)
    }
    ctx.uc.readUnreadChats(id)
    ctx.chat.updateThreadConfig(id, false, {
      isUnread: false,
    })
  }

  useEffect(() => {
    mountedRef.current = true
    componentDidMountAsync()
    return () => {
      mountedRef.current = false
      if (sizeTimerRef.current) {
        BackgroundTimer.clearTimeout(sizeTimerRef.current)
      }
      if (isWeb && topicIdRef.current) {
        caches.delete(topicIdRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isUnread) {
      ctx.chat.updateThreadConfig(buddy, false, { isUnread: false })
    }
  }, [isUnread])

  const onSelectionChange = (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => {
    const selection = event.nativeEvent.selection
    editingTextReplaceRef.current = false
    if (selection.start !== selection.end) {
      edittingTextEmojiRef.current = editingText.substring(
        selection.start,
        selection.end,
      )
      editingTextReplaceRef.current = true
    } else {
      edittingTextEmojiRef.current = editingText.substring(0, selection.start)
    }
  }

  const onScroll = (ev: NativeSyntheticEvent<NativeScrollEvent>) => {
    const layoutSize = ev.nativeEvent.layoutMeasurement
    const layoutHeight = layoutSize.height
    const contentOffset = ev.nativeEvent.contentOffset
    const contentSize = ev.nativeEvent.contentSize
    const contentHeight = contentSize.height
    const paddingToBottom = 20
    closeToBottomRef.current =
      layoutHeight + contentOffset.y >= contentHeight - paddingToBottom
    currentScrollPositionRef.current = contentHeight
  }

  const resolveCreator = (creator: string) => {
    if (creator === me.id) {
      return me
    }
    return ctx.contact.getUcUserById(creator) || {}
  }

  const resolveChat = (id: string) => {
    const chat = chatById[id] as ChatMessage
    const file = ctx.chat.getFileById(chat.file)
    const text = chat.text
    const creator = resolveCreator(chat.creator)
    return {
      id,
      creatorId: creator.id,
      creatorName: creator.name || creator.id,
      creatorAvatar: creator.avatar,
      text,
      type: chat.type,
      file,
      created: chat.created,
      createdByMe: creator.id === me.id,
    }
  }

  const loadMore = () => {
    isLoadingMoreRef.current = true
    setLoadingMore(true)
    numberOfChatsPerLoadMoreRef.current =
      numberOfChatsPerLoadMoreRef.current + numberOfChatsPerLoad
    const oldestChat =
      ctx.chat.getMessagesByThreadId(buddy)[0] || ({} as ChatMessage)
    const oldestCreated = oldestChat.created || 0
    const max = numberOfChatsPerLoadMoreRef.current
    const end = oldestCreated
    const query = { max, end }
    const id = buddy
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
        setLoadingMore(false)
      })
      .then(() => {
        const totalChatLoaded = ctx.chat.getMessagesByThreadId(buddy).length
        if (totalChatLoaded < numberOfChatsPerLoadMoreRef.current) {
          ctx.chat.updateThreadConfig(buddy, false, {
            allMessagesLoaded: true,
          })
        }
      })
  }

  const submitEditingText = () => {
    const txt = editingText.trim()
    if (!txt || submittingRef.current) {
      return
    }
    if (emojiTurnOn) {
      setEmojiTurnOn(!emojiTurnOn)
    }
    submittingRef.current = true
    //
    ctx.uc
      .sendBuddyChatText(buddy, txt)
      .then(onSubmitEditingTextSuccess)
      .catch(onSubmitEditingTextFailure)
      .then(() => {
        submittingRef.current = false
      })
  }

  const onSubmitEditingTextSuccess = (chat: unknown) => {
    ctx.chat.pushMessages(buddy, chat as ChatMessage)
    setEditingText('')
  }

  const onSubmitEditingTextFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to send the message`,
      err,
    })
  }

  const acceptFile = (file: { id: string; name: string; fileType: string }) => {
    ctx.uc
      .acceptFile(file.id)
      .then(blob => onAcceptFileSuccess(blob as Blob, file))
      .catch(onAcceptFileFailure)
  }

  const onAcceptFileSuccess = (
    blob: Blob,
    file: { id: string; name: string },
  ) => {
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

  const onAcceptFileFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to accept file`,
      err,
    })
  }

  const rejectFile = (file: object) => {
    ctx.uc.rejectFile(file).catch(onRejectFileFailure)
  }

  const onRejectFileFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to reject file`,
      err,
    })
  }

  const readFile = (file: { type: string; name: string; uri: string }) => {
    const fileType = formatFileType(file.name)
    setBlobFile({ url: file.uri, fileType })
  }

  const handleSaveBlobFileWeb = async (
    data: Blob,
    file: ChatFile,
    chat: ChatMessage,
  ) => {
    const buddyId = buddy
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

  const sendFile = (file: { type: string; name: string; uri: string }) => {
    readFile(file)
    const u = ctx.contact.getUcUserById(buddy)
    ctx.uc
      .sendFile(u?.id, file as any as Blob)
      .then(res => {
        setTopicId(res.file.topic_id)
        const buddyId = buddy
        Object.assign(res.file, blobFile, { save: 'success' })
        Object.assign(res.file, { target: { user_id: buddyId } })
        if (isWeb) {
          handleSaveBlobFileWeb(
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

  const renderChatInput = () => (
    <ChatInput
      onEmojiTurnOn={() => {
        setEmojiTurnOn(!emojiTurnOn)
        viewRef.current?.scrollToEnd()
      }}
      onSelectionChange={onSelectionChange}
      onTextChange={setEditingText}
      onTextSubmit={submitEditingText}
      openFileRnPicker={() => pickFile(sendFile)}
      text={editingText}
    />
  )

  const listMessage = ctx.chat.getMessagesByThreadId(buddy)
  const incomingMessage = listMessage
    ? listMessage[listMessage.length - 1]?.text
    : undefined
  const isShowToastMessage = emojiTurnOn && isUnread

  return (
    <Layout
      compact
      containerOnContentSizeChange={onContentSizeChange}
      containerOnScroll={onScroll}
      containerRef={(ref: ScrollView) => {
        viewRef.current = ref
      }}
      fabRender={renderChatInput}
      onBack={ctx.nav.backToPageChatRecents}
      title={getPbxName({ partyNumber: buddy, preferPbxName: true }) || buddy} // for user not set username
      isShowToastMessage={isShowToastMessage}
      incomingMessage={incomingMessage}
      dropdown={[
        {
          label: intl`Start voice call`,
          onPress: () => ctx.call.startCall(buddy),
        },
        {
          label: intl`Start video call`,
          onPress: () => ctx.call.startVideoCall(buddy),
        },
      ]}
    >
      {loadingRecent ? (
        <RnText className='self-center px-2.5 pb-3.75 text-[11.2px]'>{intl`Loading...`}</RnText>
      ) : allMessagesLoaded ? (
        <RnText
          center
          warning
          className='self-center px-2.5 pb-3.75 text-[11.2px]'
        >
          {!ctx.chat.getMessagesByThreadId(buddy).length
            ? intl`There's currently no message in this thread`
            : intl`All messages in this thread have been loaded`}
        </RnText>
      ) : (
        <RnTouchableOpacity
          onPress={loadingMore ? undefined : () => loadMore()}
        >
          <RnText
            bold={!loadingMore}
            primary={!loadingMore}
            className='self-center px-2.5 pb-3.75 text-[11.2px]'
          >
            {loadingMore ? intl`Loading...` : intl`Load more messages`}
          </RnText>
        </RnTouchableOpacity>
      )}
      <MessageList
        acceptFile={acceptFile}
        list={listMessage}
        loadMore={loadMore}
        rejectFile={rejectFile}
        resolveChat={resolveChat}
      />
    </Layout>
  )
})
