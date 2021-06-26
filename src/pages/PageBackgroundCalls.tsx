import { mdiPhoneHangup } from '@mdi/js'
import { observer } from 'mobx-react'
import React from 'react'

import UserItem from '../components/ContactUserItem'
import Field from '../components/Field'
import Layout from '../components/Layout'
import { RnTouchableOpacity } from '../components/Rn'
import g from '../components/variables'
import callStore from '../stores/callStore'
import intl from '../stores/intl'
import Nav from '../stores/Nav'
import formatDuration from '../utils/formatDuration'

const PageBackgroundCalls = observer(() => {
  const c = callStore.currentCall()
  const bg = callStore.backgroundCalls()
  return (
    <Layout
      compact
      onBack={Nav().backToPageCallManage}
      title={intl`Background calls`}
    >
      <Field isGroup label={intl`CURRENT CALL`} />
      {(c ? [c] : []).map(c => (
        <RnTouchableOpacity key={c.id} onPress={Nav().backToPageCallManage}>
          <UserItem
            icons={[mdiPhoneHangup]}
            iconColors={[g.colors.danger]}
            iconFuncs={[c.hangupWithUnhold]}
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
      {bg.map(c => (
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
  )
})

export default PageBackgroundCalls
