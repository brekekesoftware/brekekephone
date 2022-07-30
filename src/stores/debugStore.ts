import { Buffer } from 'buffer'
import debounce from 'lodash/debounce'
import { observable } from 'mobx'
import moment from 'moment'
import { Linking, Platform } from 'react-native'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'

import { RnAsyncStorage } from '../components/Rn'
import { currentVersion } from '../components/variables'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { intl, intlDebug } from './intl'
import { RnAlert } from './RnAlert'

declare global {
  interface Window {
    debugStore: DebugStore
  }
}

let store = null as unknown as DebugStore
// The location of 2 log file, log2 will be deleted and replaced by log1
//    when log1 reach the limit, then log1 will be reset
// The `log` will be used for combining the two above files in ios
//    because in ios Share only works with `file://...` url
const [log, log1, log2] = ['log', 'log1', 'log2'].map(n =>
  Platform.OS === 'web'
    ? ''
    : `${RNFS.DocumentDirectoryPath}/brekeke-phone-${n}.txt`,
)
const maximumBytes = 100000 // 100KB

class DebugStore {
  loading = true
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
  getLogSize = () => this.logSizes.reduce((sum, s) => sum + s, 0)

  // Use a queue to write logs to file in batch
  logQueue: string[] = []

  // The function to be called in src/utils/captureConsoleOutput.ts
  captureConsoleOutput = (lv: string, msg: string) => {
    if (lv !== 'error' && lv !== 'warn' && !this.captureDebugLog) {
      return
    }
    msg =
      moment().format('YYYY/MM/DD HH:mm:ss.SSS') +
      ` [${lv.toUpperCase().padStart(5)}] ` +
      msg.replace(/\s*:\s+log@\/.+$/, '')
    this.logQueue.push(msg)
    this.writeFileBatch()
  }
  writeFile = async () => {
    if (this.loading) {
      BackgroundTimer.setTimeout(this.writeFileBatch, 300)
      return
    }
    this.loading = true
    await this.writeFileWithoutCatch().catch((err: Error) => {
      RnAlert.error({
        message: intlDebug`Failed to write debug log to file`,
        err,
      })
    })
    this.loading = false
  }
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
      this.logSizes[1] = this.logSizes[0]
      await RNFS.unlink(log2).catch((e: Error) => void e)
      await RNFS.moveFile(log1, log2)
    }
  }
  writeFileBatch = debounce(this.writeFile, 300, { maxWait: 1000 })

  openLogFile = () =>
    this.openLogFileWithoutCatch().catch((err: Error) => {
      RnAlert.error({
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
    RnAlert.prompt({
      title: intl`Clear Logs`,
      message: intl`Do you want to clear all the log files?`,
      onConfirm: this.clearLogFilesWithoutPrompt,
      confirmText: intl`CLEAR`,
    })
  }
  clearLogFilesWithoutPrompt = () =>
    this.clearLogFilesWithoutCatch().catch((err: Error) => {
      RnAlert.error({
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
  isUpdateAvailable = () => {
    const ac = currentVersion.split('.').map(Number)
    const ar = this.remoteVersion.split('.').map(Number)
    if (ac.length !== 3 || ar.length !== 3) {
      return false
    }
    const [cMajor, cMinor, cPatch] = ac
    const [rMajor, rMinor, rPatch] = ar
    if (cMajor !== rMajor) {
      return cMajor < rMajor
    }
    if (cMinor !== rMinor) {
      return cMinor < rMinor
    }
    return cPatch < rPatch
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
            .then(
              t =>
                t.match(/\[\[\["(\d+\.\d+\.\d+)"\]/)?.[1].trim() ||
                t.match(/Current Version.+>([\d.]+)<\/span>/)?.[1].trim(),
            )
        : window
            .fetch('https://itunes.apple.com/lookup?bundleId=com.brekeke.phone')
            .then(res => res.json())
            .then(
              (j: {
                results?: {
                  version: string
                }[]
              }) => j.results?.[0].version,
            )
    p.then(v => {
      if (!v) {
        throw new Error('The returned version from app store is empty')
      }
      this.remoteVersion = v
      this.remoteVersionLastCheck = Date.now()
      this.isCheckingForUpdate = false
    })
      .then(this.saveRemoteVersionToStorage)
      .catch((err: Error) => {
        console.error('Failed to get app version from app store:')
        console.error(err)
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
    ).catch((err: Error) => {
      console.error('Failed to save app version to storage:')
      console.error(err)
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
    // Check for update in every day
    if (Date.now() - this.remoteVersionLastCheck > 24 * 60 * 60 * 1000) {
      this.checkForUpdate()
    }
  }

  init = async () => {
    this.loading = true
    // Read size of log files using stat for the initial state
    const promises = [log1, log2].map((l, i) =>
      RNFS.exists(l)
        .then(e => (e ? RNFS.stat(l) : undefined))
        .then(e => (e ? (this.logSizes[i] = Number(e.size) || 0) : 0))
        .catch((err: Error) => {
          RnAlert.error({
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
        .catch((err: Error) => {
          RnAlert.error({
            message: intlDebug`Failed to delete unused debug log file`,
            err,
          })
        }),
    )
    // Read debug log settings from storage
    promises.push(
      RnAsyncStorage.getItem('captureDebugLog')
        .then(v => v && (this.captureDebugLog = JSON.parse(v)))
        .catch((err: Error) => {
          RnAlert.error({
            message: intlDebug`Failed to read debug log settings from storage`,
            err,
          })
        }),
    )
    // Read remote app version from storage
    promises.push(
      RnAsyncStorage.getItem('remoteVersion')
        .then(v => v && JSON.parse(v))
        .then((v: { version: string; lastCheck: number }) => {
          if (v) {
            this.remoteVersion = v.version
            this.remoteVersionLastCheck = v.lastCheck
          }
          this.autoCheckForUpdate()
        })
        .catch((err: Error) => {
          console.error('Failed to read app version from storage:')
          console.error(err)
        }),
    )
    //
    await Promise.all(promises)
    this.loading = false
  }
}

if (Platform.OS !== 'web') {
  // Assign to window to use in src/utils/captureConsoleOutput.ts
  store = window.debugStore = new DebugStore()

  // TODO call init together with other store
  // Need to determine the order of init functions and call them using await
  store.init()
}
export const debugStore = store
