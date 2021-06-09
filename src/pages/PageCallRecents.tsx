import {
  mdiChat,
  mdiChatOutline,
  mdiChatPlusOutline,
  mdiMagnify,
  mdiMessage,
  mdiMessageTextOutline,
  mdiPhone,
  mdiVideo,
} from '@mdi/js'
import { observer } from 'mobx-react'
import moment from 'moment'
import React from 'react'

import UserItem from '../components/ContactUserItem'
import Field from '../components/Field'
import Layout from '../components/Layout'
import { getAuthStore } from '../stores/authStore'
import { AuthStore } from '../stores/authStore2'
import callStore from '../stores/callStore'
import contactStore from '../stores/contactStore'
import intl from '../stores/intl'
import Nav from '../stores/Nav'

@observer
class PageCallRecents extends React.Component {
  isMatchUser = (call: AuthStore['currentData']['recentCalls'][0]) => {
    if (call.partyNumber.includes(contactStore.callSearchRecents)) {
      return call.id
    }
    return ''
  }

  getAvatar = (id: string) => {
    const ucUser = contactStore.getUCUser(id) || {}
    return {
      id: id,
      avatar: ucUser.avatar,
    }
  }
  getMatchedCalls = () => {
    const calls = getAuthStore().currentData.recentCalls.filter(
      this.isMatchUser,
    )
    // Backward compatibility to remove invalid items from the previous versions
    const filteredCalls = calls.filter(
      c =>
        typeof c.created === 'string' &&
        // HH:mm - MMM D
        ((c.created + '').length === 13 || (c.created + '').length === 14),
    )
    const today = moment().format('MMM D')
    return filteredCalls.map(c => ({
      ...c,
      created: (c.created + '').replace(` - ${today}`, ''),
    }))
  }

  render() {
    const calls = this.getMatchedCalls()
    return (
      <Layout
        description={intl`Recent voicemails and calls`}
        menu='call'
        subMenu='recents'
        title={intl`Recents`}
      >
        <Field
          icon={mdiMagnify}
          label={intl`SEARCH NAME, PHONE NUMBER ...`}
          onValueChange={(v: string) => {
            contactStore.callSearchRecents = v
          }}
          value={contactStore.callSearchRecents}
        />
        <Field
          isGroup
          label={intl`VOICEMAILS (${callStore.newVoicemailCount})`}
        />
        <Field isGroup label={intl`RECENT CALLS (${calls.length})`} />
        {calls.map((c, i) => (
          <UserItem
            iconFuncs={[
              () => callStore.startVideoCall(c.partyNumber),
              () => callStore.startCall(c.partyNumber),
            ]}
            {...contactStore.getUCUser(c.partyNumber)}
            icons={[mdiVideo, mdiPhone]}
            isRecentCall
            canChat={getAuthStore().currentProfile.ucEnabled}
            key={i}
            {...this.getAvatar(c.partyNumber)}
            {...c}
          />
        ))}
      </Layout>
    )
  }
}

export default PageCallRecents
