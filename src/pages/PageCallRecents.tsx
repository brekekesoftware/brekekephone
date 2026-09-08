import { observer } from 'mobx-react'
import moment from 'moment'
import { Component } from 'react'
import type { NativeEventSubscription } from 'react-native'
import { AppState, StyleSheet } from 'react-native'

import { mdiMagnify, mdiPhone, mdiVideo } from '#/assets/icons'
import { UserItem } from '#/components/ContactUserItem'
import { Field } from '#/components/Field'
import { Layout } from '#/components/Layout'
import { RnText } from '#/components/RnText'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { isIos } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { PushNotification } from '#/utils/PushNotification'

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
    ctx.auth.rcFirstTimeLoadData()
  }
  componentWillUnmount = () => {
    this.appStateSubscription?.remove()
    ctx.auth.cRecentCalls = []
    ctx.auth.rcPage = 0
  }

  getAvatar = (id: string) => {
    const ucUser = ctx.contact.getUcUserById(id) || {}
    return {
      id,
      avatar: ucUser.avatar,
    }
  }

  render() {
    const calls = ctx.auth.cRecentCalls
    return (
      <Layout
        description={intl`Recent calls`}
        menu='call'
        subMenu='recents'
        title={intl`Recents`}
      >
        <Field
          icon={mdiMagnify}
          label={intl`SEARCH NAME, PHONE NUMBER...`}
          onValueChange={(v: string) => {
            // TODO: use debounced value to perform data filter
            ctx.contact.callSearchRecents = v
            ctx.auth.rcSearchRecentCall()
          }}
          value={ctx.contact.callSearchRecents}
        />
        <Field isGroup label={intl`RECENT CALLS (${ctx.auth.rcCount})`} />
        {calls.map((c, i) => {
          const today = moment().format('MMM D')
          // display line information
          const created =
            (c.created + '').replace(` - ${today}`, '') +
            `${ctx.auth.resourceLines.length && c.lineValue ? '   ' + `${c?.lineLabel ? c.lineLabel + ':' : ''} ${c.lineValue}` : ''}`
          const option =
            (ctx.auth.resourceLines.length &&
              c.lineValue && {
                extraHeaders: [`X-PBX-RPI: ${c.lineValue}`],
              }) ||
            undefined
          return (
            <UserItem
              iconFuncs={[
                // update extraHeaders if start call with line value
                () => ctx.call.startCall(c.partyNumber, option, true),
                () => ctx.call.startCall(c.partyNumber, option),
              ]}
              loadings
              {...ctx.contact.getUcUserById(c.partyNumber)}
              icons={[mdiVideo, mdiPhone]}
              isRecentCall
              canTouch={ctx.auth.getCurrentAccount()?.ucEnabled}
              key={i}
              {...this.getAvatar(c.partyNumber)}
              {...c}
              created={created}
            />
          )
        })}
        {ctx.auth.rcLoading ? (
          <RnText
            style={css.Loading}
            warning
            small
            normal
            center
          >{intl`Loading...`}</RnText>
        ) : ctx.auth.cRecentCalls.length < ctx.auth.rcCount ? (
          <RnTouchableOpacity onPress={ctx.auth.rcLoadMore}>
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
