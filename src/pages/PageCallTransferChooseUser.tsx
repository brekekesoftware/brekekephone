import orderBy from 'lodash/orderBy'
import { observer } from 'mobx-react'
import { Component } from 'react'
import { SectionList } from 'react-native'

import { mdiPhone, mdiPhoneForward } from '../assets/icons'
import { ContactSectionList } from '../components/ContactSectionList'
import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { setPageCallTransferChooseUser } from '../components/navigationConfig2'
import { getAuthStore } from '../stores/authStore'
import { callStore } from '../stores/callStore'
import { contactStore } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { userStore } from '../stores/userStore'

@observer
export class PageCallTransferChooseUser extends Component {
  prevId?: string
  componentDidMount() {
    if (!contactStore.pbxUsers.length) {
      contactStore.getPbxUsers()
    }
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
      status: ucUser.status,
      calling: !!match.talkers?.filter(t => t.status === 'calling').length,
      ringing: !!match.talkers?.filter(t => t.status === 'ringing').length,
      talking: !!match.talkers?.filter(t => t.status === 'talking').length,
      holding: !!match.talkers?.filter(t => t.status === 'holding').length,
    }
  }
  renderUserSelectionMode = () => {
    const { displayUsers } = userStore.filterUser('', true)
    return <ContactSectionList sectionListData={displayUsers} isTransferCall />
  }
  renderAllUserMode = () => {
    const cp = getAuthStore().currentProfile
    if (!cp) {
      return null
    }
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
      title: k,
      data: map[k],
    }))
    groups = orderBy(groups, 'title')
    groups.forEach(gr => {
      gr.data = orderBy(gr.data, 'name')
    })
    return (
      <SectionList
        sections={groups}
        keyExtractor={(item, index) => item.number}
        renderItem={({
          item,
          index,
        }: {
          item: ItemUser['item']
          index: number
        }) => <RenderItemUser item={item} index={index} />}
        renderSectionHeader={({ section: { title } }) => (
          <Field isGroup label={title} />
        )}
      />
    )
  }
  render() {
    const s = getAuthStore()
    const cp = s.currentProfile
    if (!cp) {
      return null
    }
    const isUserSelectionMode = s.isBigMode || !cp.pbxLocalAllUsers

    return (
      <Layout
        description={intl`Select target to start transfer`}
        onBack={Nav().backToPageCallManage}
        menu={'call_transfer'}
        subMenu={'list_user'}
        isTab
        title={intl`Transfer`}
      >
        {isUserSelectionMode
          ? this.renderUserSelectionMode()
          : this.renderAllUserMode()}
      </Layout>
    )
  }
}

setPageCallTransferChooseUser(PageCallTransferChooseUser)
type ItemUser = {
  item: {
    number: string
  }
  index: number
}
const RenderItemUser = observer(({ item, index }: ItemUser) => {
  const c = callStore.getCurrentCall()
  return (
    <UserItem
      iconFuncs={[
        () => c?.transferAttended(item.number),
        () => c?.transferBlind(item.number),
      ]}
      icons={[mdiPhoneForward, mdiPhone]}
      key={index}
      {...item}
    />
  )
})
