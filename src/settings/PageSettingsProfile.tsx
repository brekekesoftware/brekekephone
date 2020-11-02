import { observer } from 'mobx-react'
import React from 'react'

import authStore from '../global/authStore'
import Nav from '../global/Nav'
import profileStore from '../global/profileStore'
import RnAlert from '../global/RnAlert'
import intl from '../intl/intl'
import ProfileCreateForm from '../profile/ProfileCreateForm'

const PageSettingsProfile = observer(() => (
  <ProfileCreateForm
    footerLogout
    onBack={Nav().backToPageContactUsers}
    onSave={(p, hasUnsavedChanges) => {
      if (!hasUnsavedChanges) {
        Nav().backToPageContactPhonebook()
      }
      RnAlert.prompt({
        title: intl`Save Account`,
        message: intl`Do you want to update your account?\nYou'll need to sign out and then sign in again.`,
        onConfirm: () => {
          profileStore.upsertProfile(p)
          Nav().goToPageProfileSignIn()
          window.setTimeout(() => authStore.signIn(p.id), 300)
        },
        confirmText: intl`SAVE`,
      })
    }}
    title={intl`Current Account`}
    updatingProfile={authStore.currentProfile}
  />
))

export default PageSettingsProfile
