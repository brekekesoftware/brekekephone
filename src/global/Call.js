import { action, computed, observable } from 'mobx';

import pbx from '../api/pbx';
import sip from '../api/sip';
import g from '../global';
import intl from '../intl/intl';

export default class Call {
  @observable id = ``;
  @observable partyNumber = ``;
  @observable partyName = ``;
  @observable pbxTalkerId = ``;
  @observable pbxTenant = ``;
  @computed get title() {
    return this.partyName || this.partyNumber || this.pbxTalkerId || this.id;
  }

  @observable incoming = false;
  @observable answered = false;

  @observable createdAt = Date.now();
  @observable duration = 0;

  hangup = () => sip.hangupSession(this.id);
  hangupWithUnhold = () =>
    this.holding ? this.toggleHold().then(this.hangup) : this.hangup();

  @observable videoSessionId = ``;
  @observable localVideoEnabled = false;
  @observable remoteVideoEnabled = false;
  enableVideo = () => sip.enableVideo(this.id);
  disableVideo = () => sip.disableVideo(this.id);

  @observable remoteVideoStreamObject = null;
  voiceStreamObject = null;

  @observable muted = false;
  @action toggleMuted = () => {
    this.muted = !this.muted;
    return sip.setMuted(this.muted, this.id);
  };

  @observable recording = false;
  @action toggleRecording = () => {
    this.recording = !this.recording;
    return pbx
      .startRecordingTalker(this.pbxTenant, this.pbxTalkerId)
      .catch(this._onToggleRecordingFailure);
  };
  @action _onToggleRecordingFailure = err => {
    this.recording = !this.recording;
    const message = this.recording
      ? intl.debug`Failed to stop recording the call`
      : intl.debug`Failed to start recording the call`;
    g.showError({ message, err });
  };

  @observable holding = false;
  @action toggleHold = () => {
    this.holding = !this.holding;
    return pbx[this.holding ? `holdTalker` : `unholdTalker`](
      this.pbxTenant,
      this.pbxTalkerId,
    ).catch(this._onToggleHoldFailure);
  };
  @action _onToggleHoldFailure = err => {
    this.holding = !this.holding;
    const message = this.holding
      ? intl.debug`Failed to unhold the call`
      : intl.debug`Failed to hold the call`;
    g.showError({ message, err });
  };

  @observable transferring = false;
  @observable transferringNumber = ``;
  @action initTransferring = () => {
    this.transferring = true;
    this.transferringNumber = ``;
  };
  @action closeTransferring = () => {
    this.transferring = false;
    this.transferringNumber = ``;
  };
  @action transferBlind = number => {
    this.transferring = false;
    this.transferringNumber = ``;
    return pbx
      .transferTalkerBlind(this.pbxTenant, this.pbxTalkerId, number)
      .catch(this._onTransferFailure);
  };
  @action transferAttended = number => {
    this.transfering = true;
    this.transferringNumber = number;
    return pbx
      .transferTalkerAttended(this.pbxTenant, this.pbxTalkerId, number)
      .catch(this._onTransferFailure);
  };
  _onTransferFailure = err => {
    this.initTransferring();
    g.showError({
      message: intl.debug`Failed to transfer the call`,
      err,
    });
  };

  @observable parking = false;
  @observable parkingNumber = ``; // TODO

  @observable isDTMF = false;
  @action toggleDTMF = () => {
    this.isDTMF = !this.isDTMF;
  };
}
