import { observer } from 'mobx-react'
import { FC } from 'react'
import { FlatList, View } from 'react-native'

import { UcBuddy } from '../api/brekekejs'
import { userStore } from '../stores/userStore'
import { UserItem } from './ContactUserItem'
import { RnTouchableOpacity } from './RnTouchableOpacity'

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

const RenderItem = observer(({ item }: { item: UcBuddy }) => {
  return (
    <View key={item.user_id}>
      <RnTouchableOpacity
        onPress={() => userStore.selectUserId(item.user_id)}
        disabled={userStore.isSelectedAddAllUser}
      >
        <UserItem
          id={item.user_id}
          name={item.name || item.user_id}
          avatar={item.profile_image_url}
          disabled={userStore.isSelectedAddAllUser}
          isSelected={
            userStore.isSelectedAddAllUser ||
            userStore.selectedUserIds[item.user_id]
          }
          onSelect={() => userStore.selectUserId(item.user_id)}
          isSelection
        />
      </RnTouchableOpacity>
    </View>
  )
})
