import { observer } from 'mobx-react'
import type { FC } from 'react'

import { AccountCreateForm } from '#/components/AccountCreateForm'
import type { Account } from '#/stores/accountStore'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

export const PageAccountUpdate: FC<{
  id: string
}> = observer(props => (
  <AccountCreateForm
    onBack={ctx.nav.backToPageAccountSignIn}
    onSave={(p: Account) => {
      ctx.account.upsertAccount(p)
      ctx.nav.backToPageAccountSignIn()
    }}
    title={intl`Update Account`}
    updating={ctx.account.accountsMap[props.id]}
  />
))
