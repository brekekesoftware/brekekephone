import { AccountCreateForm } from '../components/AccountCreateForm'
import { Account, accountStore } from '../stores/accountStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'

export const PageAccountCreate = () => (
  <AccountCreateForm
    onBack={Nav().backToPageAccountSignIn}
    onSave={(p: Account) => {
      accountStore.upsertAccount(p)
      Nav().backToPageAccountSignIn()
    }}
    title={intl`New Account`}
  />
)
