import { uniqBy } from 'lodash'
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
    data: UcBuddy[]
    selectedIds: string[]
  } = {
    data: userStore.dataListAllUser,
    selectedIds: this.props.listItem.map(u => u.user_id),
  }

  render() {
    const displayUsers = uniqBy(
      [...this.props.listItem, ...this.state.data],
      'user_id',
    )

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
        {displayUsers.map((item, index) => (
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

  setName = (name: string) =>
    this.setState({
      name,
    })

  create = () => {
    const { selectedIds } = this.state

    userStore.editGroup(this.props.groupName, selectedIds)

    Nav().backToPageContactEdit()
  }
}
