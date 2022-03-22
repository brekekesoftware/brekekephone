import { observable } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { ActivityIndicator, View } from 'react-native'

import { UcBuddy } from '../api/brekekejs'
import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
import { RnDropdownSectionList } from '../stores/RnDropdownSectionList'
import { userStore } from '../stores/userStore'
import { css } from './PageContactEdit'

@observer
export class PageContactGroupCreate extends Component {
  @observable selectedUsers: { [k: string]: boolean } = {}

  state = {
    name: '',
    didMount: false,
  }
  componentDidMount() {
    setTimeout(() => this.setState({ didMount: true }), 300)
  }

  render() {
    return (
      <Layout
        fabOnBack={Nav().goToPageContactEdit}
        fabOnNext={this.create}
        fabOnNextText={intl`CREATE`}
        onBack={Nav().backToPageContactEdit}
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
          userStore.dataListAllUser.map((item, index) => (
            <View key={`ContactListUser-${item.user_id}-${index}`}>
              <RnTouchableOpacity onPress={() => this.selectUser(item)}>
                <UserItem
                  id={item.user_id}
                  name={item.name || item.user_id}
                  avatar={item.profile_image_url}
                  isSelected={this.selectedUsers[item.user_id]}
                  onSelect={() => this.selectUser(item)}
                  isSelection
                />
              </RnTouchableOpacity>
            </View>
          ))
        )}
      </Layout>
    )
  }

  selectUser = (item: UcBuddy) => {
    this.selectedUsers[item.user_id] = !this.selectedUsers[item.user_id]
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
    } else if (userStore.groups.some(group => group.name === name.trim())) {
      RnAlert.error({
        message: intlDebug`Group name is existed`,
      })
      return
    }
    const selectedUsers = userStore.dataListAllUser.filter(
      u => this.selectedUsers[u.user_id],
    )
    userStore.addGroup(name, selectedUsers)
    RnDropdownSectionList.setIsShouldUpdateDropdownPosition(true)
    Nav().backToPageContactEdit()
  }
}
