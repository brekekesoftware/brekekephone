import { observer } from 'mobx-react'
import type { FC } from 'react'
import { StyleSheet } from 'react-native'

// import {intl} from '../stores/intl'
import { chatStore } from '../stores/chatStore'
import { getPartyName } from '../stores/contactStore'
import { formatDateTimeSemantic } from './chatConfig'
import { UserItem } from './ContactUserItem'
import { RnTouchableOpacity } from './Rn'
import { v } from './variables'

const css = StyleSheet.create({
  Unread: {
    backgroundColor: v.colors.primaryFn(0.5),
  },
})

export const ListUsers: FC<{
  recents: {
    id: string
    name: string
    group: boolean
    text: string
    unread: boolean
    created: string
  }[]
  onGroupSelect: Function
  onUserSelect: (id: string) => void
  groupById: { [k: string]: object }
  userById: { [k: string]: object }
}> = observer(p => (
  <>
    {p.recents.map(({ id, name, group, text, unread, created }) => (
      <RnTouchableOpacity
        key={id}
        onPress={() => (group ? p.onGroupSelect(id) : p.onUserSelect(id))} // TODO group
        style={(unread || chatStore.getThreadConfig(id).isUnread) && css.Unread}
      >
        <UserItem
          key={id}
          name={name || getPartyName({ partyNumber: id, preferPbxName: true })}
          {...(group ? p.groupById : p.userById)[id]}
          lastMessage={text}
          group={group}
          isRecentChat
          lastMessageDate={formatDateTimeSemantic(created)}
        />
      </RnTouchableOpacity>
    ))}
  </>
))
