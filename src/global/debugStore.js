import CircularJson from 'circular-json';
import debounce from 'lodash/debounce';
import { computed, observable } from 'mobx';
import moment from 'moment';
import RNFS from 'react-native-fs';

import { AsyncStorage } from '../-/Rn';
import g from '../global';
import intl from '../intl/intl';
import BaseStore from './BaseStore';

const limitedBytes = 4000000; // 4MB
const [log1, log2] = [`log1`, `log2`].map(
  n => `${RNFS.DocumentDirectoryPath}/brekeke-phone-${n}.txt`,
);

class DebugStore extends BaseStore {
  @observable _captureDebugLog = false;
  @computed get captureDebugLog() {
    return this._captureDebugLog;
  }
  set captureDebugLog(v) {
    this._captureDebugLog = v;
    AsyncStorage.setItem(`captureDebugLog`, JSON.stringify(v));
  }

  @observable logSizes = [0, 0];
  @computed get logSize() {
    return this.logSizes.reduce((sum, s) => sum + s, 0);
  }

  msgQueue = [];
  writeLog = (lv, ...args) => {
    if (lv !== `error` && !this._captureDebugLog) {
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
    //
    this.msgQueue.push(msg);
    this.batchWriteFile();
  };

  writeFile = () =>
    this._writeFile().catch(err => {
      g.showError({ message: intl`Failed to write debug log to file`, err });
    });
  _writeFile = async () => {
    if (!this.msgQueue.length) {
      return;
    }
    //
    const msg = this.msgQueue.join(`\n`);
    this.msgQueue = [];
    //
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
  };

  batchWriteFile = debounce(this.writeFile, 300, { maxWait: 1000 });

  init = () => {
    [log1, log2].forEach((p, i) => {
      RNFS.exists(p)
        .then(e => e && RNFS.stat(p))
        .then(e => {
          this.logSizes[i] = Number(e.size) || 0;
        })
        .catch(err => {
          g.showError({
            message: intl`Failed to get debug log file size`,
            err,
          });
        });
    });
    AsyncStorage.getItem(`captureDebugLog`)
      .then(v => {
        if (v) {
          this._captureDebugLog = JSON.parse(v);
        }
      })
      .catch(err => {
        g.showError({
          message: intl`Failed to get debug log settings from storage`,
          err,
        });
      });
  };
}

// Assign to window to use in src/-/captureConsoleOutput.js
const debugStore = (window.debugStore = new DebugStore());
debugStore.init();

export default debugStore;
