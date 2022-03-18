import { observer } from 'mobx-react'
import React, { FC } from 'react'
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
      renderItem={({ item }: { item: UcBuddy }) => (
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
                userStore.selectedUserIds.some(itm => itm === item.user_id)
              }
              onSelect={() => userStore.selectUserId(item.user_id)}
              isSelection
            />
          </RnTouchableOpacity>
        </View>
      )}
      keyExtractor={item => item.user_id}
    />
    {/* {p.data.map(u => (
      <View key={u.user_id}>
        <RnTouchableOpacity
          onPress={() => userStore.selectUserId(u.user_id)}
          disabled={userStore.isSelectedAddAllUser}
        >
          <UserItem
            id={u.user_id}
            name={u.name || u.user_id}
            avatar={u.profile_image_url}
            disabled={userStore.isSelectedAddAllUser}
            isSelected={
              userStore.isSelectedAddAllUser ||
              userStore.selectedUserIds.some(itm => itm === u.user_id)
            }
            onSelect={() => userStore.selectUserId(u.user_id)}
            isSelection
          />
        </RnTouchableOpacity>
      </View>
    ))} */}
  </View>
))
