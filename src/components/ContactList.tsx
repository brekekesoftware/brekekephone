import { observer } from 'mobx-react'
import type { FC } from 'react'
import { FlatList, View } from 'react-native'

import type { UcBuddy } from '#/brekekejs'
import { UserItem } from '#/components/ContactUserItem'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { ctx } from '#/stores/ctx'

type ContactListProps = {
  data: UcBuddy[]
}

export const ContactList: FC<ContactListProps> = observer(p => (
  <View>
    <FlatList
      data={p.data}
      renderItem={({ item }: { item: UcBuddy }) => <RenderItem item={item} />}
      keyExtractor={item => item.user_id}
    />
  </View>
))

const RenderItem = observer(({ item }: { item: UcBuddy }) => (
  <View key={item.user_id}>
    <RnTouchableOpacity
      onPress={() => ctx.user.selectUserId(item.user_id)}
      disabled={ctx.user.isSelectedAddAllUser}
    >
      <UserItem
        id={item.user_id}
        name={item.name || item.user_id}
        avatar={item.profile_image_url}
        disabled={ctx.user.isSelectedAddAllUser}
        isSelected={
          ctx.user.isSelectedAddAllUser ||
          ctx.user.selectedUserIds[item.user_id]
        }
        onSelect={() => ctx.user.selectUserId(item.user_id)}
        isSelection
      />
    </RnTouchableOpacity>
  </View>
))
