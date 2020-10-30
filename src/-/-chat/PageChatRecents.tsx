import stringify from 'json-stable-stringify'
import orderBy from 'lodash/orderBy'
import uniqBy from 'lodash/uniqBy'
import { observer } from 'mobx-react'
import React from 'react'

import g from '../global'
import authStore from '../global/authStore'
import chatStore from '../global/chatStore'
import contactStore from '../global/contactStore'
import Nav from '../global/Nav'
import intl from '../intl/intl'
import { RnText } from '../Rn'
import Field from '../shared/Field'
import Layout from '../shared/Layout'
import { arrToMap } from '../utils/toMap'
import ListUsers from './ListUsers'

@observer
class PageChatRecents extends React.Component {
  getLastChat = id => {
    const chats = chatStore.messagesByThreadId[id] || []
    return chats.length !== 0 ? chats[chats.length - 1] : {}
  }
  render() {
    const groupIds = chatStore.groups.filter(g => g.jointed).map(g => g.id)
    const threadIds = chatStore.threadIdsOrderedByRecent
    const groupById = arrToMap(chatStore.groups, 'id', g => g)
    const userById = arrToMap(contactStore.ucUsers, 'id', u => u)

    const recentFromStorage = authStore.currentData.recentChats.filter(
      c => groupIds.indexOf(c.id) < 0 && threadIds.indexOf(c.id) < 0,
    )

    const recentGroups = recentFromStorage.filter(c => c.group)
    recentGroups.push(
      ...groupIds.map(id => ({ ...this.getLastChat(id), threadId: id })),
    )

    const recentUsers = recentFromStorage.filter(c => !c.group)
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
        g.saveProfilesToLocalStorage()
      }
    })

    return (
      <Layout
        description={intl`UC recent active chat`}
        dropdown={[
          {
            label: intl`Create group chat`,
            onPress: Nav.goToPageChatGroupCreate,
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
          onGroupSelect={groupId => Nav.goToPageChatGroupDetail({ groupId })}
          userById={userById}
          onUserSelect={id => Nav.goToPageChatDetail({ buddy: id })}
        />
      </Layout>
    )
  }
}

export default PageChatRecents
