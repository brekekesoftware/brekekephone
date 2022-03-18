import { orderBy, uniq } from 'lodash'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
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
    // contactStore.getPbxUser()
    const s = getAuthStore()
    if (s.buddyListMode) {
      const { ucEnabled } = s.currentProfile
      ucEnabled ? userStore.loadUcBuddyList() : userStore.loadPbxBuddyList()
    } else {
      contactStore.getPbxUsers()
      this.componentDidUpdate()
    }
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
    if (
      this.displayOfflineUsers.enabled !==
      getAuthStore().currentProfile.displayOfflineUsers
    ) {
      this.displayOfflineUsers.setEnabled(
        getAuthStore().currentProfile.displayOfflineUsers,
      )
    }
  }

  getLastMessageChat = (id: string) => {
    const chats = filterTextOnly(chatStore.messagesByThreadId[id])
    return chats.length !== 0 ? chats[chats.length - 1] : ({} as ChatMessage)
  }

  renderPbxUsers = () => {
    const allUsers = this.getMatchUserIds().map(this.resolveUser)
    type User = typeof allUsers[0]
    const displayUsers = allUsers

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
    // const sectionDataOther: SectionListData<UcBuddy> = {
    //   title: `(${intl`No Group`})`,
    //   data: [],
    // }
    groups = orderBy(groups, 'title')
    groups.forEach(gr => {
      gr.data = orderBy(gr.data, 'name')
    })
    console.log({ groups })

    const s = getAuthStore()

    return (
      <Layout
        description={(() => {
          return intl`PBX users, ${allUsers.length} total`
        })()}
        menu='contact'
        subMenu='users'
        title={intl`Users`}
        dropdown={
          !s.haveConfigWebPhoneAllUsers
            ? [
                {
                  label: intl`Enable buddy list`,
                  onPress: () => {
                    profileStore.upsertProfile({
                      id: s.currentProfile.id,
                      buddyMode: true,
                    })
                    const { ucEnabled } = s.currentProfile
                    ucEnabled
                      ? userStore.loadUcBuddyList()
                      : userStore.loadPbxBuddyList()
                  },
                },
              ]
            : []
        }
      >
        <Field
          icon={mdiMagnify}
          label={intl`SEARCH FOR USERS`}
          onValueChange={(v: string) => {
            contactStore.usersSearchTerm = v
          }}
          value={contactStore.usersSearchTerm}
        />
        <SectionList
          sections={groups}
          keyExtractor={(item, index) => item.id}
          renderItem={({ item, index }: { item: User; index: number }) => (
            <RnTouchableOpacity
              key={index}
              onPress={
                getAuthStore().currentProfile.ucEnabled
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
                lastMessage={this.getLastMessageChat(item.id)?.text}
                {...item}
              />
            </RnTouchableOpacity>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Field isGroup label={title} />
          )}
        />
      </Layout>
    )
  }

  renderBuddyList = () => {
    const searchTxt = contactStore.usersSearchTerm.toLowerCase()
    const isShowOfflineUser = this.displayOfflineUsers.enabled
    const {
      displayUsers,
      totalContact = 0,
      totalOnlineContact = 0,
    } = userStore.filterUser(searchTxt, isShowOfflineUser)
    const s = getAuthStore()

    return (
      <Layout
        description={(() => {
          let desc = intl`UC users, ${totalOnlineContact} total`
          if (isShowOfflineUser) {
            desc = desc.replace(
              intl`${totalOnlineContact} total`,
              intl`${totalOnlineContact}/${totalContact} online`,
            )
          }
          return desc
        })()}
        dropdown={[
          {
            label: intl`Edit buddy list`,
            onPress: Nav().goToPageContactEdit,
          },
          ...(!s.haveConfigWebPhoneAllUsers
            ? [
                {
                  label: intl`Disable buddy list`,
                  onPress: () => {
                    profileStore.upsertProfile({
                      id: s.currentProfile.id,
                      buddyMode: false,
                    })
                    contactStore.getPbxUsers()
                  },
                },
              ]
            : []),
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

        <Field
          label={intl`SHOW OFFLINE USERS`}
          onValueChange={(v: boolean) => {
            profileStore.upsertProfile({
              id: getAuthStore().signedInId,
              displayOfflineUsers: v,
            })
          }}
          type='Switch'
          value={getAuthStore().currentProfile.displayOfflineUsers}
        />
        <ContactSectionList sectionListData={displayUsers} />
      </Layout>
    )
  }

  render() {
    const { buddyListMode } = getAuthStore()
    return buddyListMode ? this.renderBuddyList() : this.renderPbxUsers()
  }
}
