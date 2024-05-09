import { observer } from 'mobx-react'
import moment from 'moment'
import { Component } from 'react'
import type { NativeEventSubscription } from 'react-native'
import { AppState, Platform } from 'react-native'

import { mdiMagnify, mdiPhone, mdiVideo } from '../assets/icons'
import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import type { RecentCall } from '../stores/accountStore'
import { accountStore } from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { contactStore } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { PushNotification } from '../utils/PushNotification.ios'

@observer
export class PageCallRecents extends Component {
  appStateSubscription?: NativeEventSubscription
  componentDidMount = () => {
    if (Platform.OS === 'ios') {
      const h = () => {
        if (AppState.currentState === 'active') {
          PushNotification.resetBadgeNumber()
        }
      }
      // reset notification badge whenever go to this page
      h()
      this.appStateSubscription = AppState.addEventListener('change', h)
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
    const as = getAuthStore()
    const ca = as.getCurrentAccount()
    const d = as.getCurrentData()
    if (!d && ca) {
      // trigger async update
      accountStore.findDataWithDefault(ca)
    }
    const calls = d?.recentCalls.filter(this.isMatchUser) || []
    // backward compatibility to remove invalid items from the previous versions
    const filteredCalls = calls.filter(
      c =>
        typeof c.created === 'string' &&
        // format: HH:mm - MMM D
        ((c.created + '').length === 13 || (c.created + '').length === 14),
    )
    const today = moment().format('MMM D')
    return filteredCalls.map(c => ({
      ...c,
      created: (c.created + '').replace(` - ${today}`, ''),
    }))
  }

  render = () => {
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
            // TODO use debounced value to perform data filter
            contactStore.callSearchRecents = v
          }}
          value={contactStore.callSearchRecents}
        />
        <Field isGroup label={intl`RECENT CALLS (${calls.length})`} />
        {calls.map((c, i) => (
          <UserItem
            iconFuncs={[
              () => getCallStore().startVideoCall(c.partyNumber),
              () => getCallStore().startCall(c.partyNumber),
            ]}
            {...contactStore.getUcUserById(c.partyNumber)}
            icons={[mdiVideo, mdiPhone]}
            isRecentCall
            canChat={getAuthStore().getCurrentAccount()?.ucEnabled}
            key={i}
            {...this.getAvatar(c.partyNumber)}
            {...c}
          />
        ))}
      </Layout>
    )
  }
}
