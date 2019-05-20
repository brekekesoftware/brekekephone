import React, { Component } from 'react';
import { createModelView } from 'redux-model';
import createId from 'shortid';

import UserLanguage from '../../language/UserLanguage';
import * as routerUtils from '../../mobx/routerStore';
import { getUrlParams, setUrlParams } from '../../rn/deeplink';
import { setProfileManager } from './getset';
import UI from './ui';

const mapGetter = getter => (state, props) => ({
  profileIds: getter.profiles.idsByOrder(state),
  profileById: getter.profiles.detailMapById(state),
  callIds: getter.runningCalls.idsByOrder(state).filter(id => {
    const call = getter.runningCalls.detailMapById(state)[id];
    return call && call.incoming && !call.answered;
  }),
  callById: getter.runningCalls.detailMapById(state),
});

const mapAction = action => emit => ({
  createProfile(profile) {
    emit(action.profiles.create(profile));
  },
  updateProfile(profile) {
    emit(action.profiles.update(profile));
  },
  removeProfile(id) {
    emit(action.profiles.remove(id));
  },
  setAuthProfile(profile) {
    emit(action.auth.setProfile(profile));
  },
  updateCall(call) {
    emit(action.runningCalls.update(call));
  },
});

class View extends Component {
  componentDidMount() {
    setProfileManager(this);
    this.handleUrlParams();
    UserLanguage.init_s();
  }
  componentWillUnmount() {
    setProfileManager(null);
    setUrlParams(null);
  }

  handleUrlParams = async () => {
    //
    const urlParams = await getUrlParams();
    if (!urlParams) {
      return;
    }
    const { tenant, user, _wn, host, port } = urlParams;
    if (!user || !tenant) {
      return;
    }
    //
    const u = this.getProfileByCustomNoti({
      tenant,
      to: user,
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
    //
    const newU = {
      //
      id: createId(),
      pbxTenant: tenant,
      pbxUsername: user,
      //
      pbxHostname: host,
      pbxPort: port,
      pbxPassword: '',
      pbxTurnEnabled: false,
      parks: [],
      ucEnabled: false,
      ucHostname: '',
      ucPort: '',
      //
      accessToken: _wn,
    };
    //
    this.props.createProfile(newU);
    if (newU.accessToken) {
      this.signin(newU.id);
    } else {
      routerUtils.goToProfileUpdate(newU.id);
    }
  };

  getProfileByCustomNoti = n => {
    //
    if (!n) {
      return null;
    }
    // Compare utils
    const c = (v1, v2) => !v1 || !v2 || v1 === v2;
    const cp = p =>
      c(n.tenant, p.pbxTenant) &&
      c(n.to, p.pbxUsername) &&
      c(n.pbxHostname, p.pbxHostname) &&
      c(n.pbxPort, p.pbxPort);
    //
    const profiles = this.props.profileById;
    const ids = Object.keys(profiles);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const profile = profiles[id];
      if (cp(profile)) {
        return profile;
      }
    }
    //
    return null;
  };

  signinByCustomNoti(customNoti) {
    const u = this.getProfileByCustomNoti(customNoti);
    if (!u) {
      return;
    }
    if (!u.pbxPassword || !u.accessToken) {
      routerUtils.goToProfileUpdate(u.id);
    }
    this.signin(u.id);
  }

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

  resolveProfile = id => this.props.profileById[id];

  signin = id => {
    let profile = this.resolveProfile(id);
    this.props.setAuthProfile(profile);
    routerUtils.goToAuth();
  };
}

export default createModelView(mapGetter, mapAction)(View);
