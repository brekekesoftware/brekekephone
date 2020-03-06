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
const [log, log1, log2] = [`log`, `log1`, `log2`].map(
  n => `${RNFS.DocumentDirectoryPath}/brekeke-phone-${n}.txt`,
);
const limitedBytes = 4000000; // 4MB

class DebugStore {
  // Flag to indicate that we should capture all the debug logs or not
  // By default only error log will be captured, if this flag turn on
  //    all logs will be captured
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

  // Cache of the size of log files
  @observable logSizes = [0, 0];
  @computed get logSize() {
    return this.logSizes.reduce((sum, s) => sum + s, 0);
  }

  // Use a queue to write logs to file in batch
  msgQueue = [];
  writeLog = (lv, ...args) => {
    if (lv !== `error` && !this.captureDebugLog) {
      return;
    }
    const msg =
      moment().format(`YYYY/MM/DD HH:mm:ss`) +
      ` ${lv.toUpperCase()} ` +
      args
        .map(a =>
          !a
            ? `` + a
            : a.message && a.stacks
            ? a.message + ` ` + a.stacks
            : typeof a === `object`
            ? CircularJson.stringify(a)
            : `` + a,
        )
        .join(` `)
        .replace(/\s+/g, ` `);
    this.msgQueue.push(msg);
    this.batchWriteFile();
  };
  writeFile = async () => {
    if (!this.msgQueue.length) {
      return;
    }
    //
    const msg = this.msgQueue.join(`\n`);
    this.msgQueue = [];
    //
    try {
      await RNFS.appendFile(log1, msg + `\n`, `utf8`);
      const { size } = await RNFS.stat(log1);
      this.logSizes[0] = Number(size);
      //
      if (this.logSizes[0] > limitedBytes) {
        if (await RNFS.exists(log2)) {
          await RNFS.unlink(log2);
        }
        await RNFS.moveFile(log1, log2);
        this.logSizes[1] = this.logSizes[0];
      }
    } catch (err) {
      g.showError({
        message: intl`Failed to write debug log to file`,
        err,
      });
    }
  };
  batchWriteFile = debounce(this.writeFile, 300, { maxWait: 1000 });

  buildLogFile = async () => {
    try {
      const title = `brekeke_phone_log_${moment().format(`YYMMDDHHmmss`)}.txt`;
      const f = await Promise.all(
        [log1, log2].map((l, i) =>
          RNFS.exists(l)
            .then(e => e && RNFS.readFile(l, `utf8`))
            .then(f => f || ``),
        ),
      );
      if (Platform.OS === `ios`) {
        await RNFS.writeFile(log, f[1] + f[0], `utf8`);
        Share.open({
          title,
          url: log,
          subject: title,
        });
      } else {
        const b64 = Buffer.from(f[1] + f[0]).toString(`base64`);
        const url = `data:text/plain;base64,${b64}`;
        Share.open({
          title,
          url,
          subject: title,
        });
      }
    } catch (err) {
      g.showError({
        message: intl`Failed to open log file`,
        err,
      });
    }
  };

  clearLogFiles = () => {
    g.showPrompt({
      title: intl`Clear Logs`,
      message: intl`Do you want to clear all log files?`,
      onConfirm: this._clearLogFiles,
      confirmText: intl`CLEAR`,
    });
  };
  _clearLogFiles = () => {
    [log1, log2].forEach((l, i) => {
      RNFS.exists(l)
        .then(e => e && RNFS.unlink(l))
        .then(() => (this.logSizes[i] = 0))
        .catch(err => {
          g.showError({
            message: intl`Failed to clear the log file`,
            err,
          });
        });
    });
  };

  init = () => {
    // Read size of log files using stat
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
    // Delete the combined log file
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
    //
    return Promise.all(promises);
  };
}

// Assign to window to use in src/-/captureConsoleOutput.js
const debugStore = (window.debugStore = new DebugStore());

// TODO call init together with other store
// Need to determine the order of init functions and call them using await
debugStore.init();

export default debugStore;
