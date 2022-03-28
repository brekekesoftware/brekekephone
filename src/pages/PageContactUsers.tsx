import { orderBy, uniq } from 'lodash'
import { observer } from 'mobx-react'
import { Component } from 'react'
import { SectionList } from 'react-native'

import { mdiMagnify, mdiPhone, mdiVideo } from '../assets/icons'
import { ContactSectionList } from '../components/ContactSectionList'
import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { getAuthStore } from '../stores/authStore'
import { callStore } from '../stores/callStore'
import { ChatMessage, chatStore } from '../stores/chatStore'
import { contactStore } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { profileStore } from '../stores/profileStore'
import { userStore } from '../stores/userStore'
import { DelayFlag } from '../utils/DelayFlag'
import { filterTextOnly } from '../utils/formatChatContent'

@observer
export class PageContactUsers extends Component {
  displayOfflineUsers = new DelayFlag()

  componentDidMount() {
    this.componentDidUpdate()
  }

  getMatchUserIds() {
    const userIds = uniq([
      ...contactStore.pbxUsers.map(u => u.id),
      ...contactStore.ucUsers.map(u => u.id),
    ])
    return userIds.filter(this.isMatchUser)
  }
  resolveUser = (id: string) => {
    const pbxUser = contactStore.getPbxUserById(id) || {}
    const ucUser = contactStore.getUcUserById(id) || {}
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
    const pbxUser = contactStore.getPbxUserById(id)
    if (pbxUser) {
      pbxUserName = pbxUser.name
    } else {
      pbxUserName = ''
    }
    let ucUserName: string
    const ucUser = contactStore.getUcUserById(id)
    if (ucUser) {
      ucUserName = ucUser.name
    } else {
      ucUserName = ''
    }
    //
    userId = userId.toLowerCase()
    pbxUserName = pbxUserName.toLowerCase()
    ucUserName = ucUserName.toLowerCase()
    const txt = contactStore.usersSearchTerm.toLowerCase()
    return (
      userId.includes(txt) ||
      pbxUserName.includes(txt) ||
      ucUserName.includes(txt)
    )
  }

  componentDidUpdate() {
    const cp = getAuthStore().currentProfile
    if (this.displayOfflineUsers.enabled !== cp?.displayOfflineUsers) {
      this.displayOfflineUsers.setEnabled(cp?.displayOfflineUsers)
    }
  }
  getDescription = (isUserSelectionMode: boolean) => {
    const cp = getAuthStore().currentProfile
    if (!cp) {
      return ''
    }
    if (!isUserSelectionMode) {
      const allUsers = this.getMatchUserIds().map(this.resolveUser)
      const onlineUsers = allUsers.filter(
        i => i.status && i.status !== 'offline',
      )
      let desc = intl`Users, ${allUsers.length} total`
      if (allUsers.length && cp.ucEnabled) {
        desc = desc.replace(
          intl`${allUsers.length} total`,
          intl`${onlineUsers.length}/${allUsers.length} online`,
        )
      }
      return desc
    } else {
      const searchTxt = contactStore.usersSearchTerm.toLowerCase()
      const isShowOfflineUser =
        !cp.ucEnabled || this.displayOfflineUsers.enabled
      const { totalContact = 0, totalOnlineContact = 0 } = userStore.filterUser(
        searchTxt,
        isShowOfflineUser,
      )
      let desc = intl`Users, ${totalContact} total`
      if (cp.ucEnabled) {
        desc = desc.replace(
          intl`${totalContact} total`,
          intl`${totalOnlineContact}/${totalContact} online`,
        )
      }
      return desc
    }
  }
  renderUserSelectionMode = () => {
    const searchTxt = contactStore.usersSearchTerm.toLowerCase()
    const isShowOfflineUser =
      !getAuthStore().currentProfile?.ucEnabled ||
      this.displayOfflineUsers.enabled
    const { displayUsers } = userStore.filterUser(searchTxt, isShowOfflineUser)
    return <ContactSectionList sectionListData={displayUsers} />
  }
  renderAllUserMode = () => {
    const cp = getAuthStore().currentProfile
    if (!cp) {
      return null
    }
    const allUsers = this.getMatchUserIds().map(this.resolveUser)
    const onlineUsers = allUsers.filter(i => i.status && i.status !== 'offline')
    type User = typeof allUsers[0]
    const displayUsers =
      !this.displayOfflineUsers.enabled && cp.ucEnabled ? onlineUsers : allUsers
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
        renderItem={({ item, index }: { item: any; index: number }) => (
          <RenderItemUser item={item} index={index} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          // TODO move to a new component with observer
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
    const description = this.getDescription(isUserSelectionMode)
    return (
      <Layout
        description={description}
        dropdown={[
          {
            label: intl`Edit buddy list`,
            onPress: Nav().goToPageContactEdit,
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
            contactStore.usersSearchTerm = v
          }}
          value={contactStore.usersSearchTerm}
        />
        {getAuthStore().currentProfile?.ucEnabled && (
          <Field
            label={intl`SHOW OFFLINE USERS`}
            onValueChange={(v: boolean) => {
              profileStore.upsertProfile({
                id: getAuthStore().signedInId,
                displayOfflineUsers: v,
              })
            }}
            type='Switch'
            value={cp.displayOfflineUsers}
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
  const chats = filterTextOnly(chatStore.messagesByThreadId[id])
  return chats.length !== 0 ? chats[chats.length - 1] : ({} as ChatMessage)
}
type ItemUser = {
  item: any
  index: number
}
const RenderItemUser = observer(({ item, index }: ItemUser) => (
  // TODO move to a new component with observer
  <RnTouchableOpacity
    key={index}
    onPress={
      getAuthStore().currentProfile?.ucEnabled
        ? () => Nav().goToPageChatDetail({ buddy: item.id })
        : undefined
    }
  >
    <UserItem
      iconFuncs={[
        () => callStore.startVideoCall(item.id),
        () => callStore.startCall(item.id),
      ]}
      icons={[mdiVideo, mdiPhone]}
      lastMessage={getLastMessageChat(item.id)?.text}
      {...item}
    />
  </RnTouchableOpacity>
))
