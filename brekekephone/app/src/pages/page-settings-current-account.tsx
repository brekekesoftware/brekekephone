import { observer } from 'mobx-react'

import { AccountCreateForm } from '#/components/account-create-form'
import { defaultTimeout } from '#/config'
import type { Account } from '#/stores/account-store'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { BackgroundTimer } from '#/utils/background-timer'

export const PageSettingsCurrentAccount = observer(() => (
  <AccountCreateForm
    footerLogout
    onBack={ctx.nav.backToPageContactUsers}
    onSave={(p: Account, hasUnsavedChanges: boolean) => {
      if (!hasUnsavedChanges) {
        ctx.nav.backToPageContactPhonebook()
      }
      RnAlert.prompt({
        title: intl`Save Account`,
        message: intl`Do you want to update your account?\nYou'll need to sign out and then sign in again`,
        onConfirm: () => {
          ctx.account.upsertAccount(p)
          ctx.nav.goToPageAccountSignIn()
          BackgroundTimer.setTimeout(() => ctx.auth.signIn(p), defaultTimeout)
        },
        confirmText: intl`SAVE`,
      })
    }}
    title={intl`Current Account`}
    updating={ctx.auth.getCurrentAccount()}
  />
))
