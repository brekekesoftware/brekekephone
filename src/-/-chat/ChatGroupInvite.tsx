import { mdiCheck, mdiClose } from '@mdi/js'
import sortBy from 'lodash/sortBy'
import { action, computed, observable } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'

import UserItem from '../-contact/UserItem'
import uc from '../api/uc'
import g from '../global'
import chatStore from '../global/chatStore'
import contactStore from '../global/contactStore'
import intl, { intlDebug } from '../intl/intl'
import { StyleSheet, Text, TouchableOpacity, View } from '../Rn'
import ButtonIcon from '../shared/ButtonIcon'
import { formatDateTimeSemantic } from './config'

const css = StyleSheet.create({
  Notify: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: g.borderBg,
    backgroundColor: g.hoverBg,
  },
  Notify_Info: {
    flex: 1,
    paddingLeft: 12,
    paddingVertical: 5,
  },
  Notify_Btn_reject: {
    borderColor: g.colors.danger,
  },
  Notify_Btn_accept: {
    borderColor: g.colors.primary,
  },

  NotifyUnread: {
    borderBottomWidth: 0,
  },
  NotifyUnreadBtn: {
    flex: 1,
    backgroundColor: g.colors.primaryFn(0.5),
  },
})

const Notify = observer(p0 => {
  const { call: c, ...p } = p0
  return (
    <View style={css.Notify}>
      {p.type && (
        <React.Fragment>
          <View style={css.Notify_Info}>
            <Text bold>{p.name}</Text>
            <Text>{intl`Group chat invited by ${p.inviter}`}</Text>
          </View>
          <ButtonIcon
            bdcolor={g.colors.danger}
            color={g.colors.danger}
            onPress={() => p.reject(p.id)}
            path={mdiClose}
            size={20}
            style={css.Notify_Btn_reject}
          />
          <ButtonIcon
            bdcolor={g.colors.primary}
            color={g.colors.primary}
            onPress={() => p.accept(p.id)}
            path={mdiCheck}
            size={20}
            style={css.Notify_Btn_accept}
            disabled={p.loading}
          />
        </React.Fragment>
      )}
    </View>
  )
})

@observer
class ChatGroupInvite extends React.Component {
  @observable loading = false
  @computed get groupIds() {
    return chatStore.groups.filter(g => !g.jointed).map(g => g.id)
  }

  formatGroup = group => {
    const { id, inviter, name } = chatStore.getGroup(group) || {}
    const inviterName = contactStore.getUCUser(inviter)?.name
    return {
      id: id,
      name,
      inviter: inviterName || inviter,
    }
  }
  // TODO: rejected but existed in chat home => error when click.
  reject = group => {
    uc.leaveChatGroup(group)
      .then(this.onRejectSuccess)
      .catch(this.onRejectFailure)
  }
  onRejectSuccess = res => {
    chatStore.removeGroup(res.id)
  }
  onRejectFailure = err => {
    g.showError({
      message: intlDebug`Failed to reject the group chat`,
      err,
    })
  }
  accept = group => {
    this.loading = true
    uc.joinChatGroup(group)
      .then(this.onAcceptSuccess)
      .catch(this.onAcceptFailure)
  }
  onAcceptSuccess = () => {
    this.loading = false
  }
  onAcceptFailure = err => {
    g.showError({
      message: intlDebug`Failed to accept the group chat`,
      err,
    })
  }

  render() {
    return this.groupIds.map(group => (
      <Notify
        key={group}
        {...this.formatGroup(group)}
        accept={this.accept}
        reject={this.reject}
        type="inviteChat"
        loading={this.loading}
      />
    ))
  }
}

@observer
class UnreadChatNoti extends React.Component {
  @observable unreadChat: null | {
    id: string
    isGroup: boolean
    lastMessage: {
      text: string
      created: number
    }
  } = null
  alreadyShowNoti = {}
  prevLastMessageId = ''
  prevUnreadChatTimeoutId = 0

  componentDidMount() {
    this.updateLatestUnreadChat()
  }

  componentDidUpdate() {
    this.updateLatestUnreadChat()
  }

  updateLatestUnreadChat = () => {
    if (this.unreadChat) {
      return
    }
    let unreadChats = Object.entries(chatStore.threadConfig)
      .filter(
        ([k, v]) =>
          (v as any).isUnread && chatStore.messagesByThreadId[k]?.length,
      )
      .map(([k, v]) => ({
        ...(v as any),
        lastMessage:
          chatStore.messagesByThreadId[k][
            chatStore.messagesByThreadId[k].length - 1
          ],
      }))
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
      const s = g.stacks[g.stacks.length - 1]
      if (!s) {
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
    this.prevUnreadChatTimeoutId = window.setTimeout(this.clear, 5000)
  }
  @action clear = () => {
    if (this.prevUnreadChatTimeoutId) {
      clearTimeout(this.prevUnreadChatTimeoutId)
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
      ? g.goToPageChatGroupDetail({ groupId: id })
      : g.goToPageChatDetail({ buddy: id })
  }

  componentWillUnmount() {
    this.clear()
  }

  render() {
    Object.values(chatStore.threadConfig).forEach((v: any) => {
      Object.values(v).forEach((v2: any) => {
        void v2
      })
    })
    Object.values(chatStore.messagesByThreadId).forEach((v: any) => {
      void v.id
    })
    void g.stacks[g.stacks.length - 1]
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
        <TouchableOpacity
          style={css.NotifyUnreadBtn}
          onPress={this.onUnreadPress}
        >
          <UserItem
            key={id}
            {...(isGroup
              ? chatStore.groups.find(g => g.id === id)
              : contactStore.ucUsers.find(u => u.id === id))}
            lastMessage={text}
            isRecentChat
            lastMessageDate={formatDateTimeSemantic(created)}
          />
        </TouchableOpacity>
      </View>
    )
  }
}

export { UnreadChatNoti }
export default ChatGroupInvite
