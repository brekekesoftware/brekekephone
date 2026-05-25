import { observer } from 'mobx-react'

import { ListWebchats } from '#/components/chat-list-webchats'
import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { RnText } from '#/components/rn'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

export const PageWebChat = observer(() => {
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
        <RnText center normal small warning className='mt-1.25'>
          {intl`There's no active chat thread`}
        </RnText>
      )}
      <ListWebchats datas={arr} />
    </Layout>
  )
})
