import { observer } from 'mobx-react'
import moment from 'moment'
import { Component } from 'react'
import type { NativeEventSubscription } from 'react-native'
import { AppState, StyleSheet } from 'react-native'

import { mdiMagnify, mdiPhone, mdiVideo } from '../assets/icons'
import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { RnText } from '../components/RnText'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { isIos } from '../config'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { contactStore } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { PushNotification } from '../utils/PushNotification'

const css = StyleSheet.create({
  Loading: {
    marginTop: 20,
  },
})

@observer
export class PageCallRecents extends Component {
  appStateSubscription?: NativeEventSubscription
  componentDidMount = () => {
    if (isIos) {
      const h = () => {
        if (AppState.currentState === 'active') {
          PushNotification.resetBadgeNumber()
        }
      }
      // reset notification badge whenever go to this page
      h()
      this.appStateSubscription = AppState.addEventListener('change', h)
    }
    getAuthStore().rcFirstTimeLoadData()
  }
  componentWillUnmount = () => {
    this.appStateSubscription?.remove()
    getAuthStore().cRecentCalls = []
    getAuthStore().rcPage = 0
  }

  getAvatar = (id: string) => {
    const ucUser = contactStore.getUcUserById(id) || {}
    return {
      id,
      avatar: ucUser.avatar,
    }
  }

  render() {
    const as = getAuthStore()
    const calls = as.cRecentCalls
    return (
      <Layout
        description={intl`Recent calls`}
        menu='call'
        subMenu='recents'
        title={intl`Recents`}
      >
        <Field
          icon={mdiMagnify}
          label={intl`SEARCH NAME, PHONE NUMBER ...`}
          onValueChange={(v: string) => {
            // TODO:use debounced value to perform data filter
            contactStore.callSearchRecents = v
            as.rcSearchRecentCall()
          }}
          value={contactStore.callSearchRecents}
        />
        <Field isGroup label={intl`RECENT CALLS (${as.rcCount})`} />
        {calls.map((c, i) => {
          const today = moment().format('MMM D')
          // display line information
          const created =
            (c.created + '').replace(` - ${today}`, '') +
            `${as.resourceLines.length && c.lineValue ? '   ' + `${c?.lineLabel ? c.lineLabel + ':' : ''} ${c.lineValue}` : ''}`
          const option =
            (as.resourceLines.length &&
              c.lineValue && {
                extraHeaders: [`X-PBX-RPI: ${c.lineValue}`],
              }) ||
            undefined
          return (
            <UserItem
              iconFuncs={[
                // update extraHeaders if start call with line value
                () => getCallStore().startCall(c.partyNumber, option, true),
                () => getCallStore().startCall(c.partyNumber, option),
              ]}
              {...contactStore.getUcUserById(c.partyNumber)}
              icons={[mdiVideo, mdiPhone]}
              isRecentCall
              canTouch={as.getCurrentAccount()?.ucEnabled}
              key={i}
              {...this.getAvatar(c.partyNumber)}
              {...c}
              created={created}
            />
          )
        })}
        {as.rcLoading ? (
          <RnText
            style={css.Loading}
            warning
            small
            normal
            center
          >{intl`Loading...`}</RnText>
        ) : as.cRecentCalls.length < as.rcCount ? (
          <RnTouchableOpacity onPress={as.rcLoadMore}>
            <RnText
              style={css.Loading}
              primary
              small
              normal
              center
            >{intl`Load more recent calls`}</RnText>
          </RnTouchableOpacity>
        ) : null}
      </Layout>
    )
  }
}
