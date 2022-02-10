import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { DefaultSectionT, SectionListData } from 'react-native'

import { UcBuddy } from '../api/brekekejs'
import { mdiMagnify } from '../assets/icons'
import { ContactSectionList } from '../components/ContactSectionList'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { getAuthStore } from '../stores/authStore'
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

  render() {
    const { ucEnabled } = getAuthStore().currentProfile
    const { byIds, dataGroupUserIds, dataListAllUser } = userStore
    const allUsers: SectionListData<UcBuddy, DefaultSectionT>[] = []
    const onlineUsers: SectionListData<UcBuddy, DefaultSectionT>[] = []
    const searchTxt = contactStore.usersSearchTerm.toLowerCase()

    dataGroupUserIds.forEach(s => {
      allUsers.push({
        title: s.title,
        data: s.data
          .map(id => byIds[id])
          .filter(
            u => u.user_id.includes(searchTxt) || u.name.includes(searchTxt),
          ),
      })
      onlineUsers.push({
        title: s.title,
        data: s.data
          .map(id => (byIds[id].status === 'online' ? byIds[id] : null))
          .filter(u => u)
          .filter(
            u => u.user_id.includes(searchTxt) || u.name.includes(searchTxt),
          ),
      })
    })

    const displayUsers =
      !this.displayOfflineUsers.enabled && ucEnabled ? onlineUsers : allUsers

    console.log('render page')
    return (
      <Layout
        description={(() => {
          let desc = intl`PBX users, ${dataListAllUser.length} total`
          if (dataListAllUser.length && ucEnabled) {
            desc = desc.replace('PBX', 'PBX/UC')
            desc = desc.replace(
              intl`${dataListAllUser.length} total`,
              intl`${onlineUsers.length}/${dataListAllUser.length} online`,
            )
          }
          return desc
        })()}
        dropdown={[
          {
            label: intl`Edit the user list`,
            onPress: Nav().goToPageEditUserList,
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
        {ucEnabled && (
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
        )}
        <ContactSectionList sectionListData={displayUsers} />
      </Layout>
    )
  }
}
