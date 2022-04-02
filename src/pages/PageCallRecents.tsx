import { observer } from 'mobx-react'
import moment from 'moment'
import { Component } from 'react'
import { AppState, NativeEventSubscription, Platform } from 'react-native'

import { mdiMagnify, mdiPhone, mdiVideo } from '../assets/icons'
import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { getAuthStore, RecentCall } from '../stores/authStore'
import { callStore } from '../stores/callStore'
import { contactStore } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { PushNotification } from '../utils/PushNotification.ios'

@observer
export class PageCallRecents extends Component {
  appStateSubscription?: NativeEventSubscription
  componentDidMount = () => {
    if (Platform.OS === 'ios') {
      this.appStateSubscription = AppState.addEventListener('change', () => {
        if (AppState.currentState === 'active') {
          PushNotification.resetBadgeNumber()
        }
      })
    }
  }
  componentWillUnmount = () => {
    this.appStateSubscription?.remove()
  }

  isMatchUser = (call: RecentCall) => {
    if (call.partyNumber.includes(contactStore.callSearchRecents)) {
      return call.id
    }
    return ''
  }
  getAvatar = (id: string) => {
    const ucUser = contactStore.getUcUserById(id) || {}
    return {
      id,
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
        description={intl`Voicemail and recent calls`}
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
          label={intl`VOICEMAIL (${callStore.newVoicemailCount})`}
        />
        <UserItem
          iconFuncs={[() => callStore.startCall('8')]}
          icons={[mdiPhone]}
          name={intl`Voicemail`}
          isVoicemail
        />
        <Field isGroup label={intl`RECENT CALLS (${calls.length})`} />
        {calls.map((c, i) => (
          <UserItem
            iconFuncs={[
              () => callStore.startVideoCall(c.partyNumber),
              () => callStore.startCall(c.partyNumber),
            ]}
            {...contactStore.getUcUserById(c.partyNumber)}
            icons={[mdiVideo, mdiPhone]}
            isRecentCall
            canChat={getAuthStore().currentProfile?.ucEnabled}
            key={i}
            {...this.getAvatar(c.partyNumber)}
            {...c}
          />
        ))}
      </Layout>
    )
  }
}
