import { observer } from 'mobx-react'
import { Component } from 'react'

import { ListWebchats } from '../components/ChatListWebchats'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { RnText } from '../components/Rn'
import { chatStore } from '../stores/chatStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'

@observer
export class PageWebChat extends Component {
  render() {
    const arr = chatStore.groups.filter(group => group.webchat)
    return (
      <Layout
        description={intl`UC recent active chat`}
        dropdown={[
          {
            label: intl`Create group chat`,
            onPress: Nav().goToPageChatGroupCreate,
          },
        ]}
        menu='contact'
        subMenu='webchat'
        title={intl`WebChat`}
      >
        <Field isGroup label={intl`WEBCHAT THREADS`} />
        {!arr.length && (
          <RnText center normal small warning style={{ marginTop: 5 }}>
            {intl`There's no active chat thread`}
          </RnText>
        )}
        <ListWebchats datas={arr} />
      </Layout>
    )
  }
}
