import stringify from 'json-stable-stringify'
import orderBy from 'lodash/orderBy'
import uniqBy from 'lodash/uniqBy'
import { observer } from 'mobx-react'
import React from 'react'

import ListUsers from '../components/ChatListUsers'
import Field from '../components/Field'
import Layout from '../components/Layout'
import { RnText } from '../components/Rn'
import authStore from '../stores/authStore'
import chatStore, { ChatMessage } from '../stores/chatStore'
import contactStore from '../stores/contactStore'
import intl from '../stores/intl'
import Nav from '../stores/Nav'
import profileStore from '../stores/profileStore'
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
    const groupById = arrToMap(chatStore.groups, 'id', g => g)
    const userById = arrToMap(contactStore.ucUsers, 'id', u => u)

    const recentFromStorage = authStore.currentData.recentChats.filter(
      c => groupIds.indexOf(c.id) < 0 && threadIds.indexOf(c.id) < 0,
    )
    type ChatWithThreadId = ChatMessage & {
      threadId: string
    }
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

    const fn = group => c => {
      const id = typeof c.group === 'boolean' ? c.id : c.threadId
      const name = (group ? groupById : userById)[id]?.name || c.name || ''
      let unread = chatStore.getThreadConfig(id).isUnread
      if (typeof unread !== 'boolean') {
        unread = c.unread || false
      }
      return {
        id,
        name,
        text: c.text || '',
        group: !!group,
        unread,
        created: c.created,
      }
    }
    let arr = [...recentGroups.map(fn(true)), ...recentUsers.map(fn(false))]
    arr = uniqBy(arr, 'id')
    arr = orderBy(arr, 'created').reverse()

    window.setTimeout(() => {
      const arr2 = [...arr]
      while (arr2.length > 20) {
        arr2.pop()
      }
      if (stringify(authStore.currentData.recentChats) !== stringify(arr2)) {
        authStore.currentData.recentChats = arr2
        profileStore.saveProfilesToLocalStorage()
      }
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
          onGroupSelect={groupId => Nav().goToPageChatGroupDetail({ groupId })}
          userById={userById}
          onUserSelect={id => Nav().goToPageChatDetail({ buddy: id })}
        />
      </Layout>
    )
  }
}

export default PageChatRecents
