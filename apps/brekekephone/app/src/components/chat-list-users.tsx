import { observer } from 'mobx-react'
import type { FC } from 'react'

import { formatDateTimeSemantic } from '#/components/chat-config'
import { UserItem } from '#/components/contact-user-item'
import { RnTouchableOpacity } from '#/components/rn'
// import {intl} from '../stores/intl'
import { getPbxName } from '#/stores/contact-store'
import { ctx } from '#/stores/ctx'

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
    {p.recents.map(({ id, name, group, text, unread, created }) => {
      const isUnread = unread || ctx.chat.getThreadConfig(id).isUnread
      return (
        <RnTouchableOpacity
          key={id}
          onPress={() => (group ? p.onGroupSelect(id) : p.onUserSelect(id))} // TODO: group
          className={isUnread ? 'bg-primary-100 dark:bg-muted' : undefined}
        >
          <UserItem
            key={id}
            name={name || getPbxName({ partyNumber: id, preferPbxName: true })}
            {...(group ? p.groupById : p.userById)[id]}
            lastMessage={text}
            group={group}
            isRecentChat
            lastMessageDate={formatDateTimeSemantic(created)}
          />
        </RnTouchableOpacity>
      )
    })}
  </>
))
