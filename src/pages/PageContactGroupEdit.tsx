import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { View } from 'react-native'

import { UcBuddy } from '../api/brekekejs'
import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnDropdownSectionList } from '../stores/RnDropdownSectionList'
import { userStore } from '../stores/userStore'

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
          <View key={`ContactListUser-${item.user_id}-${index}`}>
            <RnTouchableOpacity onPress={() => this.selectUser(item)}>
              <UserItem
                id={item.user_id}
                name={item.name || item.user_id}
                avatar={item.profile_image_url}
                isSelected={this.state.selectedUsers.some(
                  u => u.user_id === item.user_id,
                )}
                onSelect={() => this.selectUser(item)}
                isSelection
              />
            </RnTouchableOpacity>
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
