import { observer } from 'mobx-react'
import { Component } from 'react'

import { UserItem } from '#/components/ContactUserItem'
import { Field } from '#/components/Field'
import { Layout } from '#/components/Layout'
import { RnTouchableOpacity } from '#/components/Rn'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'

@observer
export class PageChatGroupCreate extends Component {
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
        fabOnBack={ctx.nav.goToPageChatRecents}
        fabOnNext={this.create}
        fabOnNextText={intl`CREATE`}
        onBack={ctx.nav.backToPageChatRecents}
        title={intl`New Group`}
      >
        <Field
          label={intl`GROUP NAME`}
          onValueChange={this.setName}
          value={this.state.name}
        />
        <Field isGroup label={intl`Members`} />
        {ctx.contact.ucUsers.map((u, i) => (
          <RnTouchableOpacity key={i} onPress={() => this.toggleBuddy(u.id)}>
            <UserItem
              key={u.id}
              {...u}
              selected={this.state.members.includes(u.id)}
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
    ctx.uc
      .createChatGroup(name, members)
      .then(this.onCreateSuccess)
      .catch(this.onCreateFailure)
  }
  onCreateSuccess = (group: { id: string; name: string; jointed: boolean }) => {
    ctx.chat.upsertGroup(group)
    ctx.uc.joinChatGroup(group.id)
    ctx.nav.goToPageChatRecents()
  }
  onCreateFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to create the group chat`,
      err,
    })
  }
}
