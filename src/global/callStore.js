import debounce from 'lodash/debounce';
import { action, computed, observable } from 'mobx';
import { Platform } from 'react-native';

import sip from '../api/sip';
import g from '../global';
import IncallManager from '../native/IncallManager';
import { arrToMap } from '../utils/toMap';
import Call from './Call';

export class CallStore {
  constructor() {
    this._initDurationInterval();
  }

  @observable _calls = [];
  @observable _currentCallId = undefined;
  @computed get incomingCall() {
    return this._calls.find(c => c.incoming && !c.answered);
  }
  @computed get currentCall() {
    this._updateCurrentCallDebounce();
    return this._calls.find(c => c.id === this._currentCallId);
  }
  @computed get backgroundCalls() {
    return this._calls.filter(
      c => c.id !== this._currentCallId && !(c.incoming && !c.answered),
    );
  }

  @action _updateCurrentCall = () => {
    let currentCall;
    if (this._calls.length) {
      currentCall =
        this._calls.find(c => c.id === this._currentCallId) ||
        this._calls.find(c => c.answered && !c.holding) ||
        this._calls[0];
    }
    const currentCallId = currentCall?.id || undefined;
    if (currentCallId !== this._currentCallId) {
      this._currentCallId = currentCallId;
    }
    this._updateBackgroundCallsDebounce();
  };
  _updateCurrentCallDebounce = debounce(this._updateCurrentCall, 500, {
    maxWait: 1000,
  });
  @action _updateBackgroundCalls = () => {
    // Auto hold background calls
    this._calls
      .filter(
        c =>
          c.id !== this._currentCallId &&
          c.answered &&
          !c.parking &&
          !c.transferring &&
          !c.holding,
      )
      .forEach(c => c.toggleHold());
  };
  _updateBackgroundCallsDebounce = debounce(this._updateBackgroundCalls, 500, {
    maxWait: 1000,
  });

  upsertCall = _c => {
    let c = this._calls.find(c => c.id === _c.id);
    if (!c) {
      c = new Call();
      this._calls = [c, ...this._calls];
    }
    Object.assign(c, _c);
  };
  removeCall = id => {
    this._calls = this._calls.filter(c => c.id !== id);
  };

  @action selectBackgroundCall = c => {
    if (c.holding) {
      c.toggleHold();
    }
    this._currentCallId = c.id;
    g.backToPageBackgroundCalls();
  };

  @action answerCall = c => {
    this._currentCallId = c.id;
    sip.answerSession(c.id, {
      videoEnabled: c.remoteVideoEnabled,
    });
  };

  _startCallIntervalAt = 0;
  _startCallIntervalId = 0;
  startCall = (number, options) => {
    sip.createSession(number, options);
    g.goToPageCallManage();
    // Auto update _currentCallId
    this._currentCallId = undefined;
    const prevIds = arrToMap(this._calls, `id`);
    if (this._startCallIntervalId) {
      clearInterval(this._startCallIntervalId);
    }
    this._startCallIntervalAt = Date.now();
    this._startCallIntervalId = setInterval(() => {
      const currentCallId = this._calls.map(c => c.id).find(id => !prevIds[id]);
      if (currentCallId) {
        this._currentCallId = currentCallId;
      }
      if (currentCallId || Date.now() > this._startCallIntervalAt + 10000) {
        clearInterval(this._startCallIntervalId);
        this._startCallIntervalId = 0;
      }
    }, 100);
  };

  startVideoCall = number => {
    this.startCall(number, {
      videoEnabled: true,
    });
  };

  @observable isLoudSpeakerEnabled = false;
  @action toggleLoudSpeaker = () => {
    if (Platform.OS !== `web`) {
      this.isLoudSpeakerEnabled = !this.isLoudSpeakerEnabled;
      IncallManager.setForceSpeakerphoneOn(this.isLoudSpeakerEnabled);
    }
  };

  @observable newVoicemailCount = 0;

  // Style in CallVideosUI to save the previous video position
  @observable videoPositionT = 25;
  @observable videoPositionL = 5;

  _durationIntervalId = 0;
  _initDurationInterval = () => {
    this._durationIntervalId = setInterval(this._updateDuration, 100);
  };
  @action _updateDuration = () => {
    this._calls
      .filter(c => c.answered && !c.transferring && !c.parking)
      .forEach(c => {
        c.duration += 100;
      });
  };

  dispose = () => {
    if (this._startCallIntervalId) {
      clearInterval(this._startCallIntervalId);
      this._startCallIntervalId = 0;
    }
    // Dont need to dispose duration interval id
    // Because the store is currently global static
  };
}

const callStore = new CallStore();

export default callStore;
