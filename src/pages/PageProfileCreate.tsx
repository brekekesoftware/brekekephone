import { ProfileCreateForm } from '../components/ProfileCreateForm'
import { Account, accountStore } from '../stores/accountStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'

export const PageProfileCreate = () => (
  <ProfileCreateForm
    onBack={Nav().backToPageProfileSignIn}
    onSave={(p: Account) => {
      accountStore.upsertAccount(p)
      Nav().backToPageProfileSignIn()
    }}
    title={intl`New Account`}
  />
)
