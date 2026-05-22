import '#/api/pbx'
import '#/api/sip'
import '#/api/uc'
import '#/stores/account-store'
import '#/stores/mfa-store'
import '#/stores/auth-pbx'
import '#/stores/auth-sip'
import '#/stores/auth-store'
import '#/stores/auth-uc'
import '#/stores/call-store'
import '#/stores/chat-store'
import '#/stores/contact-store'
import '#/stores/user-store'
import '#/stores/debug-store'
import '#/stores/intl-store'
import '#/stores/nav'
import '#/stores/toast-store'
import '#/api/sync-pn-token'
import '#/stores/global'
import '#/embed/embed-api'
// api was a component but had been rewritten to a listener
// need to import this last since it requires other modules
import '#/api'

import type { PBX } from '#/api/pbx'
import type { SIP } from '#/api/sip'
import type { SyncPnToken } from '#/api/sync-pn-token'
import type { UC } from '#/api/uc'
import type { EmbedApi } from '#/embed/embed-api'
import type { AccountStore } from '#/stores/account-store'
import type { AuthPBX } from '#/stores/auth-pbx'
import type { AuthSIP } from '#/stores/auth-sip'
import type { AuthStore } from '#/stores/auth-store'
import type { AuthUC } from '#/stores/auth-uc'
import type { CallStore } from '#/stores/call-store'
import type { ChatStore } from '#/stores/chat-store'
import type { ContactStore } from '#/stores/contact-store'
import type { DebugStore } from '#/stores/debug-store'
import type { GlobalStore } from '#/stores/global'
import type { IntlStore } from '#/stores/intl-store'
import type { MFAStore } from '#/stores/mfa-store'
import type { Nav } from '#/stores/nav'
import type { ToastStore } from '#/stores/toast-store'
import type { UserStore } from '#/stores/user-store'

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
  mfa: MFAStore
  call: CallStore
  chat: ChatStore
  contact: ContactStore
  user: UserStore
  debug: DebugStore
  toast: ToastStore
  nav: Nav
  pnToken: SyncPnToken
  global: GlobalStore
  embed: EmbedApi
}
