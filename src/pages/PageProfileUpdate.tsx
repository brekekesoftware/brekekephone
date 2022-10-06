import { observer } from 'mobx-react'
import { FC } from 'react'

import { ProfileCreateForm } from '../components/ProfileCreateForm'
import { Account, accountStore, PNOptions } from '../stores/accountStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'

export const PageProfileUpdate: FC<{
  id: string
  pushNotificationType?: PNOptions
}> = observer(props => {
  const profile = props?.pushNotificationType
    ? {
        ...accountStore.accountsMap[props.id],
        pushNotificationType: props.pushNotificationType,
      }
    : accountStore.accountsMap[props.id]
  return (
    <ProfileCreateForm
      onBack={Nav().backToPageProfileSignIn}
      onSave={(p: Account) => {
        accountStore.upsertAccount(p)
        Nav().backToPageProfileSignIn()
      }}
      title={intl`Update Account`}
      updatingProfile={profile}
    />
  )
})
