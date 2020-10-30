import { mdiMagnify, mdiPhone, mdiVideo } from '@mdi/js'
import orderBy from 'lodash/orderBy'
import uniq from 'lodash/uniq'
import { observer } from 'mobx-react'
import React from 'react'

import authStore from '../global/authStore'
import callStore from '../global/callStore'
import chatStore from '../global/chatStore'
import contactStore from '../global/contactStore'
import Nav from '../global/Nav'
import profileStore from '../global/profileStore'
import intl from '../intl/intl'
import { RnTouchableOpacity } from '../Rn'
import Field from '../shared/Field'
import Layout from '../shared/Layout'
import DelayFlag from '../utils/DelayFlag'
import UserItem from './UserItem'

@observer
class PageContactUsers extends React.Component {
  displayOfflineUsers = new DelayFlag()

  componentDidMount() {
    this.componentDidUpdate()
  }
  componentDidUpdate() {
    if (
      this.displayOfflineUsers.enabled !==
      authStore.currentProfile.displayOfflineUsers
    ) {
      this.displayOfflineUsers.setEnabled(
        authStore.currentProfile.displayOfflineUsers,
      )
    }
  }

  getMatchUserIds() {
    const userIds = uniq([
      ...contactStore.pbxUsers.map(u => u.id),
      ...contactStore.ucUsers.map(u => u.id),
    ])
    return userIds.filter(this.isMatchUser)
  }
  resolveUser = id => {
    const pbxUser = contactStore.getPBXUser(id) || {}
    const ucUser = contactStore.getUCUser(id) || {}
    const u = {
      ...pbxUser,
      ...ucUser,
    }
    return u
  }
  isMatchUser = id => {
    if (!id) {
      return false
    }
    let userId = id
    let pbxUserName
    const pbxUser = contactStore.getPBXUser(id)
    if (pbxUser) {
      pbxUserName = pbxUser.name
    } else {
      pbxUserName = ''
    }
    let ucUserName
    const ucUser = contactStore.getUCUser(id)
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

  getLastMessageChat = id => {
    const chats = chatStore.messagesByThreadId[id] || []
    return chats.length !== 0 ? chats[chats.length - 1] : {}
  }

  render() {
    const allUsers = this.getMatchUserIds().map(this.resolveUser)
    const onlineUsers = allUsers.filter(i => i.status && i.status !== 'offline')

    const { ucEnabled } = authStore.currentProfile
    const displayUsers =
      !this.displayOfflineUsers.enabled && ucEnabled ? onlineUsers : allUsers

    const map = {}
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
      key: k,
      users: map[k],
    }))
    groups = orderBy(groups, 'key')
    groups.forEach(g => {
      g.users = orderBy(g.users, 'name')
    })
    return (
      <Layout
        description={(() => {
          let desc = intl`PBX users, ${allUsers.length} total`
          if (allUsers.length && ucEnabled) {
            desc = desc.replace('PBX', 'PBX/UC')
            desc = desc.replace(
              intl`${allUsers.length} total`,
              intl`${onlineUsers.length}/${allUsers.length} online`,
            )
          }
          return desc
        })()}
        menu='contact'
        subMenu='users'
        title={intl`Users`}
      >
        <Field
          icon={mdiMagnify}
          label={intl`SEARCH FOR USERS`}
          onValueChange={v => {
            contactStore.usersSearchTerm = v
          }}
          value={contactStore.usersSearchTerm}
        />
        {ucEnabled && (
          <Field
            label={intl`SHOW OFFLINE USERS`}
            onValueChange={v => {
              profileStore.upsertProfile({
                id: authStore.signedInId,
                displayOfflineUsers: v,
              })
            }}
            type='Switch'
            value={authStore.currentProfile.displayOfflineUsers}
          />
        )}
        {groups.map(_g => (
          <React.Fragment key={_g.key}>
            <Field isGroup label={_g.key} />
            {_g.users.map((u, i) => (
              <RnTouchableOpacity
                key={i}
                onPress={
                  authStore.currentProfile.ucEnabled
                    ? () => Nav.goToPageChatDetail({ buddy: u.id })
                    : undefined
                }
              >
                <UserItem
                  iconFuncs={[
                    () => callStore.startVideoCall(u.id),
                    () => callStore.startCall(u.id),
                  ]}
                  icons={[mdiVideo, mdiPhone]}
                  lastMessage={this.getLastMessageChat(u.id)?.text}
                  {...u}
                />
              </RnTouchableOpacity>
            ))}
          </React.Fragment>
        ))}
      </Layout>
    )
  }
}

export default PageContactUsers
