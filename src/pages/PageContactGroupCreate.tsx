import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'

import type { UcBuddy } from '#/brekekejs'
import { UserItem } from '#/components/ContactUserItem'
import { Field } from '#/components/Field'
import { Layout } from '#/components/Layout'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { DEFAULT_TIMEOUT } from '#/config'
import { css } from '#/pages/PageContactEdit'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { RnDropdown } from '#/stores/RnDropdown'
import { BackgroundTimer } from '#/utils/BackgroundTimer'

@observer
export class PageContactGroupCreate extends Component {
  @observable selectedUserItems: { [k: string]: UcBuddy } = {}

  state = {
    name: '',
    didMount: false,
  }
  componentDidMount = () => {
    BackgroundTimer.setTimeout(
      () => this.setState({ didMount: true }),
      DEFAULT_TIMEOUT,
    )
  }

  render() {
    return (
      <Layout
        fabOnBack={ctx.nav.goToPageContactEdit}
        fabOnNext={this.create}
        fabOnNextText={intl`CREATE`}
        onBack={ctx.nav.backToPageContactEdit}
        title={intl`New Group`}
      >
        <Field
          label={intl`GROUP NAME`}
          onValueChange={this.setName}
          value={this.state.name}
        />
        <Field isGroup label={intl`Members`} />
        {!this.state.didMount ? (
          <ActivityIndicator style={css.loadingIcon} size='large' />
        ) : (
          <FlatList
            data={ctx.user.dataListAllUser}
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

  setName = (name: string) =>
    this.setState({
      name,
    })

  create = () => {
    const { name } = this.state

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
    // const selectedUsers = userStore.dataListAllUser.filter(
    //   u => this.selectedUsers[u.user_id],
    // )
    ctx.user.addGroup(name, this.selectedUserItems)
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
      if (selectedUsers[i.user_id]) {
        delete selectedUsers[item.user_id]
      } else {
        selectedUsers[i.user_id] = i
      }
    })
    return (
      <View key={`PageContactGroupCreate-${item.user_id}-${index}`}>
        <RnTouchableOpacity onPress={() => selectUser(item)}>
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
