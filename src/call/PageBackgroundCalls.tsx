import { mdiPhoneHangup } from '@mdi/js'
import { observer } from 'mobx-react'
import React from 'react'

import UserItem from '../contact/UserItem'
import callStore from '../global/callStore'
import Nav from '../global/Nav'
import intl from '../intl/intl'
import { RnTouchableOpacity } from '../Rn'
import Field from '../shared/Field'
import Layout from '../shared/Layout'
import formatDuration from '../utils/formatDuration'

const PageBackgroundCalls = observer(() => (
  <Layout
    compact
    onBack={Nav.backToPageCallManage}
    title={intl`Background calls`}
  >
    <Field isGroup label={intl`CURRENT CALL`} />
    {(callStore.currentCall ? [callStore.currentCall] : []).map(c => (
      <RnTouchableOpacity key={c.id} onPress={Nav.backToPageCallManage}>
        <UserItem
          iconFuncs={[c.hangupWithUnhold]}
          icons={[mdiPhoneHangup]}
          key={c.id}
          lastMessage={
            !c.answered ? intl`Dialing...` : formatDuration(c.duration)
          }
          selected
          {...c}
        />
      </RnTouchableOpacity>
    ))}

    <Field hasMargin isGroup label={intl`BACKGROUND CALLS`} />
    {callStore.backgroundCalls.map(c => (
      <RnTouchableOpacity
        key={c.id}
        onPress={() => callStore.selectBackgroundCall(c)}
      >
        <UserItem
          iconFuncs={[c.hangupWithUnhold]}
          icons={[mdiPhoneHangup]}
          key={c.id}
          lastMessage={
            !c.answered
              ? intl`Dialing...`
              : c.transferring
              ? intl`Transferring`
              : intl`On hold`
          }
          {...c}
        />
      </RnTouchableOpacity>
    ))}
  </Layout>
))

export default PageBackgroundCalls
