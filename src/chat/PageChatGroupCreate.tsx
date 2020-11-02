import { computed } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'

import uc from '../api/uc'
import UserItem from '../contact/UserItem'
import chatStore from '../global/chatStore'
import contactStore from '../global/contactStore'
import Nav from '../global/Nav'
import RnAlert from '../global/RnAlert'
import intl, { intlDebug } from '../intl/intl'
import { RnTouchableOpacity } from '../Rn'
import Field from '../shared/Field'
import Layout from '../shared/Layout'
import { arrToMap } from '../utils/toMap'

@observer
class PageChatGroupCreate extends React.Component {
  @computed get buddyIds() {
    return contactStore.ucUsers.map(u => u.id)
  }
  @computed get buddyById() {
    return arrToMap(contactStore.ucUsers, 'id', u => u)
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

  setName = name => {
    this.setState({
      name,
    })
  }
  toggleBuddy = buddy => {
    const { members } = this.state
    if (members.includes(buddy)) {
      this.setState({
        members: members.filter(_ => _ !== buddy),
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
  onCreateSuccess = group => {
    chatStore.upsertGroup(group)
    uc.joinChatGroup(group.id)
    Nav().goToPageChatRecents()
  }
  onCreateFailure = err => {
    RnAlert.error({
      message: intlDebug`Failed to create the group chat`,
      err,
    })
  }
}
export default PageChatGroupCreate
