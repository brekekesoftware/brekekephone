import { observer } from 'mobx-react'
import React from 'react'

import Nav from '../global/Nav'
import profileStore from '../global/profileStore'
import intl from '../intl/intl'
import ProfileCreateForm from './ProfileCreateForm'

const PageProfileUpdate = observer(props => (
  <ProfileCreateForm
    onBack={Nav().backToPageProfileSignIn}
    onSave={p => {
      profileStore.upsertProfile(p)
      Nav().backToPageProfileSignIn()
    }}
    title={intl`Update Account`}
    updatingProfile={profileStore.profilesMap[props.id]}
  />
))

export default PageProfileUpdate
