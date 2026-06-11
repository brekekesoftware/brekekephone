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
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { BackgroundTimer } from '#/utils/background-timer'

export const PageContactGroupCreate = observer(() => {
  const [name, setName] = useState('')
  const [didMount, setDidMount] = useState(false)
  const mountTimerRef = useRef<number | undefined>(undefined)
  const [selectedUserItems, setSelectedUserItems] = useState<{
    [k: string]: UcBuddy
  }>({})

  useEffect(() => {
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

  const toggleUser = (user: UcBuddy) => {
    setSelectedUserItems(prev => {
      const next = {
        ...prev,
      }
      if (next[user.user_id]) {
        delete next[user.user_id]
      } else {
        next[user.user_id] = user
      }
      return next
    })
  }

  const create = () => {
    if (!name.trim()) {
      RnAlert.error({
        message: intlDebug`Group name is required`,
      })
      return
    } else if (ctx.user.groups.some(group => group.name === name.trim())) {
      RnAlert.error({
        message: intlDebug`Group name is existed`,
      })
      return
    }
    ctx.user.addGroup(name, selectedUserItems)
    ctx.nav.backToPageContactEdit()
  }

  return (
    <Layout
      fabOnBack={ctx.nav.backToPageContactEdit}
      fabOnNext={create}
      fabOnNextText={intl`CREATE`}
      onBack={ctx.nav.backToPageContactEdit}
      title={intl`New Group`}
    >
      <Field label={intl`GROUP NAME`} onValueChange={setName} value={name} />
      <Field isGroup label={intl`Members`} />
      {!didMount ? (
        <RnActivityIndicator
          className='mt-5 h-9 w-9 self-center'
          size='small'
        />
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
})

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
    onToggle: (user: UcBuddy) => void
  }) => (
    <View key={`PageContactGroupCreate-${item.user_id}-${index}`}>
      <RnTouchableOpacity onPress={() => onToggle(item)}>
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
