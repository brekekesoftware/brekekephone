import { reaction } from 'mobx'
import { AppState } from 'react-native'

import { getLpcServerFromConfig } from '#/api/syncPnToken'
import { isAndroid } from '#/config'
import type { Account } from '#/stores/accountStore'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'

const twoMinutes = 2 * 60 * 1000

const checkCanPrompt = (a: Account): string | undefined => {
  if (!isAndroid) {
    return 'not android'
  }
  if (AppState.currentState !== 'active') {
    return 'app not active'
  }
  if (
    Object.keys(ctx.call.callkeepMap).length ||
    ctx.sip.phone?.getSessionCount() ||
    ctx.call.calls.length
  ) {
    return 'call in progress'
  }
  if (ctx.auth.signedInId !== a.id) {
    return 'not signed in'
  }
  if (!a.pushNotificationEnabled) {
    return 'push off'
  }
  if (a.lpcEnabled) {
    return 'lpc already on'
  }
  if (!ctx.auth.pbxConfig) {
    return 'no pbx config'
  }
  const lpcServer = getLpcServerFromConfig(ctx.auth.pbxConfig)
  if (!lpcServer.available || lpcServer.optional) {
    return 'server lpc unavailable'
  }
  const inMFA = ctx.account.isAccountInMFA(a)
  const needsMFA = ctx.account.needsMFAForPnSync(a)
  if (inMFA || needsMFA) {
    return 'waiting on two-factor'
  }
  return undefined
}

export const promptEnableLpc = (a: Account) => {
  const intent = ctx.auth.lpcPromptIntent
  ctx.auth.lpcPromptIntent = undefined
  const intentAge = intent ? Date.now() - intent.at : -1
  console.log(
    `LPC prompt debug: entry user=${a.pbxUsername} hasIntent=${!!intent} intentMatchesAccount=${intent?.id === a.id} intentAgeMs=${intentAge}`,
  )
  if (!intent || intent.id !== a.id || intentAge > twoMinutes) {
    return
  }
  const appState = AppState.currentState
  const callCount =
    Object.keys(ctx.call.callkeepMap).length +
    (ctx.sip.phone?.getSessionCount() ?? 0) +
    ctx.call.calls.length
  const sipAuth = !!ctx.auth.sipPn.sipAuth
  const signedInId = ctx.auth.signedInId
  const pushOn = a.pushNotificationEnabled
  const lpcOn = a.lpcEnabled
  const hasPbxConfig = !!ctx.auth.pbxConfig
  const lpcServer = getLpcServerFromConfig(ctx.auth.pbxConfig)
  const inMFA = ctx.account.isAccountInMFA(a)
  const needsMFA = ctx.account.needsMFAForPnSync(a)
  const reason = checkCanPrompt(a)
  console.log(
    `LPC prompt debug: check user=${a.pbxUsername} appState=${appState} callCount=${callCount} sipAuth=${sipAuth} signedInId=${signedInId} pushOn=${pushOn} lpcOn=${lpcOn} hasPbxConfig=${hasPbxConfig} lpcAvailable=${lpcServer.available} lpcOptional=${lpcServer.optional} inMFA=${inMFA} needsMFA=${needsMFA} outcome=${reason ?? 'shown'}`,
  )
  if (reason) {
    return
  }
  const title = intl`Fallback local connection`
  let disposed = false
  const dispose = () => {
    if (!disposed) {
      disposed = true
      disposeReaction()
    }
  }
  RnAlert.prompt({
    title,
    message: intl`This server delivers calls and messages only through the local connection. When turned off, calls and messages may not arrive while the app is closed. While it is on, Android shows an ongoing notification. You can switch it off anytime in Account Settings. Would you like to enable the fallback local connection?`,
    confirmText: intl`ENABLE`,
    dismissText: intl`DISMISS`,
    dismissOnBackdropPress: false,
    onDismiss: () => {
      dispose()
      console.log(`LPC prompt debug: dismissed user=${a.pbxUsername}`)
    },
    onConfirm: () => {
      dispose()
      const confirmReason = checkCanPrompt(a)
      console.log(
        `LPC prompt debug: confirmed user=${a.pbxUsername} secondCheckOutcome=${confirmReason ?? 'ok'}`,
      )
      if (confirmReason) {
        return
      }
      ctx.account.upsertAccount(
        { id: a.id, lpcEnabled: true },
        { blockUi: true, skipFgsPrompt: true },
      )
    },
  })
  // dispose on every exit or the reaction fires later and closes an unrelated dialog
  const disposeReaction = reaction(
    () => Object.keys(ctx.call.callkeepMap).length + ctx.call.calls.length,
    count => {
      if (count > 0) {
        const front = RnAlert.alerts[0]
        if (front && 'prompt' in front && front.prompt.title === title) {
          RnAlert.dismiss()
        }
        dispose()
      }
    },
  )
}
