import orderBy from 'lodash/orderBy'
import { observer } from 'mobx-react'
import React, { Component, Fragment } from 'react'

import { mdiPhone, mdiPhoneForward } from '../assets/icons'
import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { setPageCallTransferChooseUser } from '../components/navigationConfig2'
import { callStore } from '../stores/callStore'
import { contactStore } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'

@observer
export class PageCallTransferChooseUser extends Component {
  prevId?: string
  componentDidMount() {
    this.componentDidUpdate()
  }
  componentDidUpdate() {
    const c = callStore.getCurrentCall()
    if (this.prevId && this.prevId !== c?.id) {
      Nav().backToPageCallManage()
    }
    this.prevId = c?.id
  }

  resolveMatch = (id: string) => {
    const match = contactStore.getPbxUserById(id)
    const ucUser = contactStore.getUcUserById(id) || {}
    return {
      name: match.name,
      avatar: ucUser.avatar,
      number: id,
      calling: !!match.talkers?.filter(t => t.status === 'calling').length,
      ringing: !!match.talkers?.filter(t => t.status === 'ringing').length,
      talking: !!match.talkers?.filter(t => t.status === 'talking').length,
      holding: !!match.talkers?.filter(t => t.status === 'holding').length,
    }
  }

  render() {
    const users = contactStore.pbxUsers.map(u => u.id).map(this.resolveMatch)
    type User = typeof users[0]

    const map = {} as { [k: string]: User[] }
    users.forEach(u => {
      u.name = u.name || u.number || ''
      let c0 = u.name.charAt(0).toUpperCase()
      if (!/[A-Z]/.test(c0)) {
        c0 = '#'
      }
      if (!map[c0]) {
        map[c0] = []
      }
      map[c0].push(u)
    })

    let groups = Object.keys(map).map(k => ({
      key: k,
      users: map[k],
    }))
    groups = orderBy(groups, 'key')
    groups.forEach(gr => {
      gr.users = orderBy(gr.users, 'name')
    })
    const c = callStore.getCurrentCall()
    return (
      <Layout
        description={intl`Select target to start transfer`}
        onBack={Nav().backToPageCallManage}
        menu={'call_transfer'}
        subMenu={'list_user'}
        isTab
        title={intl`Transfer`}
      >
        {groups.map(gr => (
          <Fragment key={gr.key}>
            <Field isGroup label={gr.key} />
            {gr.users.map((u, i) => (
              <UserItem
                iconFuncs={[
                  () => c?.transferAttended(u.number),
                  () => c?.transferBlind(u.number),
                ]}
                icons={[mdiPhoneForward, mdiPhone]}
                key={i}
                {...u}
              />
            ))}
          </Fragment>
        ))}
      </Layout>
    )
  }
}

setPageCallTransferChooseUser(PageCallTransferChooseUser)
