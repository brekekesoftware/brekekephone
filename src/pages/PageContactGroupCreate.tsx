import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'

import { UcBuddy } from '../api/brekekejs'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { SelectionItem } from '../components/SelectionItem'
import { v } from '../components/variables'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
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
export class PageContactGroupCreate extends Component {
  state: {
    name: string
    selectedUsers: UcBuddy[]
  } = {
    name: '',
    selectedUsers: [],
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
        {/* <ContactList data={userStore.listUserNotSelected} /> */}
        {userStore.dataListAllUser.map((item, index) => (
          <View
            style={css.container}
            key={`ContactListUser-${item.user_id}-${index}`}
          >
            <SelectionItem
              isSelected={this.state.selectedUsers.some(
                selectedUser => selectedUser.user_id === item.user_id,
              )}
              onPress={() => this.selectItem(item)}
              title={item.name || item.user_id}
            />
          </View>
        ))}
      </Layout>
    )
  }

  selectItem = (item: UcBuddy) => {
    const { selectedUsers } = this.state
    const cloneSelected = [...selectedUsers]
    if (selectedUsers.some(u => u.user_id === item.user_id)) {
      const index = selectedUsers.indexOf(item)
      cloneSelected.splice(index, 1)
      this.setState({
        selectedUsers: cloneSelected,
      })
    } else {
      cloneSelected.push(item)
      this.setState({
        selectedUsers: cloneSelected,
      })
    }
  }

  setName = (name: string) => {
    this.setState({
      name,
    })
  }

  create = () => {
    const { name, selectedUsers } = this.state

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

    userStore.addGroup(name, selectedUsers)
    RnDropdownSectionList.addSection()
    Nav().backToPageContactEdit()
  }
}
