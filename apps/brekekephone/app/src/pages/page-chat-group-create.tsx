import { observer } from 'mobx-react'
import { useState } from 'react'

import { UserItem } from '#/components/contact-user-item'
import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { RnTouchableOpacity } from '#/components/rn'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'

export const PageChatGroupCreate = observer(() => {
  const [name, setName] = useState('')
  const [members, setMembers] = useState<string[]>([])

  const toggleBuddy = (buddy: string) => {
    if (members.includes(buddy)) {
      setMembers(members.filter(id => id !== buddy))
    } else {
      setMembers([...members, buddy])
    }
  }
  const onCreateSuccess = (group: {
    id: string
    name: string
    jointed: boolean
  }) => {
    ctx.chat.upsertGroup(group)
    ctx.uc.joinChatGroup(group.id)
    ctx.nav.goToPageChatRecents()
  }
  const onCreateFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to create the group chat`,
      err,
    })
  }
  const create = () => {
    if (!name.trim()) {
      RnAlert.error({
        message: intlDebug`Group name is required`,
      })
      return
    }
    ctx.uc
      .createChatGroup(name, members)
      .then(onCreateSuccess)
      .catch(onCreateFailure)
  }

  return (
    <Layout
      fabOnBack={ctx.nav.goToPageChatRecents}
      fabOnNext={create}
      fabOnNextText={intl`CREATE`}
      onBack={ctx.nav.backToPageChatRecents}
      title={intl`New Group`}
    >
      <Field label={intl`GROUP NAME`} onValueChange={setName} value={name} />
      <Field isGroup label={intl`Members`} />
      {ctx.contact.ucUsers.map((u, i) => (
        <RnTouchableOpacity key={i} onPress={() => toggleBuddy(u.id)}>
          <UserItem key={u.id} {...u} selected={members.includes(u.id)} />
        </RnTouchableOpacity>
      ))}
    </Layout>
  )
})
