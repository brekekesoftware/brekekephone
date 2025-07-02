import { AccountCreateForm } from '#/components/AccountCreateForm'
import type { Account } from '#/stores/accountStore'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

export const PageAccountCreate = () => (
  <AccountCreateForm
    onBack={ctx.nav.backToPageAccountSignIn}
    onSave={(p: Account) => {
      ctx.account.upsertAccount(p)
      ctx.nav.backToPageAccountSignIn()
    }}
    title={intl`New Account`}
  />
)
