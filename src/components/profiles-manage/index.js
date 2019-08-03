import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';
import createId from 'shortid';

import authStore from '../../mobx/authStore';
import * as routerUtils from '../../mobx/routerStore';
import { getUrlParams, setUrlParams } from '../../nativeModules/deeplink';
import { resetBadgeNumber } from '../../nativeModules/pushNotification';
import { setProfilesManager } from './getset';
import UI from './ui';
import toast from '../../nativeModules/toast';

@observer
@createModelView(
  getter => (state, props) => ({
    profileIds: getter.profiles.idsByOrder(state),
    profileById: getter.profiles.detailMapById(state),
    callIds: getter.runningCalls.idsByOrder(state).filter(id => {
      const call = getter.runningCalls.detailMapById(state)[id];
      return call && call.incoming && !call.answered;
    }),
    callById: getter.runningCalls.detailMapById(state),
  }),
  action => emit => ({
    createProfile(profile) {
      emit(action.profiles.create(profile));
    },
    updateProfile(profile) {
      emit(action.profiles.update(profile));
    },
    removeProfile(id) {
      emit(action.profiles.remove(id));
    },
    updateCall(call) {
      emit(action.runningCalls.update(call));
    },
  }),
)
class View extends Component {
  async componentDidMount() {
    setProfilesManager(this);
    this.handleUrlParams();
  }

  componentWillUnmount() {
    setProfilesManager(null);
    setUrlParams(null);
  }

  handleUrlParams = async () => {
    const urlParams = await getUrlParams();

    if (!urlParams) {
      return;
    }

    const { tenant, user, _wn, host, port } = urlParams;

    if (!user || !tenant) {
      return;
    }

    const u = this.getProfileByCustomNoti({
      tenant,
      to: user,
      pbxHostname: host,
      pbxPort: port,
    });

    if (u) {
      if (_wn) {
        u.accessToken = _wn;
      }

      if (!u.pbxHostname) {
        u.pbxHostname = host;
      }

      if (!u.pbxPort) {
        u.pbxPort = port;
      }

      this.props.updateProfile(u);

      if (u.pbxPassword || u.accessToken) {
        this.signin(u.id);
      } else {
        routerUtils.goToProfileUpdate(u.id);
      }

      return;
    }

    const newU = {
      id: createId(),
      pbxTenant: tenant,
      pbxUsername: user,
      pbxHostname: host,
      pbxPort: port,
      pbxPassword: '',
      pbxPhoneIndex: '4',
      pbxTurnEnabled: false,
      parks: [],
      ucEnabled: false,
      ucHostname: '',
      ucPort: '',
      accessToken: _wn,
    };

    this.props.createProfile(newU);

    if (newU.accessToken) {
      this.signin(newU.id);
    } else {
      routerUtils.goToProfileUpdate(newU.id);
    }
  };

  getProfileByCustomNoti = n => {
    const c = (v1, v2) => !v1 || !v2 || v1 === v2;
    const cp = p =>
      c(n.tenant, p.pbxTenant) &&
      c(n.to, p.pbxUsername) &&
      c(n.pbxHostname, p.pbxHostname) &&
      c(n.pbxPort, p.pbxPort);
    const ids = Object.keys(this.props.profileById);

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const profile = this.props.profileById[id];

      if (cp(profile)) {
        return profile;
      }
    }

    return null;
  };

  signinByCustomNoti = n => {
    if (!n || !n.tenant || !n.to) {
      return false;
    }

    const u = this.getProfileByCustomNoti(n);

    if (!u) {
      return false;
    }

    return this.signin(u.id);
  };

  resolveProfile = id => {
    return this.props.profileById[id];
  };

  signin = id => {
    const u = this.props.profileById[id];

    if (!u) {
      return false;
    }

    if (!u.pbxPassword && !u.accessToken) {
      routerUtils.goToProfileUpdate(u.id);
      toast.error('The profile password is empty');
      return true;
    }

    authStore.set('profile', u);
    routerUtils.goToAuth();
    resetBadgeNumber();
    return true;
  };

  render() {
    return (
      <UI
        profileIds={this.props.profileIds}
        resolveProfile={this.resolveProfile}
        create={routerUtils.goToProfilesCreate}
        update={routerUtils.goToProfileUpdate}
        signin={this.signin}
        remove={this.props.removeProfile}
      />
    );
  }
}

export default View;
