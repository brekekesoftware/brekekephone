import { observer } from 'mobx-react'

import { AccountCreateForm } from '#/components/AccountCreateForm'
import { defaultTimeout } from '#/config'
import type { Account } from '#/stores/accountStore'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { BackgroundTimer } from '#/utils/BackgroundTimer'

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
