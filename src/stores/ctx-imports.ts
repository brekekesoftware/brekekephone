import '#/api/pbx'
import '#/api/sip'
import '#/api/uc'
import '#/stores/accountStore'
import '#/stores/AuthPBX'
import '#/stores/AuthSIP'
import '#/stores/authStore'
import '#/stores/AuthUC'
import '#/stores/callStore'
import '#/stores/chatStore'
import '#/stores/contactStore'
import '#/stores/userStore'
import '#/stores/debugStore'
import '#/stores/intlStore'
import '#/stores/Nav'
import '#/stores/toastStore'
import '#/api/syncPnToken'
import '#/stores/global'
// api was a component but had been rewritten to a listener
// need to import this last since it requires other modules
import '#/api'

import type { PBX } from '#/api/pbx'
import type { SIP } from '#/api/sip'
import type { SyncPnToken } from '#/api/syncPnToken'
import type { UC } from '#/api/uc'
import type { AccountStore } from '#/stores/accountStore'
import type { AuthPBX } from '#/stores/AuthPBX'
import type { AuthSIP } from '#/stores/AuthSIP'
import type { AuthStore } from '#/stores/authStore'
import type { AuthUC } from '#/stores/AuthUC'
import type { CallStore } from '#/stores/callStore'
import type { ChatStore } from '#/stores/chatStore'
import type { ContactStore } from '#/stores/contactStore'
import type { DebugStore } from '#/stores/debugStore'
import type { GlobalStore } from '#/stores/global'
import type { IntlStore } from '#/stores/intlStore'
import type { Nav } from '#/stores/Nav'
import type { ToastStore } from '#/stores/toastStore'
import type { UserStore } from '#/stores/userStore'

export type Ctx = {
  pbx: PBX
  sip: SIP
  uc: UC
  authPBX: AuthPBX
  authSIP: AuthSIP
  authUC: AuthUC
  intl: IntlStore
  auth: AuthStore
  account: AccountStore
  call: CallStore
  chat: ChatStore
  contact: ContactStore
  user: UserStore
  debug: DebugStore
  toast: ToastStore
  nav: Nav
  pnToken: SyncPnToken
  global: GlobalStore
}
