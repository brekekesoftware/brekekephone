import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'
import { FlatList, View } from 'react-native'

import type { UcBuddy } from '#/brekekejs'
import { UserItem } from '#/components/contact-user-item'
import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { RnActivityIndicator } from '#/components/rn-activity-indicator'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { defaultTimeout } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { RnDropdown } from '#/stores/rn-dropdown'
import { BackgroundTimer } from '#/utils/background-timer'

export const PageContactGroupCreate = observer(
  class PageContactGroupCreate extends Component<
    {},
    {
      name: string
      didMount: boolean
      selectedUserItems: { [k: string]: UcBuddy }
    }
  > {
    state = {
      name: '',
      didMount: false,
      selectedUserItems: {} as { [k: string]: UcBuddy },
    }
    componentDidMount = () => {
      BackgroundTimer.setTimeout(
        () => this.setState({ didMount: true }),
        defaultTimeout,
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
            <RnActivityIndicator
              className='mt-5 h-9 w-9 self-center'
              size='small'
            />
          ) : (
            <FlatList
              data={ctx.user.dataListAllUser}
              renderItem={({
                item,
                index,
              }: {
                item: UcBuddy
                index: number
              }) => (
                <RenderItem
                  item={item}
                  index={index}
                  selectedUsers={this.state.selectedUserItems}
                  onToggle={this.toggleUser}
                />
              )}
              keyExtractor={item => item.user_id}
            />
          )}
        </Layout>
      )
    }

    setName = (name: string) => this.setState({ name })

    toggleUser = (user: UcBuddy) => {
      this.setState(prev => {
        const next = { ...prev.selectedUserItems }
        if (next[user.user_id]) {
          delete next[user.user_id]
        } else {
          next[user.user_id] = user
        }
        return { selectedUserItems: next }
      })
    }

    create = () => {
      const { name, selectedUserItems } = this.state

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
      ctx.user.addGroup(name, selectedUserItems)
      RnDropdown.setShouldUpdatePosition(true)
      ctx.nav.backToPageContactEdit()
    }
  },
)

const RenderItem = observer(
  ({
    item,
    index,
    selectedUsers,
    onToggle,
  }: {
    item: UcBuddy
    index: number
    selectedUsers: { [k: string]: UcBuddy }
    onToggle: (user: UcBuddy) => void
  }) => (
    <View key={`PageContactGroupCreate-${item.user_id}-${index}`}>
      <RnTouchableOpacity onPress={() => onToggle(item)}>
        <UserItem
          id={item.user_id}
          name={item.name || item.user_id}
          avatar={item.profile_image_url}
          isSelected={!!selectedUsers[item.user_id]}
          onSelect={() => onToggle(item)}
          isSelection
        />
      </RnTouchableOpacity>
    </View>
  ),
)
