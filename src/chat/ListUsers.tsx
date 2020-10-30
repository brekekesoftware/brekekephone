import { observer } from 'mobx-react'
import React from 'react'
import { StyleSheet } from 'react-native'

import UserItem from '../contact/UserItem'
// import intl from '../intl/intl'
import chatStore from '../global/chatStore'
import { RnTouchableOpacity } from '../Rn'
import g from '../variables'
import { formatDateTimeSemantic } from './config'

const css = StyleSheet.create({
  Unread: {
    backgroundColor: g.colors.primaryFn(0.5),
  },
})

const ListUsers = p => (
  <React.Fragment>
    {p.recents.map(({ id, name, group, text, unread, created }) => (
      <RnTouchableOpacity
        key={id}
        onPress={() => (group ? p.onGroupSelect(id) : p.onUserSelect(id))} // TODO group
        style={(unread || chatStore.getThreadConfig(id).isUnread) && css.Unread}
      >
        <UserItem
          key={id}
          name={name}
          {...(group ? p.groupById : p.userById)[id]}
          lastMessage={text}
          isRecentChat
          lastMessageDate={formatDateTimeSemantic(created)}
        />
      </RnTouchableOpacity>
    ))}
  </React.Fragment>
)

export default observer(ListUsers)
