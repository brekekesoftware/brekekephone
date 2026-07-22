import { makeAutoObservable } from 'mobx'

import type { MfaEventStatus, Pbx } from '#/brekekejs'
import { isEmbed } from '#/embed/polyfill'
import type { Account } from '#/stores/account-store'
import { ctx } from '#/stores/ctx'

declare const require: (path: string) => any

type MfaSnapshot = {
  accountId: string
  type?: 'code' | 'url'
  url?: string
  error?: string
}

const getEmbedApi = () =>
  (require('#/embed/embed-api') as typeof import('#/embed/embed-api')).embedApi

export class MFAStore {
  constructor() {
    makeAutoObservable(this)
  }

  accountId: string | null = null
  // OTP delivery type + url from mfa/start, surfaced to host via embed events.
  type: 'code' | 'url' | undefined = undefined
  url = ''
  // When true, skip PBX reconnect after MFA verification.
  // Used by syncPnToken flow which only needs to save the token
  // without triggering a full PBX reconnect with device_token.
  skipReconnect = false
  wasCancelled = false
  cancelledAccountId: string | null = null
  // Server error from mfa/start FAILED response (e.g. "No email address.").
  // When non-empty, modal renders in error mode instead of normal OTP entry.
  error = ''
  palClient?: {
    accountKey: string
    client: Pbx
  }
  private _resolvers: Array<(ok: boolean) => void> = []

  private snapshot = (
    accountId: string | null = this.accountId,
  ): MfaSnapshot | undefined => {
    if (!accountId) {
      return undefined
    }
    return {
      accountId,
      type: this.type,
      url: this.url,
      error: this.error,
    }
  }

  // Emit MFA lifecycle to embed host (no-op outside embed). Caller must capture
  // the payload snapshot before clearing state so accountId is never lost.
  private emitMfa = (status: MfaEventStatus, snap: MfaSnapshot) => {
    if (!isEmbed) {
      return
    }
    const a = ctx.account.accountsMap[snap.accountId]
    getEmbedApi().emit('mfa', {
      status,
      accountId: snap.accountId,
      tenant: a?.pbxTenant,
      user: a?.pbxUsername,
      type: snap.type,
      url: snap.url || undefined,
      message: snap.error || undefined,
    })
  }

  show = (
    id: string,
    opts?: {
      skipReconnect?: boolean
      error?: string
      type?: 'code' | 'url'
      url?: string
    },
  ) => {
    if (this.accountId === id) {
      // Same session/account (e.g. resend) - merge state only, do NOT re-emit.
      this.skipReconnect = this.skipReconnect && (opts?.skipReconnect ?? false)
      this.error = opts?.error || this.error
      if (
        isEmbed &&
        !opts?.error &&
        (opts?.type !== undefined || opts?.url !== undefined)
      ) {
        this.error = ''
      }
      if (opts?.type !== undefined) {
        this.type = opts.type
      }
      if (opts?.url !== undefined) {
        this.url = opts.url
      }
      return
    }
    this._resolvers.forEach(r => r(false))
    this._resolvers = []
    this.accountId = id
    this.skipReconnect = opts?.skipReconnect ?? false
    this.wasCancelled = false
    this.cancelledAccountId = null
    this.error = opts?.error || ''
    this.type = opts?.type
    this.url = opts?.url || ''
    this.emitMfa(opts?.error ? 'error' : 'required', {
      accountId: id,
      type: this.type,
      url: this.url,
      error: this.error,
    })
  }

  hide = () => {
    this.accountId = null
    this.skipReconnect = false
    this.error = ''
    this.palClient = undefined
    this.type = undefined
    this.url = ''
  }

  complete = (): boolean => {
    const snap = this.snapshot()
    const rs = this._resolvers
    this._resolvers = []
    this.accountId = null
    this.skipReconnect = false
    this.wasCancelled = false
    this.cancelledAccountId = null
    this.error = ''
    this.palClient = undefined
    this.type = undefined
    this.url = ''
    if (snap) {
      this.emitMfa('verified', snap)
    }
    const hadAwaiters = rs.length > 0
    rs.forEach(r => r(true))
    return hadAwaiters
  }

  cancel = () => {
    const snap = this.snapshot()
    const rs = this._resolvers
    this._resolvers = []
    this.cancelledAccountId = this.accountId
    this.accountId = null
    this.skipReconnect = false
    this.wasCancelled = true
    this.error = ''
    this.palClient = undefined
    this.type = undefined
    this.url = ''
    if (snap) {
      this.emitMfa('cancelled', snap)
    }
    rs.forEach(r => r(false))
  }

  // Surface a failure that happens outside show() (e.g. device_token/create
  // fail after a valid code). Keeps accountId/type/url/resolvers so the user
  // can still retry/resend/cancel.
  fail = (message: string, account?: Account) => {
    if (!isEmbed) {
      return
    }
    this.error = message
    const id = this.accountId || account?.id
    if (id) {
      const snap = this.snapshot(id) || {
        accountId: id,
      }
      this.emitMfa('error', {
        ...snap,
        error: message,
      })
    }
  }

  // Clean reset - for signIn/signOut where no user cancellation occurred.
  // Unlike cancel(), this does NOT set wasCancelled=true, so subsequent
  // PN navigation / deeplink flows won't be blocked by stale cancel state.
  reset = () => {
    const snap = this.snapshot()
    const rs = this._resolvers
    this._resolvers = []
    this.accountId = null
    this.skipReconnect = false
    this.wasCancelled = false
    this.cancelledAccountId = null
    this.error = ''
    this.palClient = undefined
    this.type = undefined
    this.url = ''
    if (snap) {
      this.emitMfa('closed', snap)
    }
    rs.forEach(r => r(false))
  }

  // Called by signOut - preserves wasCancelled/cancelledAccountId so
  // syncPnToken does not trigger a new mfa/start immediately after cancel.
  signOutReset = () => {
    const snap = this.snapshot()
    const rs = this._resolvers
    this._resolvers = []
    this.accountId = null
    this.skipReconnect = false
    this.error = ''
    this.palClient = undefined
    this.type = undefined
    this.url = ''
    if (snap) {
      this.emitMfa('closed', snap)
    }
    rs.forEach(r => r(false))
  }

  // Clear cancel state when a new sign-in begins for the same account,
  // so waitMfaIfNeeded and PN navigation are not blocked by stale cancel state.
  clearCancelled = () => {
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
