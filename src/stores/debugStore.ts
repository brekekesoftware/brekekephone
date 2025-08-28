import type { ReadDirResItemT } from '@dr.pogodin/react-native-fs'
import {
  appendFile,
  DocumentDirectoryPath,
  exists,
  mkdir,
  readDir,
  readFile,
  stat,
  unlink,
  writeFile,
} from '@dr.pogodin/react-native-fs'
import { Buffer } from 'buffer'
import { filesize } from 'filesize'
import { debounce, orderBy } from 'lodash'
import { observable } from 'mobx'
import moment from 'moment'
import { Linking } from 'react-native'
import Share from 'react-native-share'

import { RnAsyncStorage } from '#/components/Rn'
import { isAndroid, isIos, isWeb } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { BackgroundTimer } from '#/utils/BackgroundTimer'
import { jsonSafe } from '#/utils/jsonSafe'

declare global {
  interface Window {
    debugStore: DebugStore
  }
}

type ReadDirItem = ReadDirResItemT

let store = null as any as DebugStore
const LOG_DIR = !isWeb ? `${DocumentDirectoryPath}` : ''
const LOG_PREFIX = 'brekeke_phone_log_'

const maximumBytes = 300000 // 300KB
const maxFiles = 20
export const getFilePath = (rootPath: string, file: string) =>
  `${rootPath}/${file}`

export const getTotalFilesSize = (files: ReadDirItem[]) => {
  if (!files.length) {
    return 0
  }
  let totalSize = 0
  for (const file of files) {
    totalSize += file.size
  }
  return totalSize
}
export class DebugStore {
  loading = true
  private timer = 0
  @observable logFiles: ReadDirItem[] = []
  @observable totalLogFiles = 0
  @observable currentFile: ReadDirItem | undefined

  checkAndCreateFile = async (rootPath: string, fileName: string) => {
    if (!fileName) {
      return
    }
    const path = getFilePath(rootPath, fileName)
    const fileExists = await exists(path)
    if (!fileExists) {
      // create the file with initial content
      await writeFile(path, '', 'utf8')
      if (this.logFiles.length === maxFiles) {
        const f = this.logFiles.pop()
        if (f) {
          await unlink(f.path)
        }
      }
    }
    const file = (await stat(path)) as unknown as ReadDirItem
    // update the file info
    Object.assign(file, { path, name: fileName })

    this.logFiles = [file, ...this.logFiles]
    this.currentFile = file
    return file
  }
  createLogFileName = () =>
    // use moment to get the current date and time in the desired format
    LOG_PREFIX + moment().format('YYYYMMDD_HHmmss') + '.txt'

  getLogFiles = async () => {
    try {
      // check if the directory exists
      const dirExists = await exists(LOG_DIR)
      if (!dirExists) {
        await mkdir(LOG_DIR)
        await this.checkAndCreateFile(LOG_DIR, this.createLogFileName())
        return
      }
      // get the list of files in the directory
      const files = await readDir(LOG_DIR)
      const sortedFiles = files.filter(
        file => file.isFile() && file.name.startsWith(LOG_PREFIX),
      )
      if (sortedFiles.length === 0) {
        await this.checkAndCreateFile(LOG_DIR, this.createLogFileName())
        return
      }
      // sort by datetime
      this.logFiles = orderBy(
        sortedFiles,
        [
          file => {
            const str = file.name.split('_')
            const date = str[3] + str[4].replace('.txt', '')
            return moment(date, 'YYYYMMDDHHmmss').unix()
          },
        ],
        ['desc'],
      )

      this.totalLogFiles = getTotalFilesSize(this.logFiles)
      this.currentFile = this.logFiles[0]
      if (
        !this.logFiles[0].name.startsWith(
          LOG_PREFIX + moment().format('YYYYMMDD'),
        )
      ) {
        await this.checkAndCreateFile(LOG_DIR, this.createLogFileName())
        return
      }
      return
    } catch (error) {
      return error
    }
  }
  // by default only error logs will be captured
  // if this flag is turned on, all logs will be captured
  // this flag will be saved to storage and we will read it again
  //    as soon as possible when app starts up
  @observable captureDebugLog = false
  toggleCaptureDebugLog = () => {
    this.captureDebugLog = !this.captureDebugLog
    RnAsyncStorage.setItem('captureDebugLog', jsonSafe(this.captureDebugLog))
  }

  getLogSizeStr = () => `${filesize(this.totalLogFiles)}`

  // use a queue to write logs to file in batch
  logQueue: string[] = []

