import { observer } from 'mobx-react'
import { Component } from 'react'

import { mdiPhone } from '#/assets/icons'
import { UserItem } from '#/components/contact-user-item'
import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

export const PageVoicemail = observer(
  class PageVoicemail extends Component {
    render() {
      return (
        <Layout
          description={intl`Voicemail`}
          menu='call'
          subMenu='voicemail'
          title={intl`VOICEMAIL`}
        >
          <Field
            isGroup
            label={intl`VOICEMAIL (${ctx.call.newVoicemailCount})`}
          />
          <UserItem
            iconFuncs={[() => ctx.call.startCall('8')]}
            icons={[mdiPhone]}
            name={intl`Voicemail`}
            isVoicemail
            loadings
          />
        </Layout>
      )
    }
  },
)
