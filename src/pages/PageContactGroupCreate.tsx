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
    data: UcBuddy[]
    selectedIds: string[]
  } = {
    name: '',
    data: userStore.dataListAllUser,
    selectedIds: [],
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
        {this.state.data.map((item, index) => (
          <View
            style={css.container}
            key={`ContactListUser-${item.user_id}-${index}`}
          >
            <SelectionItem
              isSelected={this.state.selectedIds.some(
                id => id === item.user_id,
              )}
              onPress={() => this.selectItem(item.user_id)}
              title={item.name || item.user_id}
            />
          </View>
        ))}
      </Layout>
    )
  }

  selectItem = (id: string) => {
    const cloneSelectedIds = [...this.state.selectedIds]
    const i = cloneSelectedIds.indexOf(id)
    if (i < 0) {
      cloneSelectedIds.push(id)
    } else {
      cloneSelectedIds.splice(i, 1)
    }
    this.setState({ selectedIds: cloneSelectedIds })
  }

  setName = (name: string) => {
    this.setState({
      name,
    })
  }

  create = () => {
    const { name, selectedIds } = this.state

    if (!name.trim()) {
      RnAlert.error({
        message: intlDebug`Group name is required`,
      })
      return
    }
    userStore.addGroup(name, selectedIds)
    Nav().backToPageContactEdit()
  }
}
