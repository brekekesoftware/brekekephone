import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'

import type { UcBuddy } from '#/brekekejs'
import { UserItem } from '#/components/ContactUserItem'
import { Field } from '#/components/Field'
import { Layout } from '#/components/Layout'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { css } from '#/pages/PageContactEdit'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnDropdown } from '#/stores/RnDropdown'
import { userStore } from '#/stores/userStore'
import { BackgroundTimer } from '#/utils/BackgroundTimer'

@observer
export class PageContactGroupEdit extends Component<{
  groupName: string
  listItem: UcBuddy[]
}> {
  @observable selectedUserItems: { [k: string]: UcBuddy } = {}
  state = {
    didMount: false,
  }
  componentDidMount = () => {
    this.props.listItem.forEach(u => {
      if (userStore.selectedUserIds[u.user_id]) {
        this.selectedUserItems[u.user_id] = u
      }
    })
    BackgroundTimer.setTimeout(() => this.setState({ didMount: true }), 300)
  }

  render() {
    return (
      <Layout
        fabOnBack={ctx.nav.goToPageContactEdit}
        fabOnNext={this.create}
        fabOnNextText={intl`SAVE`}
        onBack={ctx.nav.backToPageContactEdit}
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
                selectedUsers={this.selectedUserItems}
              />
            )}
            keyExtractor={item => item.user_id}
          />
        )}
      </Layout>
    )
  }

  @action selectUser = (item: UcBuddy) => {
    if (this.selectedUserItems[item.user_id]) {
      delete this.selectedUserItems[item.user_id]
    } else {
      this.selectedUserItems[item.user_id] = item
    }
  }

  create = () => {
    const listItemRemoved = this.props.listItem.filter(
      itm => !this.selectedUserItems[itm.user_id],
    )
    userStore.editGroup(
      this.props.groupName,
      listItemRemoved,
      this.selectedUserItems,
    )
    RnDropdown.setShouldUpdatePosition(true)
    ctx.nav.backToPageContactEdit()
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
    selectedUsers: { [k: string]: UcBuddy }
  }) => {
    const selectUser = action((i: UcBuddy) => {
      if (selectedUsers[item.user_id]) {
        delete selectedUsers[item.user_id]
      } else {
        selectedUsers[item.user_id] = item
      }
    })
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
            isSelected={!!selectedUsers[item.user_id]}
            onSelect={() => selectUser(item)}
            isSelection
          />
        </RnTouchableOpacity>
      </View>
    )
  },
)
