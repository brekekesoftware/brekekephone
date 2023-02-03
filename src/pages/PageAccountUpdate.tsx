import { observer } from 'mobx-react'
import { FC } from 'react'

import { AccountCreateForm } from '../components/AccountCreateForm'
import { Account, accountStore } from '../stores/accountStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'

export const PageAccountUpdate: FC<{
  id: string
}> = observer(props => {
  return (
    <AccountCreateForm
      onBack={Nav().backToPageAccountSignIn}
      onSave={(p: Account) => {
        accountStore.upsertAccount(p)
        Nav().backToPageAccountSignIn()
      }}
      title={intl`Update Account`}
      updating={accountStore.accountsMap[props.id]}
    />
  )
})
