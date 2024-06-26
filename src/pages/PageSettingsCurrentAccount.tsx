import { observer } from 'mobx-react'

import { AccountCreateForm } from '../components/AccountCreateForm'
import type { Account } from '../stores/accountStore'
import { accountStore } from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
import { BackgroundTimer } from '../utils/BackgroundTimer'

export const PageSettingsCurrentAccount = observer(() => (
  <AccountCreateForm
    footerLogout
    onBack={Nav().backToPageContactUsers}
    onSave={(p: Account, hasUnsavedChanges: boolean) => {
      if (!hasUnsavedChanges) {
        Nav().backToPageContactPhonebook()
      }
      RnAlert.prompt({
        title: intl`Save Account`,
        message: intl`Do you want to update your account?\nYou'll need to sign out and then sign in again.`,
        onConfirm: () => {
          accountStore.upsertAccount(p)
          Nav().goToPageAccountSignIn()
          BackgroundTimer.setTimeout(() => getAuthStore().signIn(p), 300)
        },
        confirmText: intl`SAVE`,
      })
    }}
    title={intl`Current Account`}
    updating={getAuthStore().getCurrentAccount()}
  />
))
