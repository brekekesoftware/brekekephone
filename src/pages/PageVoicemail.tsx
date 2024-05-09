import { observer } from 'mobx-react'
import { Component } from 'react'

import { mdiPhone } from '../assets/icons'
import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { getCallStore } from '../stores/callStore'
import { intl } from '../stores/intl'

@observer
export class PageVoicemail extends Component {
  render = () => (
    <Layout
      description={intl`Voicemail`}
      menu='call'
      subMenu='voicemail'
      title={intl`VOICEMAIL`}
    >
      <Field
        isGroup
        label={intl`VOICEMAIL (${getCallStore().newVoicemailCount})`}
      />
      <UserItem
        iconFuncs={[() => getCallStore().startCall('8')]}
        icons={[mdiPhone]}
        name={intl`Voicemail`}
        isVoicemail
      />
    </Layout>
  )
}
