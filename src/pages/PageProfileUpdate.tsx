import { observer } from 'mobx-react'
import { FC } from 'react'

import { ProfileCreateForm } from '../components/ProfileCreateForm'
import { Account, accountStore, PNOptions } from '../stores/accountStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'

export const PageProfileUpdate: FC<{
  id: string
}> = observer(props => {
  return (
    <ProfileCreateForm
      onBack={Nav().backToPageProfileSignIn}
      onSave={(p: Account) => {
        accountStore.upsertAccount(p)
        Nav().backToPageProfileSignIn()
      }}
      title={intl`Update Account`}
      updatingProfile={accountStore.accountsMap[props.id]}
    />
  )
})
