import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'

import { UcBuddy } from '../api/brekekejs'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { SelectionItem } from '../components/SelectionItem'
import { v } from '../components/variables'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnDropdownSectionList } from '../stores/RnDropdownSectionList'
import { userStore } from '../stores/userStore'

const css = StyleSheet.create({
  container: {
    borderBottomColor: v.borderBg,
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
})

@observer
export class PageContactGroupEdit extends Component<{
  groupName: string
  listItem: UcBuddy[]
}> {
  state: {
    selectedUsers: UcBuddy[]
  } = {
    selectedUsers: this.props.listItem,
  }

  render() {
    return (
      <Layout
        fabOnBack={Nav().goToPageContactEdit}
        fabOnNext={this.create}
        fabOnNextText={intl`SAVE`}
        onBack={Nav().backToPageContactEdit}
        title={intl`Add/Remove Contact`}
      >
        <Field
          label={intl`GROUP NAME`}
          value={this.props.groupName}
          disabled={true}
        />
        <Field isGroup label={intl`Members`} disabled={true} />
        {userStore.dataListAllUser.map((item, index) => (
          <View
            style={css.container}
            key={`ContactListUser-${item.user_id}-${index}`}
          >
            <SelectionItem
              isSelected={this.state.selectedUsers.some(
                u => u.user_id === item.user_id,
              )}
              onPress={() => this.selectUser(item)}
              title={item.name || item.user_id}
            />
          </View>
        ))}
      </Layout>
    )
  }

  selectUser = (item: UcBuddy) => {
    const { selectedUsers } = this.state
    this.setState({
      selectedUsers: selectedUsers.some(u => u.user_id === item.user_id)
        ? selectedUsers.filter(u => u.user_id !== item.user_id)
        : [...selectedUsers, item],
    })
  }

  setName = (name: string) =>
    this.setState({
      name,
    })

  create = () => {
    const { selectedUsers } = this.state

    const listItemRemoved = this.props.listItem.filter(
      itm => !selectedUsers.some(u => u.user_id === itm.user_id),
    )

    userStore.editGroup(this.props.groupName, selectedUsers, listItemRemoved)
    RnDropdownSectionList.setIsShouldUpdateDropdownPosition(true)
    Nav().backToPageContactEdit()
  }
}
