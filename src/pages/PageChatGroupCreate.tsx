import { computed } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'

import { uc } from '../api/uc'
import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { RnTouchableOpacity } from '../components/Rn'
import { chatStore } from '../stores/chatStore'
import { contactStore, UcUser } from '../stores/contactStore'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
import { arrToMap } from '../utils/toMap'

@observer
export class PageChatGroupCreate extends Component {
  @computed get buddyIds() {
    return contactStore.ucUsers.map(u => u.id)
  }
  @computed get buddyById() {
    return arrToMap(contactStore.ucUsers, 'id', (u: UcUser) => u) as {
      [k: string]: UcUser
    }
  }

  state: {
    name: string
    members: string[]
  } = {
    name: '',
    members: [],
  }

  render() {
    return (
      <Layout
        fabOnBack={Nav().goToPageChatRecents}
        fabOnNext={this.create}
        fabOnNextText={intl`CREATE`}
        onBack={Nav().backToPageChatRecents}
        title={intl`New Group`}
      >
        <Field
          label={intl`GROUP NAME`}
          onValueChange={this.setName}
          value={this.state.name}
        />
        <Field isGroup label={intl`Members`} />
        {this.buddyIds.map((id, i) => (
          <RnTouchableOpacity key={i} onPress={() => this.toggleBuddy(id)}>
            <UserItem
              key={id}
              {...this.buddyById[id]}
              selected={this.state.members.includes(id)}
            />
          </RnTouchableOpacity>
        ))}
      </Layout>
    )
  }

  setName = (name: string) => {
    this.setState({
      name,
    })
  }
  toggleBuddy = (buddy: string) => {
    const { members } = this.state
    if (members.includes(buddy)) {
      this.setState({
        members: members.filter(id => id !== buddy),
      })
    } else {
      this.setState({
        members: [...members, buddy],
      })
    }
  }
  create = () => {
    const { members, name } = this.state
    if (!name.trim()) {
      RnAlert.error({
        message: intlDebug`Group name is required`,
      })
      return
    }
    uc.createChatGroup(name, members)
      .then(this.onCreateSuccess)
      .catch(this.onCreateFailure)
  }
  onCreateSuccess = (group: { id: string; name: string; jointed: boolean }) => {
    chatStore.upsertGroup(group)
    uc.joinChatGroup(group.id)
    Nav().goToPageChatRecents()
  }
  onCreateFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to create the group chat`,
      err,
    })
  }
}
