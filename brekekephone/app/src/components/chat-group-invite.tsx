import { View } from '@rntwsc/rn/core/components/view'
import { tw } from '@rntwsc/rn/core/tw/tw'
import { sortBy } from '@rntwsc/shared/lodash'
import { observer } from 'mobx-react'
import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'

import { mdiCheck, mdiClose } from '#/assets/icons'
import { ButtonIcon } from '#/components/button-icon'
import { formatDateTimeSemantic } from '#/components/chat-config'
import { UserItem } from '#/components/contact-user-item'
import { RnText, RnTouchableOpacity } from '#/components/rn'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { RnStacker } from '#/stores/rn-stacker'
import { BackgroundTimer } from '#/utils/background-timer'
import { filterTextOnly } from '#/utils/format-chat-content'

const notifyClassName = tw`border-border bg-muted flex-row items-center border-b`

const Notify: FC<{
  id: string
  type: string
  name: string
  inviter: string
  reject: Function
  accept: Function
  loading: boolean
}> = observer(p => (
  <View className={notifyClassName}>
    {!!p.type && (
      <>
        <View className='flex-1 py-1.25 pl-3'>
          <RnText bold>{p.name}</RnText>
          <RnText>{intl`Group chat invited by ${p.inviter}`}</RnText>
        </View>
        <ButtonIcon
          className='border-error text-error'
          onPress={() => p.reject(p.id)}
          path={mdiClose}
          size={20}
        />
        <ButtonIcon
          className='border-primary text-primary'
          onPress={() => p.accept(p.id)}
          path={mdiCheck}
          size={20}
          disabled={p.loading}
        />
      </>
    )}
  </View>
))

export const ChatGroupInvite = observer(() => {
  const mountedRef = useRef(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const formatGroup = (group: string) => {
    const { id, inviter, name } = ctx.chat.getGroupById(group) || {}
    const inviterName = ctx.contact.getUcUserById(inviter)?.name
    return {
      id,
      name,
      inviter: inviterName || inviter,
    }
  }

  const reject = (group: string) => {
    ctx.uc
      .leaveChatGroup(group)
      .then((res: { id: string }) => ctx.chat.removeGroup(res.id))
      .catch((err: Error) =>
        RnAlert.error({
          message: intlDebug`Failed to reject the group chat`,
          err,
        }),
      )
  }

  const accept = (group: string) => {
    setLoading(true)
    ctx.uc
      .joinChatGroup(group)
      .then(() => {
        if (mountedRef.current) {
          setLoading(false)
        }
      })
      .catch((err: Error) =>
        RnAlert.error({
          message: intlDebug`Failed to accept the group chat`,
          err,
        }),
      )
  }

  return ctx.chat.groups
    .filter(gr => !gr.webchat && !gr.jointed)
    .map(gr => gr.id)
    .map(group => (
      <Notify
        key={group}
        {...formatGroup(group)}
        accept={accept}
        reject={reject}
        type='inviteChat'
        loading={loading}
      />
    ))
})

type UnreadChatState = {
  id: string
  isGroup: boolean
  lastMessage: {
    text?: string
    created: number
  }
}

export const UnreadChatNoti = observer(() => {
  const [unreadChat, setUnreadChat] = useState<null | UnreadChatState>(null)
  const alreadyShowNoti = useRef<{ [k: string]: boolean }>({})
  const prevLastMessageId = useRef('')
  const prevUnreadChatTimeoutId = useRef(0)
  const mountedRef = useRef(true)

  const clearUnreadTimer = () => {
    if (prevUnreadChatTimeoutId.current) {
      BackgroundTimer.clearTimeout(prevUnreadChatTimeoutId.current)
      prevUnreadChatTimeoutId.current = 0
    }
  }

  const clear = () => {
    clearUnreadTimer()
    if (!mountedRef.current) {
      return
    }
    setUnreadChat(null)
  }

  // Track MobX observables so observer re-renders when they change
  Object.values(ctx.chat.threadConfig).forEach(c => {
    Object.values(c).forEach(v2 => {
      void v2
    })
  })
  Object.values(ctx.chat.messagesByThreadId).forEach(c => {
    c.forEach(v2 => {
      void v2.id
    })
  })
  void RnStacker.stacks[RnStacker.stacks.length - 1]

  // Runs after every render, equivalent to componentDidMount + componentDidUpdate
  useEffect(() => {
    if (unreadChat) {
      return
    }
    let unreadChats = Object.entries(ctx.chat.threadConfig)
      .filter(
        ([k, c]) =>
          c.isUnread &&
          filterTextOnly(ctx.chat.getMessagesByThreadId(k)).length,
      )
      .map(([k, c]) => {
        const arr = filterTextOnly(ctx.chat.getMessagesByThreadId(k))
        return {
          ...c,
          lastMessage: arr[arr.length - 1],
        }
      })
      .filter(
        c =>
          !alreadyShowNoti.current[c.lastMessage.id] &&
          c.lastMessage.id !== prevLastMessageId.current,
      )
    unreadChats.forEach(c => {
      alreadyShowNoti.current[c.lastMessage.id] = true
    })
    //
    unreadChats = unreadChats.filter(c => {
      const s = RnStacker.stacks[RnStacker.stacks.length - 1] as any as {
        name: string
        buddy: string
        groupId: string
      }
      const isWebchat = ctx.chat.isWebchat(c.id)
      const isWebchatJoined = ctx.chat.isWebchatJoined(c.id)

      if (!s) {
        return true
      }
      if (isWebchat && !isWebchatJoined) {
        return false
      }

      // always show chat message notifications when in call manage screen
      if (ctx.call.inPageCallManage) {
        return true
      }

      const { name, buddy, groupId } = s

      if (name === 'PageChatRecents') {
        return false
      }
      if (name === 'PageChatDetail' && !c.isGroup && buddy === c.id) {
        return false
      }
      if (name === 'PageChatGroupDetail' && c.isGroup && groupId === c.id) {
        return false
      }

      return true
    })
    //
    unreadChats = sortBy(unreadChats, 'lastMessage.created')
    const latestUnreadChat = unreadChats[unreadChats.length - 1]
    if (!latestUnreadChat) {
      return
    }
    //
    setUnreadChat(latestUnreadChat)
    prevLastMessageId.current = latestUnreadChat.lastMessage.id
    prevUnreadChatTimeoutId.current = BackgroundTimer.setTimeout(clear, 5000)
  })

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      clearUnreadTimer()
    }
  }, [])

  if (!unreadChat) {
    return null
  }
  const {
    id,
    lastMessage: { text, created },
    isGroup,
  } = unreadChat
  return (
    <View className={[notifyClassName, 'border-b-0']}>
      <RnTouchableOpacity
        className='bg-primary-100 dark:bg-muted flex-1'
        onPress={() => {
          clear()
          return isGroup
            ? ctx.nav.goToPageChatGroupDetail({
                groupId: id,
              })
            : ctx.nav.goToPageChatDetail({
                buddy: id,
              })
        }}
      >
        <UserItem
          key={id}
          {...(isGroup
            ? ctx.chat.getGroupById(id)
            : ctx.contact.getUcUserById(id))}
          lastMessage={text}
          isRecentChat
          lastMessageDate={formatDateTimeSemantic(created)}
        />
      </RnTouchableOpacity>
    </View>
  )
})
