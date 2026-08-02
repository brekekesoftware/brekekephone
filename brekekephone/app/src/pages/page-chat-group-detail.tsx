import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TextInputSelectionChangeEventData,
} from 'react-native'
import { Keyboard } from 'react-native'
import { isWeb } from 'rntwsc/platform'

import { Constants } from '@/brekekejs/ucclient'
import { numberOfChatsPerLoad } from '@/components/chat-config'
import { MessageList } from '@/components/chat-message-list'
import { EmojiPicker } from '@/components/emoji-picker'
import { ChatInput } from '@/components/footer-chat-input'
import { Layout } from '@/components/layout'
import { RnText } from '@/components/rn-text'
import { RnTouchableOpacity } from '@/components/rn-touchable-opacity'
import { defaultTimeout } from '@/config'
import type { ChatFile, ChatGroup, ChatMessage } from '@/stores/chat-store'
import { ctx } from '@/stores/ctx'
import { intl, intlDebug } from '@/stores/intl'
import { RnAlert } from '@/stores/rn-alert'
import { RnKeyboard } from '@/stores/rn-keyboard'
import { arrToMap } from '@/utils/arr-to-map'
import { BackgroundTimer } from '@/utils/background-timer'
import { formatFileType } from '@/utils/format-file-type'
import { pickFile } from '@/utils/pick-file'
import { saveBlob, saveBlobFile } from '@/utils/save-blob'

