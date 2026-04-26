import { action, observable } from 'mobx'

import { ctx } from '#/stores/ctx'

export class MFAStore {
  @observable accountId: string | null = null
  // When true, skip PBX reconnect after MFA verification.
  // Used by syncPnToken flow which only needs to save the token
  // without triggering a full PBX reconnect with device_token.
  skipReconnect = false
  wasCancelled = false
  cancelledAccountId: string | null = null
  // Server error from mfa/start FAILED response (e.g. "No email address.").
  // When non-empty, modal renders in error mode instead of normal OTP entry.
  @observable error = ''
  private _resolvers: Array<(ok: boolean) => void> = []

  @action show = (
    id: string,
    opts?: { skipReconnect?: boolean; error?: string },
  ) => {
    if (this.accountId === id) {
      // If any caller needs reconnect, honor it
      this.skipReconnect = this.skipReconnect && (opts?.skipReconnect ?? false)
      this.error = opts?.error || this.error
      return
    }
    this._resolvers.forEach(r => r(false))
    this._resolvers = []
    this.accountId = id
    this.skipReconnect = opts?.skipReconnect ?? false
    this.wasCancelled = false
    this.cancelledAccountId = null
    this.error = opts?.error || ''
  }

  @action hide = () => {
    this.accountId = null
    this.skipReconnect = false
    this.error = ''
  }

  @action complete = (): boolean => {
    const rs = this._resolvers
    this._resolvers = []
    this.accountId = null
    this.skipReconnect = false
    this.wasCancelled = false
    this.cancelledAccountId = null
    this.error = ''
    const hadAwaiters = rs.length > 0
    rs.forEach(r => r(true))
    return hadAwaiters
  }

  @action cancel = () => {
    const rs = this._resolvers
    this._resolvers = []
    this.cancelledAccountId = this.accountId
    this.accountId = null
    this.skipReconnect = false
    this.wasCancelled = true
    this.error = ''
    rs.forEach(r => r(false))
  }

  // Clean reset — for signIn/signOut where no user cancellation occurred.
  // Unlike cancel(), this does NOT set wasCancelled=true, so subsequent
  // PN navigation / deeplink flows won't be blocked by stale cancel state.
  @action reset = () => {
    const rs = this._resolvers
    this._resolvers = []
    this.accountId = null
    this.skipReconnect = false
    this.wasCancelled = false
    this.cancelledAccountId = null
    this.error = ''
    rs.forEach(r => r(false))
  }

  // Called by signOut — preserves wasCancelled/cancelledAccountId so
  // syncPnToken does not trigger a new mfa/start immediately after cancel.
  @action signOutReset = () => {
    const rs = this._resolvers
    this._resolvers = []
    this.accountId = null
    this.skipReconnect = false
    this.error = ''
    rs.forEach(r => r(false))
  }

  // Clear cancel state when a new sign-in begins for the same account,
  // so waitMfaIfNeeded and PN navigation are not blocked by stale cancel state.
  @action clearCancelled = () => {
    this.wasCancelled = false
    this.cancelledAccountId = null
  }

  isShowing = (id: string) => this.accountId === id

  waitComplete = (): Promise<boolean> =>
    new Promise(resolve => {
      this._resolvers.push(resolve)
      setTimeout(() => {
        const idx = this._resolvers.indexOf(resolve)
        if (idx !== -1) {
          this._resolvers.splice(idx, 1)
          resolve(false)
        }
      }, 600_000)
    })
}

ctx.mfa = new MFAStore()
