import { Buffer } from 'buffer'
import CircularJson from 'circular-json'
import debounce from 'lodash/debounce'
import { computed, observable } from 'mobx'
import moment from 'moment'
import { Linking, Platform } from 'react-native'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'

import intl, { intlDebug } from '../intl/intl'
import { RnAsyncStorage } from '../Rn'
import { currentVersion } from '../variables'
import g from '.'

declare global {
  interface Window {
    debugStore: DebugStore
  }
}

let debugStore
// The location of 2 log file, log2 will be deleted and replaced by log1
//    when log1 reach the limit, then log1 will be reset
// The `log` will be used for combining the two above files in ios
//    because in ios Share only works with `file://...` url
const [log, log1, log2] = ['log', 'log1', 'log2'].map(n =>
  Platform.OS === 'web'
    ? ''
    : `${RNFS.DocumentDirectoryPath}/brekeke-phone-${n}.txt`,
)
const maximumBytes = 250000 // 250KB

class DebugStore {
  // By default only error logs will be captured
  // If this flag is turned on, all logs will be captured
  // This flag will be saved to storage and we will read it again
  //    as soon as possible when app starts up
  @observable captureDebugLog = false
  toggleCaptureDebugLog = () => {
    this.captureDebugLog = !this.captureDebugLog
    RnAsyncStorage.setItem(
      'captureDebugLog',
      JSON.stringify(this.captureDebugLog),
    )
  }

  // Cache the size of log files
  @observable logSizes = [0, 0]
  @computed get logSize() {
    return this.logSizes.reduce((sum, s) => sum + s, 0)
  }

  // Use a queue to write logs to file in batch
  logQueue: string[] = []

  // The function to be called in src/-/captureConsoleOutput.js
  captureConsoleOutput = (lv, ...args) => {
    if (lv !== 'error' && lv !== 'warn' && !this.captureDebugLog) {
      return
    }
    const msg =
      moment().format('YYYY/MM/DD HH:mm:ss') +
      ` ${lv.toUpperCase()} ` +
      args
        .map(a =>
          !a
            ? `${a}`
            : a.message && a.stack
            ? a.message + ' ' + a.stack
            : typeof a === 'object'
            ? CircularJson.stringify(a)
            : `${a}`,
        )
        .join(' ')
        .replace(/\s+/g, ' ')
    this.logQueue.push(msg)
    this.writeFileBatch()
  }
  writeFile = () =>
    this.writeFileWithoutCatch().catch(err => {
      g.showError({
        message: intlDebug`Failed to write debug log to file`,
        err,
      })
    })
  writeFileWithoutCatch = async () => {
    if (!this.logQueue.length) {
      return
    }
    const msg = this.logQueue.join('\n')
    this.logQueue = []
    // Append to log1
    await RNFS.appendFile(log1, msg + '\n', 'utf8')
    const { size } = await RNFS.stat(log1)
    this.logSizes[0] = Number(size)
    // If the size of log1 passes the limit
    //    we will copy it to log2 and clear the log1
    if (this.logSizes[0] > maximumBytes) {
      if (await RNFS.exists(log2)) {
        await RNFS.unlink(log2)
      }
      await RNFS.moveFile(log1, log2)
      this.logSizes[1] = this.logSizes[0]
    }
  }
  writeFileBatch = debounce(this.writeFile, 300, { maxWait: 1000 })

  openLogFile = () =>
    this.openLogFileWithoutCatch().catch(err => {
      g.showError({
        message: intlDebug`Failed to build and open log file`,
        err,
      })
    })
  openLogFileWithoutCatch = async () => {
    const promises = [log1, log2].map(l =>
      RNFS.exists(l)
        .then(e => (e ? RNFS.readFile(l, 'utf8') : ''))
        .then(f => f || ''),
    )
    const [f0, f1] = await Promise.all(promises)
    const title = `brekeke_phone_log_${moment().format('YYMMDDHHmmss')}.txt`
    let url: string | null = null
    // Share works inconsistency between android and ios
    if (Platform.OS === 'ios') {
      await RNFS.writeFile(log, f1 + f0, 'utf8')
      url = log // only works with `file://...`
    } else {
      const b64 = Buffer.from(f1 + f0).toString('base64')
      url = `data:text/plain;base64,${b64}` // only works with base64
    }
    Share.open({ title, url, subject: title })
  }

  clearLogFiles = () => {
    g.showPrompt({
      title: intl`Clear Logs`,
      message: intl`Do you want to clear all the log files?`,
      onConfirm: this.clearLogFilesWithoutPrompt,
      confirmText: intl`CLEAR`,
    })
  }
  clearLogFilesWithoutPrompt = () =>
    this.clearLogFilesWithoutCatch().catch(err => {
      g.showError({
        message: intlDebug`Failed to clear the log files`,
        err,
      })
    })
  clearLogFilesWithoutCatch = () =>
    Promise.all(
      [log1, log2].map((l, i) =>
        RNFS.exists(l)
          .then(e => (e ? RNFS.unlink(l) : undefined))
          .then(() => (this.logSizes[i] = 0)),
      ),
    )

