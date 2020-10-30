import React from 'react'

import g from '../global'
import Nav from '../global/Nav'
import intl from '../intl/intl'
import ProfileCreateForm from './ProfileCreateForm'

const PageProfileCreate = () => (
  <ProfileCreateForm
    onBack={Nav.backToPageProfileSignIn}
    onSave={p => {
      g.upsertProfile(p)
      Nav.backToPageProfileSignIn()
    }}
    title={intl`New Account`}
  />
)

export default PageProfileCreate
