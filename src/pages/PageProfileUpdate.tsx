import { observer } from 'mobx-react'
import React from 'react'

import ProfileCreateForm from '../components/ProfileCreateForm'
import intl from '../stores/intl'
import Nav from '../stores/Nav'
import profileStore from '../stores/profileStore'

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
