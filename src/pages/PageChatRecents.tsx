import { orderBy, uniqBy } from 'lodash'
import { observer } from 'mobx-react'
import { Component } from 'react'

import type { UcMessageLog } from '../brekekejs'
import { Constants } from '../brekekejs/ucclient'
import { ListUsers } from '../components/ChatListUsers'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { RnText } from '../components/Rn'
import { accountStore } from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import type { ChatGroup, ChatMessage } from '../stores/chatStore'
import { chatStore } from '../stores/chatStore'
import type { UcUser } from '../stores/contactStore'
import { contactStore } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { arrToMap } from '../utils/arrToMap'
import { filterTextOnly, formatChatContent } from '../utils/formatChatContent'
import { jsonStable } from '../utils/jsonStable'

@observer
export class PageChatRecents extends Component {
  getLastChat = (id: string) => {
    const chats = filterTextOnly(chatStore.getMessagesByThreadId(id))
    return chats.length ? chats[chats.length - 1] : ({} as ChatMessage)
  }
  saveLastChatItem = async (
    arr: {
      id: string
      name: string
      text: string
      type: number
      group: boolean
      unread: boolean
      created: string
    }[],
  ) => {
    // not show other message content type different than normal text chat
    const arr2 = [...arr].filter(c => c?.created || c?.group)
    while (arr2.length > 20) {
      arr2.pop()
    }
    const d = await getAuthStore().getCurrentDataAsync()
    if (d && jsonStable(arr2) !== jsonStable(d.recentChats)) {
      d.recentChats = arr2
      accountStore.saveAccountsToLocalStorageDebounced()
    }
  }
  handleGroupSelect = async (groupId: string) => {
    chatStore.handleMoveToChatGroupDetail(groupId)
  }

  render() {
    const webchatInactive = chatStore.groups.filter(
      gr =>
        gr.webchat && gr.webchat.conf_status !== Constants.CONF_STATUS_JOINED,
    )

    const groupIds = chatStore.groups.filter(gr => gr.jointed).map(gr => gr.id)

    const threadIds = chatStore.threadIdsOrderedByRecent

    const groupById = arrToMap(chatStore.groups, 'id', (g: ChatGroup) => g) as {
      [k: string]: ChatGroup
    }
    const userById = arrToMap(contactStore.ucUsers, 'id', (u: UcUser) => u) as {
      [k: string]: UcUser
    }

    const as = getAuthStore()
    const ca = as.getCurrentAccount()
    const d = as.getCurrentData()
    if (!d && ca) {
      // trigger async update
      accountStore.findDataWithDefault(ca)
    }
    const recentFromStorage =
      d?.recentChats.filter(
        c => groupIds.indexOf(c.id) < 0 && threadIds.indexOf(c.id) < 0,
      ) || []
    type WithThreadId = {
      threadId: string
    }
    type ChatFromStorage = (typeof recentFromStorage)[0] & WithThreadId
    type ChatWithThreadId = ChatMessage & WithThreadId

    const recentGroups = recentFromStorage.filter(
      c => c.group,
    ) as any as ChatWithThreadId[]
    recentGroups.push(
      ...groupIds.map(id => ({ ...this.getLastChat(id), threadId: id })),
    )

    const recentUsers = recentFromStorage.filter(
      c => !c.group,
    ) as any as ChatWithThreadId[]
    recentUsers.push(
      ...threadIds.map(id => ({ ...this.getLastChat(id), threadId: id })),
    )

    const fn = (group: boolean) => (c0: ChatWithThreadId) => {
      const c = c0 as any as ChatFromStorage

      const id = typeof c.group === 'boolean' ? c.id : c.threadId
      const x = (group ? groupById : userById)[id] as {
        name: string
      }
      const name: string = x?.name || c.name || ''
      let unread = chatStore.getThreadConfig(id).isUnread
      if (typeof unread !== 'boolean') {
        unread = c.unread || false
      }
      // check webchat inactive
      const isWebchat = chatStore.isWebchat(id)
      const isWebchatJoined = chatStore.isWebchatJoined(id)
      if (isWebchat && !isWebchatJoined) {
        unread = true
      }
      const { text, isTextOnly } = formatChatContent(c)

      return {
        id,
        name,
        text,
        type: isTextOnly ? 1 : c.type || (c as any as UcMessageLog).ctype,
        group: !!group,
        unread,
        created: c.created,
      }
    }
    let arr = [...recentGroups.map(fn(true)), ...recentUsers.map(fn(false))]

    arr = filterTextOnly(arr)
    arr = uniqBy(arr, 'id')
    const arrMap = arr.reduce(
      (m, c) => {
        m[c.id] = true
        return m
      },
      {} as { [k: string]: boolean },
    )

    filterTextOnly(d?.recentChats).forEach(c => {
      if (!arrMap[c.id]) {
        arr.push(c)
      }
    })

    // don't display webchat
    arr = arr.filter(c => !webchatInactive.some(gr => gr.id === c.id))

    // when anyItem changes page will be render again => don't need timeout
    this.saveLastChatItem(arr)

    arr = orderBy(arr, ['created', 'name']).reverse()

    return (
      <Layout
        description={intl`UC recent active chat`}
        dropdown={[
          {
            label: intl`Create group chat`,
            onPress: Nav().goToPageChatGroupCreate,
          },
        ]}
        menu='contact'
        subMenu='chat'
        title={intl`Chat`}
      >
        <Field isGroup label={intl`RECENT CHAT THREADS`} />
        {!arr.length && (
          <RnText center normal small warning style={{ marginTop: 5 }}>
            {intl`There's no active chat thread`}
          </RnText>
        )}
        <ListUsers
          recents={arr}
          groupById={groupById}
          onGroupSelect={this.handleGroupSelect}
          userById={userById}
          onUserSelect={id => Nav().goToPageChatDetail({ buddy: id })}
        />
      </Layout>
    )
  }
}
