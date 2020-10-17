import { mdiMagnify, mdiPhone, mdiVideo } from '@mdi/js'
import { observer } from 'mobx-react'
import moment from 'moment'
import React from 'react'

import UserItem from '../-contact/UserItem'
import authStore from '../global/authStore'
import callStore from '../global/callStore'
import contactStore from '../global/contactStore'
import intl from '../intl/intl'
import Field from '../shared/Field'
import Layout from '../shared/Layout'

@observer
class PageCallRecents extends React.Component {
  isMatchUser = call => {
    if (call.partyNumber.includes(contactStore.callSearchRecents)) {
      return call.id
    }
  }

  getAvatar = id => {
    const ucUser = contactStore.getUCUser(id) || {}
    return {
      id: id,
      avatar: ucUser.avatar,
    }
  }
  getMatchedCalls = () => {
    const calls = authStore.currentData.recentCalls.filter(this.isMatchUser)
    // Backward compatibility to remove invalid items from the previous versions
    const filteredCalls = calls.filter(
      c =>
        typeof c.created === 'string' &&
        // HH:mm - MMM D
        (c.created.length === 13 || c.created.length === 14),
    )
    //
    const today = moment().format('MMM D')
    return filteredCalls.map(c => ({
      ...c,
      created: c.created.replace(` - ${today}`, ''),
    }))
  }

  render() {
    const calls = this.getMatchedCalls()
    return (
      <Layout
        description={intl`Recent voicemails and calls`}
        menu="call"
        subMenu="recents"
        title={intl`Recents`}
      >
        <Field
          icon={mdiMagnify}
          label={intl`SEARCH NAME, PHONE NUMBER ...`}
          onValueChange={v => {
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
            icons={[mdiVideo, mdiPhone]}
            isRecentCall
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
