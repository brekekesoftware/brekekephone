import { observer } from 'mobx-react'
import React from 'react'

import ProfileCreateForm from '../-profile/ProfileCreateForm'
import g from '../global'
import authStore from '../global/authStore'
import RnAlert from '../global/RnAlert'
import intl from '../intl/intl'

const PageSettingsProfile = observer(() => (
  <ProfileCreateForm
    footerLogout
    onBack={g.backToPageContactUsers}
    onSave={(p, hasUnsavedChanges) => {
      if (!hasUnsavedChanges) {
        g.backToPageContactPhonebook()
      }
      RnAlert.prompt({
        title: intl`Save Account`,
        message: intl`Do you want to update your account?\nYou'll need to sign out and then sign in again.`,
        onConfirm: () => {
          g.upsertProfile(p)
          g.goToPageProfileSignIn()
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