  // the function to be called in src/utils/captureConsoleOutput.ts
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
    if (!this.currentFile) {
      await this.checkAndCreateFile(LOG_DIR, this.createLogFileName())
    }
    if (!this.currentFile) {
      return
    }
    const msg = this.logQueue.join('\n')
    this.logQueue = []
    await appendFile(this.currentFile.path, msg + '\n', 'utf8')
    const { size } = (await stat(
      this.currentFile.path,
    )) as unknown as ReadDirItem
    this.totalLogFiles = this.totalLogFiles + (size - this.currentFile.size)
    // update logFiles
    Object.assign(this.currentFile, { size })
    this.logFiles[0] = this.currentFile
    if (this.currentFile.size > maximumBytes) {
      await this.checkAndCreateFile(LOG_DIR, this.createLogFileName())
    }
  }
  writeFileBatch = debounce(this.writeFile, 300, { maxWait: 1000 })

  openLogFile = (file: ReadDirItem) =>
    this.openLogFileWithoutCatch(file).catch((err: Error) => {
      RnAlert.error({
        message: intlDebug`Failed to build and open log file`,
        err,
      })
    })
  openLogFileWithoutCatch = async (file: ReadDirItem) => {
    const isFileExists = await exists(file.path)
    if (!isFileExists) {
      return
    }
    const title = file.name
    let url: string | null = null
    // share works inconsistency between android and ios
    if (isIos) {
      url = file.path // only works with `file://...`
    } else {
      const content = await readFile(file.path, 'utf8')
      const b64 = Buffer.from(content).toString('base64')
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
      this.logFiles.map((l, i) =>
        exists(l.path).then(e => (e ? unlink(l.path) : undefined)),
      ),
    ).then(() => {
      this.logFiles = []
      this.totalLogFiles = 0
      this.currentFile = undefined
    })

  @observable isCheckingForUpdate = false
  @observable remoteVersion = ''
  @observable remoteVersionLastCheck = 0

  checkForUpdate = () => {
    if (this.isCheckingForUpdate) {
      return
    }
    this.isCheckingForUpdate = true
    const p = isAndroid
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
        console.error('Failed to get app version from app store:', err)
        this.isCheckingForUpdate = false
      })
  }
  saveRemoteVersionToStorage = () => {
    RnAsyncStorage.setItem(
      'remoteVersion',
      jsonSafe({
        version: this.remoteVersion,
        lastCheck: this.remoteVersionLastCheck,
      }),
    ).catch((err: Error) => {
      console.error('Failed to save app version to storage:', err)
    })
  }

  openInStore = () => {
    Linking.openURL(
      isAndroid
        ? 'https://play.google.com/store/apps/details?id=com.brekeke.phone'
        : 'itms-apps://apps.apple.com/app/id1233825750',
    )
  }
  autoCheckForUpdate = () => {
    // check for update in every day
    if (Date.now() - this.remoteVersionLastCheck > 24 * 60 * 60 * 1000) {
      this.checkForUpdate()
    }
  }

  init = async () => {
    this.loading = true
    const promises: Promise<any>[] = []
    // get latest log file
    promises.push(
      this.getLogFiles()
        .then(async file => {})
        .catch(err => {
          RnAlert.error({
            message: intlDebug`Failed to get log files from storage`,
            err,
          })
        }),
    )

    // read debug log settings from storage
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
    // read remote app version from storage
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
          console.error('Failed to read app version from storage:', err)
        }),
    )
    //
    await Promise.all(promises)
    this.loading = false
  }
}

if (!isWeb) {
  // assign to window to use in src/utils/captureConsoleOutput.ts
  store = window.debugStore = new DebugStore()

  // TODO: call init together with other store
  // need to determine the order of init functions and call them using await
  store.init()
}
ctx.debug = store

const getSemVer = (v?: string) => {
  const a =
    v
      ?.split(/\./g)
      .map(s => s.match(/^\d+/)?.[0])
      .map(Number) || []
  return [a[0] || 0, a[1] || 0, a[2] || 0, a[3] || 0]
}

/**
 * Compare 2 semantic versions
 * @param a new version
 * @param b current version
 * @returns a > b ? 1 : a < b ? -1 : 0
 */
export const compareSemVer = (a?: string, b?: string) => {
  const [aMajor, aMinor, aPatch, aFourth] = getSemVer(a)
  const [bMajor, bMinor, bPatch, bFourth] = getSemVer(b)
  if (bMajor !== aMajor) {
    return aMajor > bMajor ? 1 : -1
  }
  if (bMinor !== aMinor) {
    return aMinor > bMinor ? 1 : -1
  }
  if (bPatch !== aPatch) {
    return aPatch > bPatch ? 1 : -1
  }
  if (bFourth !== aFourth) {
    return aFourth > bFourth ? 1 : -1
  }
  return 0
}
