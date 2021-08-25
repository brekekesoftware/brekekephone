import React from 'react'

import { ProfileCreateForm } from '../components/ProfileCreateForm'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { Profile, profileStore } from '../stores/profileStore'

export const PageProfileCreate = () => (
  <ProfileCreateForm
    onBack={Nav().backToPageProfileSignIn}
    onSave={(p: Profile) => {
      profileStore.upsertProfile(p)
      Nav().backToPageProfileSignIn()
    }}
    title={intl`New Account`}
  />
)