export const PageChatGroupDetail = observer(
  ({ groupId }: { groupId: string }) => {
    const [loadingRecent, setLoadingRecent] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [editingText, setEditingText] = useState('')
    const blobFileRef = useRef({
      url: '',
      fileType: '',
    })
    const [topic_id, setTopicId] = useState('')
    const [emojiTurnOn, setEmojiTurnOn] = useState(false)

    const numberOfChatsPerLoadMoreRef = useRef(numberOfChatsPerLoad)
    const selectionRef = useRef<{ start: number; end: number } | undefined>(
      undefined,
    )
    const prevKbShowingRef = useRef(false)
    const inputRef = useRef<HTMLInputElement>(null)
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
      ctx.chat.getMessagesByThreadId(groupId),
      'id',
      (m: ChatMessage) => m,
    ) as { [k: string]: ChatMessage }

    const { allMessagesLoaded } = ctx.chat.getThreadConfig(groupId)
    const { isUnread: groupIsUnread } = ctx.chat.getThreadConfig(groupId)

    const onContentSizeChange = (_newWidth?: number, newHeight?: number) => {
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
      setLoadingRecent(true)
      await ctx.auth.waitPbx()
      await ctx.auth.waitUc()
      await ctx.uc
        .getGroupChats(groupId, {
          max: numberOfChatsPerLoad,
        })
        .then(chats => {
          ctx.chat.pushMessages(groupId, chats)
          if (mountedRef.current) {
            sizeTimerRef.current = BackgroundTimer.setTimeout(
              onContentSizeChange,
              defaultTimeout,
            )
          }
        })
        .catch((err: Error) => {
          // UC may not be signed in yet during a multi-account switch (BUG-1256);
          // that surfaces here as a "Not signed-in" reject. Don't alarm the user
          // with an error dialog for that transient case - only report a genuine
          // failure once UC is actually connected.
          if (ctx.auth.ucState !== 'success') {
            console.log('UC debug: getGroupChats skipped, UC not signed in yet')
            return
          }
          RnAlert.error({
            message: intlDebug`Failed to get recent chats`,
            err,
          })
        })
      if (mountedRef.current) {
        setLoadingRecent(false)
      }
      ctx.chat.updateThreadConfig(groupId, true, {
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
      if (groupIsUnread) {
        ctx.chat.updateThreadConfig(groupId, false, {
          isUnread: false,
        })
      }
    }, [groupIsUnread])

    // close the emoji panel once the keyboard has fully risen, handing the
    // bottom region back to it. rising-edge only: dismissing the keyboard to
    // open the panel is a falling edge and must not close it.
    const isKeyboardShowing = RnKeyboard.isKeyboardShowing
    useEffect(() => {
      const rising = isKeyboardShowing && !prevKbShowingRef.current
      prevKbShowingRef.current = isKeyboardShowing
      if (rising && emojiTurnOn) {
        setEmojiTurnOn(false)
      }
    }, [isKeyboardShowing, emojiTurnOn])

    const onSelectionChange = (
      event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
    ) => {
      selectionRef.current = event.nativeEvent.selection
    }

    const insertEmoji = (emoji: string) => {
      const { start, end } = selectionRef.current || {
        start: editingText.length,
        end: editingText.length,
      }
      const next = editingText.slice(0, start) + emoji + editingText.slice(end)
      setEditingText(next)
      const pos = start + emoji.length
      selectionRef.current = {
        start: pos,
        end: pos,
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

    const resolveBuddy = (creator: string) => {
      if (creator === me.id) {
        return me
      }
      if (creator.startsWith('#')) {
        // check message come from guest
        return {
          id: creator.replace('#', ''),
          name: 'Guest',
          avatar: null,
        }
      }
      return ctx.contact.getUcUserById(creator) || {}
    }

    const resolveChat = (id: string) => {
      const chat = chatById[id] as ChatMessage
      const text = chat.text
      const file = ctx.chat.getFileById(chat.file)
      const creator = resolveBuddy(chat.creator)
      return {
        id,
        creatorId: creator.id,
        creatorName: creator.name || creator.id,
        creatorAvatar: creator.avatar,
        file,
        text,
        type: chat.type,
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
        ctx.chat.getMessagesByThreadId(groupId)[0] || ({} as ChatMessage)
      const oldestCreated = oldestChat.created || 0
      const max = numberOfChatsPerLoadMoreRef.current
      const end = oldestCreated
      const query = {
        max,
        end,
      }
      ctx.uc
        .getGroupChats(groupId, query)
        .then(chats => {
          ctx.chat.pushMessages(groupId, chats)
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
          const totalChatLoaded = ctx.chat.getMessagesByThreadId(groupId).length
          if (totalChatLoaded < numberOfChatsPerLoadMoreRef.current) {
            ctx.chat.updateThreadConfig(groupId, true, {
              allMessagesLoaded: true,
            })
          }
        })
    }

    const submitEditingText = () => {
      if (submittingRef.current) {
        return
      }
      const txt = editingText.trim()
      if (!txt) {
        return
      }
      if (emojiTurnOn) {
        setEmojiTurnOn(!emojiTurnOn)
      }
      submittingRef.current = true
      ctx.uc
        .sendGroupChatText(groupId, txt)
        .then(chat => {
          ctx.chat.pushMessages(groupId, [chat as ChatMessage])
          setEditingText('')
        })
        .catch((err: Error) => {
          RnAlert.error({
            message: intlDebug`Failed to send the message`,
            err,
          })
        })
        .then(() => {
          submittingRef.current = false
        })
    }

    const updateConfStatus = (conf_id: string, isClose: boolean) => {
      const g = ctx.chat.getGroupById(conf_id)
      const newItem = {
        ...g,
        webchat: {
          ...g.webchat,
          conf_status: isClose
            ? Constants.CONF_STATUS_INACTIVE
            : Constants.CONF_STATUS_INVITED,
        },
      } as ChatGroup
      ctx.chat.upsertGroup(newItem)
    }

    const leave = () => {
      const conf_id = groupId
      ctx.uc
        .leaveChatConference(conf_id, true)
        .then(res => {
          const isWebchat = ctx.chat.isWebchat(conf_id)
          if (isWebchat) {
            // leave webchat then close conference
            // update conf_status
            updateConfStatus(conf_id, res.closes)
          } else {
            ctx.chat.removeGroup(conf_id)
          }
          ctx.nav.backToPageChatRecents()
        })
        .catch((err: Error) => {
          RnAlert.error({
            message: intlDebug`Failed to leave the group`,
            err,
          })
        })
    }

    const invite = () => {
      ctx.nav.goToPageChatGroupInvite({
        groupId,
      })
    }

    const call = (callTarget: string, bVideoEnabled: boolean) => {
      if (bVideoEnabled) {
        ctx.call.startVideoCall(callTarget)
      } else {
        ctx.call.startCall(callTarget)
      }
    }

    const callVoiceConference = () => {
      let callTarget = groupId
      if (!callTarget.startsWith('uc')) {
        callTarget = 'uc' + groupId
      }
      call(callTarget, false)
    }

    const callVideoConference = () => {
      let callTarget = groupId
      if (!callTarget.startsWith('uc')) {
        callTarget = 'uc' + groupId
      }
      call(callTarget, true)
    }

    const readFile = (file: { type: string; name: string; uri: string }) => {
      const fileType = formatFileType(file.name)
      blobFileRef.current = {
        url: file.uri,
        fileType,
      }
    }

    const handleSaveBlobFileWeb = async (
      data: Blob,
      file: ChatFile,
      chat: ChatMessage,
    ) => {
      try {
        const url = await saveBlobFile(
          file.id,
          file.topic_id,
          file.fileType,
          data,
        )
        Object.assign(file, {
          url,
        })
        ctx.chat.upsertFile(file)
        ctx.chat.pushMessages(groupId, chat)
      } catch (err) {
        console.error('PageChatGroupDetail.handleSaveBlobFileWeb err', err)
      }
    }

    const onSendFileSuccess = (
      res: { file: ChatFile; chat: ChatMessage },
      file: Blob,
    ) => {
      setTopicId(res.file.topic_id)
      Object.assign(res.file, blobFileRef.current, {
        save: 'success',
      })
      if (isWeb) {
        handleSaveBlobFileWeb(file, res.file as ChatFile, res.chat)
      } else {
        ctx.chat.upsertFile(res.file)
        ctx.chat.pushMessages(groupId, res.chat)
      }
    }

    const onSendFileFailure = (err: Error) => {
      RnAlert.error({
        message: intlDebug`Failed to send file`,
        err,
      })
    }

    const sendFile = (file: { type: string; name: string; uri: string }) => {
      readFile(file)
      ctx.uc
        .sendFiles(groupId, file as any as Blob)
        .then(res => onSendFileSuccess(res, file as any as Blob))
        .catch(onSendFileFailure)
    }

    const onAcceptFileSuccess = (
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

    const acceptFile = (file: { id: string; name: string }) => {
      ctx.uc
        .acceptFile(file.id)
        .then(blob => onAcceptFileSuccess(blob as Blob, file))
        .catch(onAcceptFileFailure)
    }

    const onRejectFileFailure = (err: Error) => {
      RnAlert.error({
        message: intlDebug`Failed to reject file`,
        err,
      })
    }

    const rejectFile = (file: { id: string }) => {
      ctx.uc.rejectFile(file).catch(onRejectFileFailure)
    }

    const renderChatInput = () => (
      <ChatInput
        inputRef={inputRef}
        onEmojiTurnOn={() => {
          if (emojiTurnOn) {
            // hand the bottom region back to the keyboard; on native the
            // rising-edge effect closes the panel once the keyboard is fully
            // up so the input never moves. web has no keyboard events, close
            // the panel directly
            inputRef.current?.focus()
            if (isWeb) {
              setEmojiTurnOn(false)
            }
            return
          }
          setEmojiTurnOn(true)
          Keyboard.dismiss()
          viewRef.current?.scrollToEnd()
        }}
        onSelectionChange={onSelectionChange}
        onTextChange={setEditingText}
        onTextSubmit={submitEditingText}
        openFileRnPicker={() => pickFile(sendFile)}
        text={editingText}
      />
    )

    const gr = ctx.chat.getGroupById(groupId)
    const chats = ctx.chat.getMessagesByThreadId(groupId)
    // match the emoji panel to the keyboard area so swapping does not move the
    // input; fall back before the keyboard has ever been measured
    const emojiHeight = RnKeyboard.lastKeyboardHeight || 300

    return (
      <Layout
        compact
        containerOnContentSizeChange={onContentSizeChange}
        containerOnScroll={onScroll}
        fabRender={renderChatInput}
        bottomPanelHeight={emojiTurnOn ? emojiHeight : 0}
        bottomPanel={
          emojiTurnOn ? <EmojiPicker onSelect={insertEmoji} /> : null
        }
        containerRef={(ref: ScrollView) => {
          viewRef.current = ref
        }}
        dropdown={[
          {
            label: intl`Invite more people`,
            onPress: invite,
          },
          {
            label: intl`Start voice call`,
            onPress: callVoiceConference,
          },
          {
            label: intl`Start video call`,
            onPress: callVideoConference,
          },
          {
            label: intl`Leave group`,
            onPress: leave,
            danger: true,
          },
        ]}
        onBack={ctx.nav.backToPageChatRecents}
        title={gr?.name}
      >
        {loadingRecent ? (
          <RnText className='self-center px-2.5 pb-3.75 text-[11.2px]'>{intl`Loading...`}</RnText>
        ) : allMessagesLoaded ? (
          <RnText
            center
            warning
            className='self-center px-2.5 pb-3.75 text-[11.2px]'
          >
            {!ctx.chat.getMessagesByThreadId(groupId).length
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
          isGroupChat
          list={chats}
          loadMore={loadMore}
          rejectFile={rejectFile}
          resolveChat={resolveChat}
        />
      </Layout>
    )
  },
)
