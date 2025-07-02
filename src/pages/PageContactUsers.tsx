import { orderBy, uniq } from 'lodash'
import { observer } from 'mobx-react'
import { Component } from 'react'
import { SectionList } from 'react-native'

import { mdiMagnify, mdiPhone, mdiVideo } from '#/assets/icons'
import { ContactSectionList } from '#/components/ContactSectionList'
import { UserItem } from '#/components/ContactUserItem'
import { Field } from '#/components/Field'
import { Layout } from '#/components/Layout'
import type { ChatMessage } from '#/stores/chatStore'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { userStore } from '#/stores/userStore'
import { DelayFlag } from '#/utils/DelayFlag'
import { filterTextOnly } from '#/utils/formatChatContent'

@observer
export class PageContactUsers extends Component {
  displayOfflineUsers = new DelayFlag()

  componentDidMount = () => {
    this.componentDidUpdate()
  }

  getMatchUserIds = () => {
    const userIds = uniq([
      ...ctx.contact.pbxUsers.map(u => u.id),
      ...ctx.contact.ucUsers.map(u => u.id),
    ])
    return userIds.filter(this.isMatchUser)
  }
  resolveUser = (id: string) => {
    const pbxUser = ctx.contact.getPbxUserById(id) || {}
    const ucUser = ctx.contact.getUcUserById(id) || {}
    const u = {
      ...pbxUser,
      ...ucUser,
    }
    return u
  }
  isMatchUser = (id: string) => {
    if (!id) {
      return false
    }
    let userId = id
    let pbxUserName: string
    const pbxUser = ctx.contact.getPbxUserById(id)
    if (pbxUser) {
      pbxUserName = pbxUser.name
    } else {
      pbxUserName = ''
    }
    let ucUserName: string
    const ucUser = ctx.contact.getUcUserById(id)
    if (ucUser) {
      ucUserName = ucUser.name
    } else {
      ucUserName = ''
    }
    //
    userId = userId.toLowerCase()
    pbxUserName = pbxUserName.toLowerCase()
    ucUserName = ucUserName.toLowerCase()
    const txt = ctx.contact.usersSearchTerm.toLowerCase()
    return (
      userId.includes(txt) ||
      pbxUserName.includes(txt) ||
      ucUserName.includes(txt)
    )
  }

  componentDidUpdate = () => {
    const ca = ctx.auth.getCurrentAccount()
    if (this.displayOfflineUsers.enabled !== ca?.displayOfflineUsers) {
      this.displayOfflineUsers.setEnabled(ca?.displayOfflineUsers)
    }
  }
  getDescription = (isUserSelectionMode: boolean) => {
    const ca = ctx.auth.getCurrentAccount()
    if (!ca) {
      return ''
    }
    if (!isUserSelectionMode) {
      const allUsers = this.getMatchUserIds().map(this.resolveUser)
      const onlineUsers = allUsers.filter(
        i => i.status && i.status !== 'offline',
      )
      let desc = intl`Users, ${allUsers.length} total`
      if (allUsers.length && ca.ucEnabled) {
        desc = desc.replace(
          intl`${allUsers.length} total`,
          intl`${onlineUsers.length}/${allUsers.length} online`,
        )
      }
      return desc
    } else {
      const searchTxt = ctx.contact.usersSearchTerm.toLowerCase()
      const isShowOfflineUser =
        !ca.ucEnabled || this.displayOfflineUsers.enabled
      const { totalContact = 0, totalOnlineContact = 0 } = userStore.filterUser(
        searchTxt,
        isShowOfflineUser,
      )
      let desc = intl`Users, ${totalContact} total`
      if (ca.ucEnabled) {
        desc = desc.replace(
          intl`${totalContact} total`,
          intl`${totalOnlineContact}/${totalContact} online`,
        )
      }
      return desc
    }
  }
  renderUserSelectionMode = () => {
    const searchTxt = ctx.contact.usersSearchTerm.toLowerCase()
    const isShowOfflineUser =
      !ctx.auth.getCurrentAccount()?.ucEnabled ||
      this.displayOfflineUsers.enabled
    const { displayUsers } = userStore.filterUser(searchTxt, isShowOfflineUser)
    return <ContactSectionList sectionListData={displayUsers} />
  }
  renderAllUserMode = () => {
    const ca = ctx.auth.getCurrentAccount()
    if (!ca) {
      return null
    }
    const allUsers = this.getMatchUserIds().map(this.resolveUser)
    const onlineUsers = allUsers.filter(i => i.status && i.status !== 'offline')
    type User = (typeof allUsers)[0]
    const displayUsers =
      !this.displayOfflineUsers.enabled && ca.ucEnabled ? onlineUsers : allUsers
    const map = {} as { [k: string]: User[] }
    displayUsers.forEach(u => {
      u.name = u.name || u.id || ''
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
        keyExtractor={(item, index) => item.id}
        renderItem={({
          item,
          index,
        }: {
          item: ItemUser['item']
          index: number
        }) => <RenderItemUser item={item} index={index} />}
        renderSectionHeader={({ section: { title } }) => (
          // TODO: move to a new component with observer
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
    const description = this.getDescription(isUserSelectionMode)
    return (
      <Layout
        description={description}
        dropdown={[
          {
            label: intl`Edit buddy list`,
            onPress: ctx.nav.goToPageContactEdit,
          },
        ]}
        menu='contact'
        subMenu='users'
        title={intl`Users`}
      >
        <Field
          icon={mdiMagnify}
          label={intl`SEARCH FOR USERS`}
          onValueChange={(v: string) => {
            // TODO: use debounced value to perform data filter
            ctx.contact.usersSearchTerm = v
          }}
          value={ctx.contact.usersSearchTerm}
        />
        {ctx.auth.getCurrentAccount()?.ucEnabled && (
          <Field
            label={intl`SHOW OFFLINE USERS`}
            onValueChange={(v: boolean) => {
              ctx.account.upsertAccount({
                id: ctx.auth.signedInId,
                displayOfflineUsers: v,
              })
            }}
            type='Switch'
            value={ca.displayOfflineUsers}
          />
        )}
        {isUserSelectionMode
          ? this.renderUserSelectionMode()
          : this.renderAllUserMode()}
      </Layout>
    )
  }
}

const getLastMessageChat = (id: string) => {
  const chats = filterTextOnly(ctx.chat.getMessagesByThreadId(id))
  return chats.length ? chats[chats.length - 1] : ({} as ChatMessage)
}
type ItemUser = {
  item: {
    id: string
  }
  index: number
}
const RenderItemUser = observer(({ item, index }: ItemUser) => (
  // TODO: move to a new component with observer
  <UserItem
    iconFuncs={[
      () => ctx.call.startVideoCall(item.id),
      () => ctx.call.startCall(item.id),
    ]}
    icons={[mdiVideo, mdiPhone]}
    lastMessage={getLastMessageChat(item.id)?.text}
    {...item}
    canTouch
    onPress={
      ctx.auth.getCurrentAccount()?.ucEnabled
        ? () => ctx.nav.goToPageChatDetail({ buddy: item.id })
        : undefined
    }
  />
))
