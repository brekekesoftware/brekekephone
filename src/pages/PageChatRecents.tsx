import orderBy from 'lodash/orderBy'
import uniqBy from 'lodash/uniqBy'
import { observer } from 'mobx-react'
import React from 'react'
import { Group } from 'react-native'

import ListUsers from '../components/ChatListUsers'
import Field from '../components/Field'
import Layout from '../components/Layout'
import { RnText } from '../components/Rn'
import { getAuthStore } from '../stores/authStore'
import chatStore, { ChatMessage } from '../stores/chatStore'
import contactStore, { UcUser } from '../stores/contactStore'
import intl from '../stores/intl'
import Nav from '../stores/Nav'
import profileStore from '../stores/profileStore'
import { formatChatContent } from '../utils/formatChatContent'
import { arrToMap } from '../utils/toMap'

@observer
class PageChatRecents extends React.Component {
  getLastChat = (id: string) => {
    const chats = chatStore.messagesByThreadId[id] || []
    return chats.length !== 0 ? chats[chats.length - 1] : ({} as ChatMessage)
  }
  render() {
    const groupIds = chatStore.groups.filter(g => g.jointed).map(g => g.id)
    const threadIds = chatStore.threadIdsOrderedByRecent
    const groupById = arrToMap(chatStore.groups, 'id', (g: Group) => g) as {
      [k: string]: Group
    }
    const userById = arrToMap(contactStore.ucUsers, 'id', (u: UcUser) => u) as {
      [k: string]: UcUser
    }

    const recentFromStorage = getAuthStore().currentData.recentChats.filter(
      c => groupIds.indexOf(c.id) < 0 && threadIds.indexOf(c.id) < 0,
    )

    type WithThreadId = {
      threadId: string
    }
    type ChatFromStorage = typeof recentFromStorage[0] & WithThreadId
    type ChatWithThreadId = ChatMessage & WithThreadId

    const recentGroups = (recentFromStorage.filter(
      c => c.group,
    ) as unknown) as ChatWithThreadId[]
    recentGroups.push(
      ...groupIds.map(id => ({ ...this.getLastChat(id), threadId: id })),
    )

    const recentUsers = (recentFromStorage.filter(
      c => !c.group,
    ) as unknown) as ChatWithThreadId[]
    recentUsers.push(
      ...threadIds.map(id => ({ ...this.getLastChat(id), threadId: id })),
    )

    const fn = (group: boolean) => (c0: ChatWithThreadId) => {
      const c = (c0 as unknown) as ChatFromStorage
      const id = typeof c.group === 'boolean' ? c.id : c.threadId
      const x = (group ? groupById : userById)[id] as {
        name: string
      }
      const name: string = x?.name || c.name || ''
      let unread = chatStore.getThreadConfig(id).isUnread
      if (typeof unread !== 'boolean') {
        unread = c.unread || false
      }
      const { text, isTextOnly } = formatChatContent(c)
      return {
        id,
        name,
        text,
        type: isTextOnly ? 1 : c.type,
        group: !!group,
        unread,
        created: c.created,
      }
    }
    let arr = [...recentGroups.map(fn(true)), ...recentUsers.map(fn(false))]
    arr = uniqBy(arr, 'id')
    arr = orderBy(arr, 'created').reverse()

    window.setTimeout(() => {
      // Not show other message content type different than normal text chat
      const arr2 = [...arr].filter(c => c.type === 1)
      while (arr2.length > 20) {
        arr2.pop()
      }
      getAuthStore().currentData.recentChats = arr2
      profileStore.saveProfilesToLocalStorage()
    })

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
          onGroupSelect={(groupId: string) =>
            Nav().goToPageChatGroupDetail({ groupId })
          }
          userById={userById}
          onUserSelect={(id: string) => Nav().goToPageChatDetail({ buddy: id })}
        />
      </Layout>
    )
  }
}

export default PageChatRecents
