import { orderBy } from 'lodash'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'
import { SectionList } from 'react-native'

import { mdiMagnify, mdiPhone, mdiPhoneForward } from '#/assets/icons'
import { ContactSectionList } from '#/components/ContactSectionList'
import { UserItem } from '#/components/ContactUserItem'
import { Field } from '#/components/Field'
import { Layout } from '#/components/Layout'
import { setPageCallTransferChooseUser } from '#/components/navigationConfig'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

@observer
export class PageCallTransferChooseUser extends Component {
  prevId?: string
  @observable txtSearch: string = ''
  componentDidMount = () => {
    if (!ctx.contact.pbxUsers.length) {
      ctx.contact.getPbxUsers()
    }
    this.componentDidUpdate()
  }
  componentDidUpdate = () => {
    const oc = ctx.call.getOngoingCall()
    if (this.prevId && this.prevId !== oc?.id) {
      ctx.nav.backToPageCallManage()
    }
    this.prevId = oc?.id
  }

  resolveMatch = (id: string) => {
    const match = ctx.contact.getPbxUserById(id)
    const ucUser = ctx.contact.getUcUserById(id) || {}
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
    const { displayUsers } = ctx.user.filterUser(this.txtSearch, true)
    return <ContactSectionList sectionListData={displayUsers} isTransferCall />
  }
  renderAllUserMode = () => {
    const ca = ctx.auth.getCurrentAccount()
    if (!ca) {
      return null
    }
    const datas = ctx.contact.pbxUsers.map(u => u.id).map(this.resolveMatch)
    const users = datas.filter(i => {
      const name = i.name.toLowerCase()
      const txtSearch = this.txtSearch.toLowerCase()
      const number = i.number.toLowerCase()
      return name.includes(txtSearch) || number.includes(txtSearch)
    })
    type User = (typeof users)[0]

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
    const ca = ctx.auth.getCurrentAccount()
    if (!ca) {
      return null
    }
    const isUserSelectionMode = ctx.auth.isBigMode() || !ca.pbxLocalAllUsers

    return (
      <Layout
        description={intl`Select target to start transfer`}
        onBack={ctx.nav.backToPageCallManage}
        menu='call_transfer'
        subMenu='list_user'
        isTab
        title={intl`Transfer`}
      >
        <Field
          icon={mdiMagnify}
          label={intl`SEARCH FOR USERS`}
          onValueChange={(v: string) => {
            // TODO: use debounced value to perform data filter
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
  const oc = ctx.call.getOngoingCall()
  return (
    <UserItem
      iconFuncs={[
        () => oc?.transferAttended(item.number),
        () => oc?.transferBlind(item.number),
      ]}
      icons={[mdiPhoneForward, mdiPhone]}
      key={index}
      {...item}
    />
  )
})
