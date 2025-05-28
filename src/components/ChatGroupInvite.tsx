import { sortBy } from 'lodash'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import type { FC } from 'react'
import { Component } from 'react'
import { StyleSheet, View } from 'react-native'

import { uc } from '../api/uc'
import { mdiCheck, mdiClose } from '../assets/icons'
import { getCallStore } from '../stores/callStore'
import { chatStore } from '../stores/chatStore'
import { contactStore } from '../stores/contactStore'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
import { RnStacker } from '../stores/RnStacker'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { filterTextOnly } from '../utils/formatChatContent'
import { ButtonIcon } from './ButtonIcon'
import { formatDateTimeSemantic } from './chatConfig'
import { UserItem } from './ContactUserItem'
import { RnText, RnTouchableOpacity } from './Rn'
import { v } from './variables'

const css = StyleSheet.create({
  Notify: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: v.borderBg,
    backgroundColor: v.hoverBg,
  },
  Notify_Info: {
    flex: 1,
    paddingLeft: 12,
    paddingVertical: 5,
  },
  Notify_Btn_reject: {
    borderColor: v.colors.danger,
  },
  Notify_Btn_accept: {
    borderColor: v.colors.primary,
  },

  NotifyUnread: {
    borderBottomWidth: 0,
  },
  NotifyUnreadBtn: {
    flex: 1,
    backgroundColor: v.colors.primaryFn(0.5),
  },
})

const Notify: FC<{
  id: string
  type: string
  name: string
  inviter: string
  reject: Function
  accept: Function
  loading: boolean
}> = observer(p => (
  <View style={css.Notify}>
    {!!p.type && (
      <>
        <View style={css.Notify_Info}>
          <RnText bold>{p.name}</RnText>
          <RnText>{intl`Group chat invited by ${p.inviter}`}</RnText>
        </View>
        <ButtonIcon
          bdcolor={v.colors.danger}
          color={v.colors.danger}
          onPress={() => p.reject(p.id)}
          path={mdiClose}
          size={20}
          style={css.Notify_Btn_reject}
        />
        <ButtonIcon
          bdcolor={v.colors.primary}
          color={v.colors.primary}
          onPress={() => p.accept(p.id)}
          path={mdiCheck}
          size={20}
          style={css.Notify_Btn_accept}
          disabled={p.loading}
        />
      </>
    )}
  </View>
))

@observer
export class ChatGroupInvite extends Component {
  @observable loading = false

  formatGroup = (group: string) => {
    const { id, inviter, name } = chatStore.getGroupById(group) || {}
    const inviterName = contactStore.getUcUserById(inviter)?.name
    return {
      id,
      name,
      inviter: inviterName || inviter,
    }
  }
  // TODO: rejected but existed in chat home => error when click
  reject = (group: string) => {
    uc.leaveChatGroup(group)
      .then(this.onRejectSuccess)
      .catch(this.onRejectFailure)
  }
  onRejectSuccess = (res: { id: string }) => {
    chatStore.removeGroup(res.id)
  }
  onRejectFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to reject the group chat`,
      err,
    })
  }
  accept = (group: string) => {
    this.loading = true
    uc.joinChatGroup(group)
      .then(this.onAcceptSuccess)
      .catch(this.onAcceptFailure)
  }
  onAcceptSuccess = () => {
    this.loading = false
  }
  onAcceptFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to accept the group chat`,
      err,
    })
  }

  render() {
    return chatStore.groups
      .filter(gr => !gr.webchat && !gr.jointed)
      .map(gr => gr.id)
      .map(group => (
        <Notify
          key={group}
          {...this.formatGroup(group)}
          accept={this.accept}
          reject={this.reject}
          type='inviteChat'
          loading={this.loading}
        />
      ))
  }
}

@observer
export class UnreadChatNoti extends Component {
  @observable unreadChat: null | {
    id: string
    isGroup: boolean
    lastMessage: {
      text?: string
      created: number
    }
  } = null
  alreadyShowNoti: { [k: string]: boolean } = {}
  prevLastMessageId = ''
  prevUnreadChatTimeoutId = 0

  componentDidMount = () => {
    this.updateLatestUnreadChat()
  }

  componentDidUpdate = () => {
    this.updateLatestUnreadChat()
  }

  updateLatestUnreadChat = () => {
    if (this.unreadChat) {
      return
    }
    let unreadChats = Object.entries(chatStore.threadConfig)
      .filter(
        ([k, c]) =>
          c.isUnread &&
          filterTextOnly(chatStore.getMessagesByThreadId(k)).length,
      )
      .map(([k, c]) => {
        const arr = filterTextOnly(chatStore.getMessagesByThreadId(k))
        return {
          ...c,
          lastMessage: arr[arr.length - 1],
        }
      })
      .filter(
        c =>
          !this.alreadyShowNoti[c.lastMessage.id] &&
          c.lastMessage.id !== this.prevLastMessageId,
      )
    unreadChats.forEach(c => {
      this.alreadyShowNoti[c.lastMessage.id] = true
    })
    //
    unreadChats = unreadChats.filter(c => {
      const s = RnStacker.stacks[RnStacker.stacks.length - 1] as any as {
        name: string
        buddy: string
        groupId: string
      }
      const isWebchat = chatStore.isWebchat(c.id)
      const isWebchatJoined = chatStore.isWebchatJoined(c.id)

      if (!s) {
        return true
      }
      if (isWebchat && !isWebchatJoined) {
        return false
      }

      // always show chat message notifications when in call manage screen
      if (getCallStore().inPageCallManage) {
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
    this.unreadChat = latestUnreadChat
    this.prevLastMessageId = latestUnreadChat.lastMessage.id
    this.prevUnreadChatTimeoutId = BackgroundTimer.setTimeout(this.clear, 5000)
  }
  @action clear = () => {
    if (this.prevUnreadChatTimeoutId) {
      BackgroundTimer.clearTimeout(this.prevUnreadChatTimeoutId)
      this.prevUnreadChatTimeoutId = 0
    }
    this.unreadChat = null
  }
  onUnreadPress = () => {
    if (!this.unreadChat) {
      return
    }
    const { id, isGroup } = this.unreadChat
    this.clear()
    return isGroup
      ? Nav().goToPageChatGroupDetail({ groupId: id })
      : Nav().goToPageChatDetail({ buddy: id })
  }

  componentWillUnmount = () => {
    this.clear()
  }

  render() {
    Object.values(chatStore.threadConfig).forEach(c => {
      Object.values(c).forEach(v2 => {
        void v2
      })
    })
    Object.values(chatStore.messagesByThreadId).forEach(c => {
      c.forEach(v2 => {
        void v2.id
      })
    })
    void RnStacker.stacks[RnStacker.stacks.length - 1]
    if (!this.unreadChat) {
      return null
    }
    const {
      id,
      lastMessage: { text, created },
      isGroup,
    } = this.unreadChat
    return (
      <View style={[css.Notify, css.NotifyUnread]}>
        <RnTouchableOpacity
          style={css.NotifyUnreadBtn}
          onPress={this.onUnreadPress}
        >
          <UserItem
            key={id}
            {...(isGroup
              ? chatStore.getGroupById(id)
              : contactStore.getUcUserById(id))}
            lastMessage={text}
            isRecentChat
            lastMessageDate={formatDateTimeSemantic(created)}
          />
        </RnTouchableOpacity>
      </View>
    )
  }
}
