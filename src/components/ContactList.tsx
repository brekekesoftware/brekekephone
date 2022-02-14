import { observer } from 'mobx-react'
import React, { FC } from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { UcBuddy } from '../api/brekekejs'
import { userStore } from '../stores/userStore'
import { UserItem } from './ContactUserItem'
import { RnTouchableOpacity } from './RnTouchableOpacity'

const css = StyleSheet.create({
  container: {},
})

type ContactListProps = {
  data: UcBuddy[]
}

export const ContactList: FC<ViewProps & ContactListProps> = observer(p => {
  const renderItemListUser = (item: UcBuddy) => {
    return (
      <View style={css.container} key={`ContactListUser-${item.user_id}`}>
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
    )
  }
  return <View>{p.data.map(user => renderItemListUser(user))}</View>
})
