import { observer } from 'mobx-react'
import React from 'react'

import ProfileCreateForm from '../components/ProfileCreateForm'
import { getAuthStore } from '../stores/authStore'
import intl from '../stores/intl'
import Nav from '../stores/Nav'
import profileStore, { Profile } from '../stores/profileStore'
import RnAlert from '../stores/RnAlert'

const PageSettingsProfile = observer(() => (
  <ProfileCreateForm
    footerLogout
    onBack={Nav().backToPageContactUsers}
    onSave={(p: Profile, hasUnsavedChanges: boolean) => {
      if (!hasUnsavedChanges) {
        Nav().backToPageContactPhonebook()
      }
      RnAlert.prompt({
        title: intl`Save Account`,
        message: intl`Do you want to update your account?\nYou'll need to sign out and then sign in again.`,
        onConfirm: () => {
          profileStore.upsertProfile(p)
          Nav().goToPageProfileSignIn()
          window.setTimeout(() => getAuthStore().signIn(p.id), 300)
        },
        confirmText: intl`SAVE`,
      })
    }}
    title={intl`Current Account`}
    updatingProfile={getAuthStore().currentProfile}
  />
))

export default PageSettingsProfile
