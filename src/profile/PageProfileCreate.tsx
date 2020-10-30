import React from 'react'

import Nav from '../global/Nav'
import profileStore from '../global/profileStore'
import intl from '../intl/intl'
import ProfileCreateForm from './ProfileCreateForm'

const PageProfileCreate = () => (
  <ProfileCreateForm
    onBack={Nav.backToPageProfileSignIn}
    onSave={p => {
      profileStore.upsertProfile(p)
      Nav.backToPageProfileSignIn()
    }}
    title={intl`New Account`}
  />
)

export default PageProfileCreate
