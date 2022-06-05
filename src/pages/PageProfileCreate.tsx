import { ProfileCreateForm } from '../components/ProfileCreateForm'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { Account, profileStore } from '../stores/profileStore'

export const PageProfileCreate = () => (
  <ProfileCreateForm
    onBack={Nav().backToPageProfileSignIn}
    onSave={(p: Account) => {
      profileStore.upsertProfile(p)
      Nav().backToPageProfileSignIn()
    }}
    title={intl`New Account`}
  />
)
