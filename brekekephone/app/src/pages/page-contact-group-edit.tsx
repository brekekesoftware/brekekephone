import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'
import { FlatList, View } from 'react-native'

import type { UcBuddy } from '#/brekekejs'
import { UserItem } from '#/components/contact-user-item'
import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { RnActivityIndicator } from '#/components/rn-class-name-components'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { defaultTimeout } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { BackgroundTimer } from '#/utils/background-timer'

export const PageContactGroupEdit = observer(
  ({ groupName, listItem }: { groupName: string; listItem: UcBuddy[] }) => {
    const [didMount, setDidMount] = useState(false)
    const mountTimerRef = useRef<number | undefined>(undefined)
    const [selectedUserItems, setSelectedUserItems] = useState<{
      [k: string]: UcBuddy
    }>({})

    useEffect(() => {
      const items: { [k: string]: UcBuddy } = {}
      listItem.forEach(u => {
        if (ctx.user.selectedUserIds[u.user_id]) {
          items[u.user_id] = u
        }
      })
      setSelectedUserItems(items)
      mountTimerRef.current = BackgroundTimer.setTimeout(
        () => setDidMount(true),
        defaultTimeout,
      )
      return () => {
        if (mountTimerRef.current) {
          BackgroundTimer.clearTimeout(mountTimerRef.current)
        }
      }
    }, [])

    const toggleUser = (item: UcBuddy) => {
      setSelectedUserItems(prev => {
        const next = {
          ...prev,
        }
        if (next[item.user_id]) {
          delete next[item.user_id]
        } else {
          next[item.user_id] = item
        }
        return next
      })
    }

    const create = () => {
      const listItemRemoved = listItem.filter(
        itm => !selectedUserItems[itm.user_id],
      )
      ctx.user.editGroup(groupName, listItemRemoved, selectedUserItems)
      ctx.nav.backToPageContactEdit()
    }

    return (
      <Layout
        fabOnBack={ctx.nav.backToPageContactEdit}
        fabOnNext={create}
        fabOnNextText={intl`SAVE`}
        onBack={ctx.nav.backToPageContactEdit}
        title={intl`Add/Remove Contact`}
      >
        <Field label={intl`GROUP NAME`} value={groupName} disabled={true} />
        <Field isGroup label={intl`Members`} disabled={true} />
        {!didMount ? (
          <RnActivityIndicator className='h-10 w-10 self-center' size='large' />
        ) : (
          <FlatList
            data={ctx.user.dataListAllUser}
            renderItem={({ item, index }: { item: UcBuddy; index: number }) => (
              <RenderItem
                item={item}
                index={index}
                selectedUsers={selectedUserItems}
                onToggle={toggleUser}
              />
            )}
            keyExtractor={item => item.user_id}
          />
        )}
      </Layout>
    )
  },
)

const RenderItem = observer(
  ({
    item,
    index,
    selectedUsers,
    onToggle,
  }: {
    item: UcBuddy
    index: number
    selectedUsers: { [k: string]: UcBuddy }
    onToggle: (item: UcBuddy) => void
  }) => (
    <View key={`PageContactGroupEdit-${item.user_id}-${index}`}>
      <RnTouchableOpacity className='mt-5' onPress={() => onToggle(item)}>
        <UserItem
          id={item.user_id}
          name={item.name || item.user_id}
          avatar={item.profile_image_url}
          isSelected={!!selectedUsers[item.user_id]}
          onSelect={() => onToggle(item)}
          isSelection
        />
      </RnTouchableOpacity>
    </View>
  ),
)
