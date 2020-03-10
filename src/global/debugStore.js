import { Buffer } from 'buffer';
import CircularJson from 'circular-json';
import debounce from 'lodash/debounce';
import { computed, observable } from 'mobx';
import moment from 'moment';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

import { AsyncStorage, Platform } from '../-/Rn';
import g from '../global';
import intl from '../intl/intl';

// The location of 2 log file, log2 will be deleted and replaced by log1
//    when log1 reach the limit, then log1 will be reset
// The `log` will be used for combining the two above files in ios
//    because in ios Share only works with `file://...` url
const [log, log1, log2] = [`log`, `log1`, `log2`].map(
  n => `${RNFS.DocumentDirectoryPath}/brekeke-phone-${n}.txt`,
);
const limitedBytes = 4000000; // 4MB

class DebugStore {
  // By default only error logs will be captured
  // If this flag is turned on, all logs will be captured
  // This flag will be saved to storage and we will read it again
  //    as soon as possible when app starts up
  @observable captureDebugLog = false;
  toggleCaptureDebugLog = () => {
    this.captureDebugLog = !this.captureDebugLog;
    AsyncStorage.setItem(
      `captureDebugLog`,
      JSON.stringify(this.captureDebugLog),
    );
  };

  // Cache the size of log files
  @observable logSizes = [0, 0];
  @computed get logSize() {
    return this.logSizes.reduce((sum, s) => sum + s, 0);
  }

  // Use a queue to write logs to file in batch
  logQueue = [];

  // The function to be called in src/-/captureConsoleOutput.js
  captureConsoleOutput = (lv, ...args) => {
    if (lv !== `error` && !this.captureDebugLog) {
      return;
    }
    const msg =
      moment().format(`YYYY/MM/DD HH:mm:ss`) +
      ` ${lv.toUpperCase()} ` +
      args
        .map(a =>
          !a
            ? `${a}`
            : a.message && a.stack
            ? a.message + ` ` + a.stack
            : typeof a === `object`
            ? CircularJson.stringify(a)
            : `${a}`,
        )
        .join(` `)
        .replace(/\s+/g, ` `);
    this.logQueue.push(msg);
    this.writeFileBatch();
  };
  writeFile = () =>
    this.writeFileWithoutCatch().catch(err => {
      g.showError({
        message: intl`Failed to write debug log to file`,
        err,
      });
    });
  writeFileWithoutCatch = async () => {
    if (!this.logQueue.length) {
      return;
    }
    const msg = this.logQueue.join(`\n`);
    this.logQueue = [];
    // Append to log1
    await RNFS.appendFile(log1, msg + `\n`, `utf8`);
    const { size } = await RNFS.stat(log1);
    this.logSizes[0] = Number(size);
    // If the size of log1 passes the limit
    //    we will copy it to log2 and clear the log1
    if (this.logSizes[0] > limitedBytes) {
      if (await RNFS.exists(log2)) {
        await RNFS.unlink(log2);
      }
      await RNFS.moveFile(log1, log2);
      this.logSizes[1] = this.logSizes[0];
    }
  };
  writeFileBatch = debounce(this.writeFile, 300, { maxWait: 1000 });

  openLogFile = () =>
    this.openLogFileWithoutCatch().catch(err => {
      g.showError({
        message: intl`Failed to build and open log file`,
        err,
      });
    });
  openLogFileWithoutCatch = async () => {
    const promises = [log1, log2].map(l =>
      RNFS.exists(l)
        .then(e => e && RNFS.readFile(l, `utf8`))
        .then(f => f || ``),
    );
    const [f0, f1] = await Promise.all(promises);
    const title = `brekeke_phone_log_${moment().format(`YYMMDDHHmmss`)}.txt`;
    let url = null;
    // Share works inconsistency between android and ios
    if (Platform.OS === `ios`) {
      await RNFS.writeFile(log, f1 + f0, `utf8`);
      url = log; // only works with `file://...`
    } else {
      const b64 = Buffer.from(f1 + f0).toString(`base64`);
      url = `data:text/plain;base64,${b64}`; // only works with base64
    }
    Share.open({ title, url, subject: title });
  };

  clearLogFiles = () => {
    g.showPrompt({
      title: intl`Clear Logs`,
      message: intl`Do you want to clear all the log files?`,
      onConfirm: this.clearLogFilesWithoutPrompt,
      confirmText: intl`CLEAR`,
    });
  };
  clearLogFilesWithoutPrompt = () =>
    this.clearLogFilesWithoutCatch().catch(err => {
      g.showError({
        message: intl`Failed to clear the log files`,
        err,
      });
    });
  clearLogFilesWithoutCatch = () =>
    Promise.all(
      [log1, log2].map((l, i) =>
        RNFS.exists(l)
          .then(e => e && RNFS.unlink(l))
          .then(() => (this.logSizes[i] = 0)),
      ),
    );

  init = () => {
    // Read size of log files using stat for the initial state
    const promises = [log1, log2].map((l, i) =>
      RNFS.exists(l)
        .then(e => e && RNFS.stat(l))
        .then(e => (this.logSizes[i] = Number(e.size) || 0))
        .catch(err => {
          g.showError({
            message: intl`Failed to get debug log file size`,
            err,
          });
        }),
    );
    // Delete the combined unused log file
    // This file will be created every time user request opening the log file
    //    (ios only because in ios Share only works with `file://...` url)
    promises.push(
      RNFS.exists(log)
        .then(e => e && RNFS.unlink(log))
        .catch(err => {
          g.showError({
            message: intl`Failed to delete unused log file`,
            err,
          });
        }),
    );
    // Read debug log settings from storage
    promises.push(
      AsyncStorage.getItem(`captureDebugLog`)
        .then(v => v && (this.captureDebugLog = JSON.parse(v)))
        .catch(err => {
          g.showError({
            message: intl`Failed to get debug log settings from storage`,
            err,
          });
        }),
    );
    return Promise.all(promises);
  };
}

// Assign to window to use in src/-/captureConsoleOutput.js
const debugStore = (window.debugStore = new DebugStore());

// TODO call init together with other store
// Need to determine the order of init functions and call them using await
debugStore.init();

export default debugStore;
