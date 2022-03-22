import { observable } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'

import { UcBuddy } from '../api/brekekejs'
import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnDropdownSectionList } from '../stores/RnDropdownSectionList'
import { userStore } from '../stores/userStore'
import { css } from './PageContactEdit'

@observer
export class PageContactGroupEdit extends Component<{
  groupName: string
  listItem: UcBuddy[]
}> {
  @observable selectedUsers: { [k: string]: boolean } = {}

  state = {
    didMount: false,
  }
  componentDidMount() {
    this.props.listItem.forEach(u => {
      if (userStore.selectedUserIds[u.user_id]) {
        this.selectedUsers[u.user_id] = true
      }
    })
    setTimeout(() => this.setState({ didMount: true }), 300)
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
        {!this.state.didMount ? (
          <ActivityIndicator size='large' />
        ) : (
          <FlatList
            data={userStore.dataListAllUser}
            renderItem={({ item, index }: { item: UcBuddy; index: number }) => (
              <RenderItem
                item={item}
                index={index}
                selectedUsers={this.selectedUsers}
              />
            )}
            keyExtractor={item => item.user_id}
          />
        )}
      </Layout>
    )
  }

  selectUser = (item: UcBuddy) => {
    this.selectedUsers[item.user_id] = !this.selectedUsers[item.user_id]
  }

  create = () => {
    const listItemRemoved = this.props.listItem.filter(
      itm => !this.selectedUsers[itm.user_id],
    )
    const selectedUsers = userStore.dataListAllUser.filter(
      itm => this.selectedUsers[itm.user_id],
    )
    userStore.editGroup(this.props.groupName, selectedUsers, listItemRemoved)
    RnDropdownSectionList.setIsShouldUpdateDropdownPosition(true)
    Nav().backToPageContactEdit()
  }
}

const RenderItem = observer(
  ({
    item,
    index,
    selectedUsers,
  }: {
    item: UcBuddy
    index: number
    selectedUsers: { [k: string]: boolean }
  }) => {
    const selectUser = (i: UcBuddy) => {
      selectedUsers[i.user_id] = !selectedUsers[i.user_id]
    }
    return (
      <View key={`PageContactGroupEdit-${item.user_id}-${index}`}>
        <RnTouchableOpacity
          style={css.loadingIcon}
          onPress={() => selectUser(item)}
        >
          <UserItem
            id={item.user_id}
            name={item.name || item.user_id}
            avatar={item.profile_image_url}
            isSelected={selectedUsers[item.user_id]}
            onSelect={() => selectUser(item)}
            isSelection
          />
        </RnTouchableOpacity>
      </View>
    )
  },
)
