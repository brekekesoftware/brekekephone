import React from 'react'

import ProfileCreateForm from '../components/ProfileCreateForm'
import intl from '../stores/intl'
import Nav from '../stores/Nav'
import profileStore, { Profile } from '../stores/profileStore'

const PageProfileCreate = () => (
  <ProfileCreateForm
    onBack={Nav().backToPageProfileSignIn}
    onSave={(p: Profile) => {
      profileStore.upsertProfile(p)
      Nav().backToPageProfileSignIn()
    }}
    title={intl`New Account`}
  />
)

export default PageProfileCreate
