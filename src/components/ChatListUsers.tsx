import { observer } from 'mobx-react'
import React, { FC } from 'react'
import { StyleSheet } from 'react-native'

// import intl from '../stores/intl'
import chatStore from '../stores/chatStore'
import { formatDateTimeSemantic } from './chatConfig'
import UserItem from './ContactUserItem'
import { RnTouchableOpacity } from './Rn'
import g from './variables'

const css = StyleSheet.create({
  Unread: {
    backgroundColor: g.colors.primaryFn(0.5),
  },
})

const ListUsers: FC<{
  recents: {
    id: string
    name: string
    group: boolean
    text: string
    unread: boolean
    created: string
  }[]
  onGroupSelect: Function
  onUserSelect: Function
  groupById: { [k: string]: object }
  userById: { [k: string]: object }
}> = p => (
  <>
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
  </>
)

export default observer(ListUsers)
