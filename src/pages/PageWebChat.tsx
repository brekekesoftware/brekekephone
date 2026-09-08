import { observer } from 'mobx-react'
import { Component } from 'react'

import { ListWebchats } from '#/components/ChatListWebchats'
import { Field } from '#/components/Field'
import { Layout } from '#/components/Layout'
import { RnText } from '#/components/Rn'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

@observer
export class PageWebChat extends Component {
  render() {
    const arr = ctx.chat.groups.filter(group => group.webchat)
    return (
      <Layout
        description={intl`UC recent active chat`}
        dropdown={[
          {
            label: intl`Create group chat`,
            onPress: ctx.nav.goToPageChatGroupCreate,
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
