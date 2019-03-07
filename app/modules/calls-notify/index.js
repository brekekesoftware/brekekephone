import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createModelView } from 'redux-model';
import UI from './ui';
import createID from 'shortid';

const isIncoming = call => call.incoming && !call.answered;

const mapGetter = getter => state => ({
  callIds: getter.runningCalls
    .idsByOrder(state)
    .filter(id => isIncoming(getter.runningCalls.detailMapById(state)[id])),
  callById: getter.runningCalls.detailMapById(state),
  pushNotifies: getter.pushNotifies.notifDatas(state),
});

const mapAction = action => emit => ({
  clearNotif() {
    emit(action.pushNotifies.clear());
  },
  removeNotifAt(index) {
    emit(action.pushNotifies.removeAt(index));
  },
  routeToProfilesManage() {
    emit(action.router.goToProfilesManage());
  },
  showToast(message) {
    emit(action.toasts.create({ id: createID(), message }));
  },
});

class View extends Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  _findCallByCustomNotifData(data) {
    const nPartyNumber = data.from;
    const nPbxUsername = data.to;
    const nIsPbxUsernameEmpty = !nPbxUsername || nPbxUsername.length === 0;
    const nPbxTenant = data.tenant;
    const nIsPbxTenantEmpty = !nPbxTenant || nPbxTenant.length === 0;

    for (let k = 0; k < this.props.callIds.length; k++) {
      const callid = this.props.callIds[k];
      const call = this.resolveCall(callid);

      if (call.incoming !== true || call.answered !== false) {
        continue;
      }

      const cPbxUsername = call.pbxUsername;
      if (!nIsPbxUsernameEmpty) {
        if (cPbxUsername) {
          if (nPbxUsername !== cPbxUsername) {
            continue;
          }
        } else {
          if (nPartyNumber !== call.partyNumber) {
            continue;
          }
        }
      }

      const cPbxTenant = call.pbxTenant;
      if (!nIsPbxTenantEmpty) {
        if (nPbxTenant !== cPbxTenant) {
          continue;
        }
      }

      return call;
    }

    return null;
  }

  componentDidUpdate() {
    const callidslength = this.props.callIds.length;
    const pushNotifies = this.props.pushNotifies;
    const notifCount = pushNotifies.length;
    const currentTime = new Date().getTime();

    for (let i = notifCount - 1; i >= 0; i--) {
      const data = pushNotifies[i];
      const expire = data['brekekephone.notif.expire'];
      const bTimeout = expire && currentTime > expire;
      if (bTimeout) {
        this.props.removeNotifAt(i);
      } else {
        const call = this._findCallByCustomNotifData(data);
        if (call) {
          this.accept(call.id);
          this.props.removeNotifAt(i);
        }
      }
    }
  }

  render = () => (
    <UI
      callIds={this.props.callIds}
      resolveCall={this.resolveCall}
      accept={this.accept}
      reject={this.reject}
    />
  );

  resolveCall = id => {
    const call = this.props.callById[id];
    return call;
  };

  reject = id => {
    const { sip } = this.context;
    sip.hangupSession(id);
  };

  accept = id => {
    const { sip } = this.context;
    const call = this.props.callById[id];
    const videoEnabled = call.remoteVideoEnabled;
    sip.answerSession(id, { videoEnabled });
  };
}

export default createModelView(mapGetter, mapAction)(View);
