import { orderBy } from 'lodash'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'
import { SectionList } from 'react-native'

import { mdiMagnify, mdiPhone, mdiPhoneForward } from '../assets/icons'
import { ContactSectionList } from '../components/ContactSectionList'
import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { setPageCallTransferChooseUser } from '../components/navigationConfig2'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { contactStore } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { userStore } from '../stores/userStore'

@observer
export class PageCallTransferChooseUser extends Component {
  prevId?: string
  @observable txtSearch: string = ''
  componentDidMount() {
    if (!contactStore.pbxUsers.length) {
      contactStore.getPbxUsers()
    }
    this.componentDidUpdate()
  }
  componentDidUpdate() {
    const c = getCallStore().getCurrentCall()
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
    const { displayUsers } = userStore.filterUser(this.txtSearch, true)
    return <ContactSectionList sectionListData={displayUsers} isTransferCall />
  }
  renderAllUserMode = () => {
    const cp = getAuthStore().getCurrentAccount()
    if (!cp) {
      return null
    }
    const datas = contactStore.pbxUsers.map(u => u.id).map(this.resolveMatch)
    const users = datas.filter(i => {
      const name = i.name.toLowerCase()
      const txtSearch = this.txtSearch.toLowerCase()
      const number = i.number.toLowerCase()
      return name.includes(txtSearch) || number.includes(txtSearch)
    })
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
    const cp = s.getCurrentAccount()
    if (!cp) {
      return null
    }
    const isUserSelectionMode = s.isBigMode() || !cp.pbxLocalAllUsers

    return (
      <Layout
        description={intl`Select target to start transfer`}
        onBack={Nav().backToPageCallManage}
        menu={'call_transfer'}
        subMenu={'list_user'}
        isTab
        title={intl`Transfer`}
      >
        <Field
          icon={mdiMagnify}
          label={intl`SEARCH FOR USERS`}
          onValueChange={(v: string) => {
            this.txtSearch = v
          }}
          value={this.txtSearch}
        />
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
  const c = getCallStore().getCurrentCall()
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
