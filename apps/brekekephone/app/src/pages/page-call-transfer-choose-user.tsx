import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'
import { SectionList } from 'react-native'

import { orderBy } from '@/shared/lodash'
import { mdiMagnify, mdiPhone, mdiPhoneForward } from '#/assets/icons'
import { ContactSectionList } from '#/components/contact-section-list'
import { UserItem } from '#/components/contact-user-item'
import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { setPageCallTransferChooseUser } from '#/components/navigation-config'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

export const PageCallTransferChooseUser = observer(() => {
  const prevIdRef = useRef<string | undefined>(undefined)
  const [txtSearch, setTxtSearch] = useState('')

  const ocId = ctx.call.getOngoingCall()?.id
  useEffect(() => {
    if (!ctx.contact.pbxUsers.length) {
      ctx.contact.getPbxUsers()
    }
  }, [])
  useEffect(() => {
    if (prevIdRef.current && prevIdRef.current !== ocId) {
      ctx.nav.backToPageCallManage()
    }
    prevIdRef.current = ocId
  }, [ocId])

  const resolveMatch = (id: string) => {
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
  const renderUserSelectionMode = () => {
    const { displayUsers } = ctx.user.filterUser(txtSearch, true)
    return <ContactSectionList sectionListData={displayUsers} isTransferCall />
  }
  const renderAllUserMode = () => {
    const ca = ctx.auth.getCurrentAccount()
    if (!ca) {
      return null
    }
    const datas = ctx.contact.pbxUsers.map(u => u.id).map(resolveMatch)
    const users = datas.filter(i => {
      const name = i.name.toLowerCase()
      const txt = txtSearch.toLowerCase()
      const number = i.number.toLowerCase()
      return name.includes(txt) || number.includes(txt)
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
          setTxtSearch(v)
        }}
        value={txtSearch}
      />
      {isUserSelectionMode ? renderUserSelectionMode() : renderAllUserMode()}
    </Layout>
  )
})

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
