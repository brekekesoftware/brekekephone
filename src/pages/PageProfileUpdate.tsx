import { observer } from 'mobx-react'
import { FC } from 'react'

import { ProfileCreateForm } from '../components/ProfileCreateForm'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { Account, profileStore } from '../stores/profileStore'

export const PageProfileUpdate: FC<{
  id: string
}> = observer(props => (
  <ProfileCreateForm
    onBack={Nav().backToPageProfileSignIn}
    onSave={(p: Account) => {
      profileStore.upsertProfile(p)
      Nav().backToPageProfileSignIn()
    }}
    title={intl`Update Account`}
    updatingProfile={profileStore.profilesMap[props.id]}
  />
))
