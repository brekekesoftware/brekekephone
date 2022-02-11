import { observer } from 'mobx-react'
import React, { FC } from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { UcBuddy } from '../api/brekekejs'
import { userStore } from '../stores/userStore'
import { SelectionItem } from './SelectionItem'
import { v } from './variables'

const css = StyleSheet.create({
  container: {
    borderBottomColor: v.borderBg,
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
})

type ContactListProps = {
  data: UcBuddy[]
}

export const ContactList: FC<ViewProps & ContactListProps> = observer(p => {
  const renderItemListUser = (item: UcBuddy) => {
    return (
      <View style={css.container} key={`ContactListUser-${item.user_id}`}>
        <SelectionItem
          isSelected={
            userStore.isSelectedAddAllUser ||
            userStore.selectedUserIds.some(itm => itm === item.user_id)
          }
          onPress={() => userStore.selectUserId(item.user_id)}
          title={item.name || item.user_id}
          disabled={userStore.isSelectedAddAllUser}
        />
      </View>
    )
  }
  return <View>{p.data.map(user => renderItemListUser(user))}</View>
})
