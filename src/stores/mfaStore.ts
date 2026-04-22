import { action, observable } from 'mobx'

import { ctx } from '#/stores/ctx'

export class MFAStore {
  @observable accountId: string | null = null
  // When true, skip PBX reconnect after MFA verification.
  // Used by syncPnToken flow which only needs to save the token
  // without triggering a full PBX reconnect with device_token.
  skipReconnect = false
  private _resolvers: Array<(ok: boolean) => void> = []

  @action show = (id: string, opts?: { skipReconnect?: boolean }) => {
    if (this.accountId === id) {
      // If any caller needs reconnect, honor it
      this.skipReconnect = this.skipReconnect && (opts?.skipReconnect ?? false)
      return
    }
    this._resolvers.forEach(r => r(false))
    this._resolvers = []
    this.accountId = id
    this.skipReconnect = opts?.skipReconnect ?? false
  }

  @action hide = () => {
    this.accountId = null
    this.skipReconnect = false
  }

  @action complete = (): boolean => {
    const rs = this._resolvers
    this._resolvers = []
    this.accountId = null
    this.skipReconnect = false
    const hadAwaiters = rs.length > 0
    rs.slice(0, -1).forEach(r => r(false))
    rs[rs.length - 1]?.(true)
    return hadAwaiters
  }

  @action cancel = () => {
    const rs = this._resolvers
    this._resolvers = []
    this.accountId = null
    this.skipReconnect = false
    rs.forEach(r => r(false))
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