  @observable isCheckingForUpdate = false
  @observable remoteVersion = ''
  @observable remoteVersionLastCheck = 0
  @computed get isUpdateAvailable() {
    const a1 = currentVersion.split('.')
    const a2 = this.remoteVersion.split('.')
    return a1.reduce((available, v, i) => {
      const v1 = Number(v) || 0
      const v2 = Number(a2[i]) || 0
      return available || v2 > v1
    }, false)
  }

  checkForUpdate = () => {
    if (this.isCheckingForUpdate) {
      return
    }
    this.isCheckingForUpdate = true
    const p =
      Platform.OS === 'android'
        ? window
            .fetch(
              'https://play.google.com/store/apps/details?id=com.brekeke.phone&hl=en',
            )
            .then(res => res.text())
            .then(t =>
              t.match(/Current Version.+>([\d.]+)<\/span>/)?.[1].trim(),
            )
        : window
            .fetch('https://itunes.apple.com/lookup?bundleId=com.brekeke.phone')
            .then(res => res.json())
            .then(j => j.results?.[0].version)
    p.then(v => {
      if (!v) {
        throw new Error('The returned version from app store is empty')
      }
      this.remoteVersion = v
      this.remoteVersionLastCheck = Date.now()
      this.isCheckingForUpdate = false
    })
      .then(this.saveRemoteVersionToStorage)
      .catch(err => {
        g.showError({
          message: intlDebug`Failed to get app version from app store`,
          err,
        })
        this.isCheckingForUpdate = false
      })
  }
  saveRemoteVersionToStorage = () => {
    RnAsyncStorage.setItem(
      'remoteVersion',
      JSON.stringify({
        version: this.remoteVersion,
        lastCheck: this.remoteVersionLastCheck,
      }),
    ).catch(err => {
      g.showError({
        message: intlDebug`Failed to save app version to storage`,
        err,
      })
    })
  }

  openInStore = () => {
    Linking.openURL(
      Platform.OS === 'android'
        ? 'https://play.google.com/store/apps/details?id=com.brekeke.phone'
        : 'itms-apps://apps.apple.com/app/id1233825750',
    )
  }
  autoCheckForUpdate = () => {
    // Check for update in every 14 days
    // https://softwareengineering.stackexchange.com/questions/202316
    if (Date.now() - this.remoteVersionLastCheck > 14 * 24 * 60 * 60 * 1000) {
      this.checkForUpdate()
    }
  }

  init = () => {
    // Read size of log files using stat for the initial state
    const promises = [log1, log2].map((l, i) =>
      RNFS.exists(l)
        .then(e => (e ? RNFS.stat(l) : undefined))
        .then(e => (e ? (this.logSizes[i] = Number(e.size) || 0) : 0))
        .catch(err => {
          g.showError({
            message: intlDebug`Failed to read debug log file size`,
            err,
          })
        }),
    )
    // Delete the combined unused log file
    // This file will be created every time user request opening the log file
    //    (ios only because in ios Share only works with `file://...` url)
    promises.push(
      RNFS.exists(log)
        .then(e => (e ? RNFS.unlink(log) : undefined))
        .catch(err => {
          g.showError({
            message: intlDebug`Failed to delete unused debug log file`,
            err,
          })
        }),
    )
    // Read debug log settings from storage
    promises.push(
      RnAsyncStorage.getItem('captureDebugLog')
        .then(v => v && (this.captureDebugLog = JSON.parse(v)))
        .catch(err => {
          g.showError({
            message: intlDebug`Failed to read debug log settings from storage`,
            err,
          })
        }),
    )
    // Read remote app version from storage
    promises.push(
      RnAsyncStorage.getItem('remoteVersion')
        .then(v => v && JSON.parse(v))
        .then(v => {
          if (v) {
            this.remoteVersion = v.version
            this.remoteVersionLastCheck = v.lastCheck
          }
          this.autoCheckForUpdate()
        })
        .catch(err => {
          g.showError({
            message: intlDebug`Failed to read app version from storage`,
            err,
          })
        }),
    )
    //
    return Promise.all(promises)
  }
}

if (Platform.OS !== 'web') {
  // Assign to window to use in src/-/captureConsoleOutput.js
  debugStore = window.debugStore = new DebugStore()

  // TODO call init together with other store
  // Need to determine the order of init functions and call them using await
  debugStore.init()
}
export default debugStore
