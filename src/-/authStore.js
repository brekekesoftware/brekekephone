import { computed, observable } from 'mobx';

import g from '../global';
import $ from '../global/_';
import PushNotification from '../native/PushNotification';
import { arrToMap } from '../utils/toMap';
import BaseStore from './BaseStore';
import { getUrlParams } from './deeplink';

const compareField = (p1, p2, field) => {
  const v1 = p1[field];
  const v2 = p2[field];
  return !v1 || !v2 || v1 === v2;
};
const compareProfile = (p1, p2) => {
  return (
    p1.pbxUsername && // Must have pbxUsername
    compareField(p1, p2, `pbxUsername`) &&
    compareField(p1, p2, `pbxTenant`) &&
    compareField(p1, p2, `pbxHostname`) &&
    compareField(p1, p2, `pbxPort`)
  );
};

const connectingOrFailure = [`connecting`, `failure`];

class AuthStore extends BaseStore {
  // 'stopped'
  // 'connecting'
  // 'success'
  // 'failure'
  @observable pbxState = `stopped`;
  @observable sipState = `stopped`;
  @observable ucState = `stopped`;
  @observable ucLoginFromAnotherPlace = false;
  @computed get pbxShouldAuth() {
    return !(!this.signedInId || this.pbxState !== `stopped`);
  }
  @computed get pbxConnectingOrFailure() {
    return connectingOrFailure.some(s => s === this.pbxState);
  }
  @computed get sipShouldAuth() {
    return !(this.pbxState !== `success` || this.sipState !== `stopped`);
  }
  @computed get sipConnectingOrFailure() {
    return connectingOrFailure.some(s => s === this.sipState);
  }
  @computed get ucShouldAuth() {
    return !(
      !this.profile?.ucEnabled ||
      this.ucState !== `stopped` ||
      this.ucLoginFromAnotherPlace
    );
  }
  @computed get ucConnectingOrFailure() {
    return (
      this.profile?.ucEnabled &&
      connectingOrFailure.some(s => s === this.ucState)
    );
  }
  @computed get shouldShowConnStatus() {
    return (
      this.pbxConnectingOrFailure ||
      this.sipConnectingOrFailure ||
      this.ucConnectingOrFailure
    );
  }
  @computed get isConnFailure() {
    return [
      this.pbxState,
      this.sipState,
      this.profile?.ucEnabled && this.ucState,
    ].some(s => s === `failure`);
  }

  findProfile = _p => {
    return g.profiles.find(p => compareProfile(p, _p));
  };
  pushRecentCall = call => {
    $.upsert(`profiles`, {
      id: this.signedInId,
      recentCalls: [...(this.profile?.recentCalls || []), call],
    });
  };
  removeRecentCall = id => {
    $.upsert(`profiles`, {
      id: this.signedInId,
      recentCalls: this.profile?.recentCalls?.filter(c => c.id === id),
    });
  };
  //
  @computed get _profilesMap() {
    return arrToMap(g.profiles, `id`, p => p);
  }
  getProfile = id => {
    return this._profilesMap[id];
  };

  @observable signedInId = null;
  @computed get profile() {
    return this.getProfile(this.signedInId);
  }
  signIn = id => {
    const p = this.getProfile(id);
    if (!p) {
      return false;
    }
    if (!p.pbxPassword && !p.accessToken) {
      g.goToPageProfileUpdate(p.id);
      g.showError({ message: `The profile password is empty` });
      return true;
    }
    this.set(`signedInId`, p.id);
    PushNotification.resetBadgeNumber();
    g.goToPageContactUsers();
    return true;
  };

  handleUrlParams = async () => {
    const urlParams = await getUrlParams();
    if (!urlParams) {
      return;
    }
    //
    const { _wn, host, port, tenant, user } = urlParams;
    if (!tenant || !user) {
      return;
    }
    const p = this.findProfile({
      pbxUsername: user,
      pbxTenant: tenant,
      pbxHostname: host,
      pbxPort: port,
    });
    //
    if (p) {
      if (_wn) {
        p.accessToken = _wn;
      }
      if (!p.pbxHostname) {
        p.pbxHostname = host;
      }
      if (!p.pbxPort) {
        p.pbxPort = port;
      }
      this.upsertProfile(p);
      if (p.pbxPassword || p.accessToken) {
        this.signIn(p.id);
      } else {
        g.goToPageProfileUpdate(p.id);
      }
      return;
    }
    //
    const newP = {
      ...g.genEmptyProfile(),
      pbxTenant: tenant,
      pbxUsername: user,
      pbxHostname: host,
      pbxPort: port,
      accessToken: _wn,
    };
    //
    this.upsertProfile(newP);
    if (newP.accessToken) {
      this.signIn(newP.id);
    } else {
      g.goToPageProfileUpdate(newP.id);
    }
  };

  findProfileFromNotification = n => {
    return this.findProfile({
      ...n,
      pbxUsername: n.to,
      pbxTenant: n.tenant,
    });
  };
  signinByNotification = n => {
    const p = this.findProfileFromNotification(n);
    return p && this.signIn(p.id);
  };

  // id
  // name
  // language
  // phones[]
  //   id
  //   type
  userExtensionProperties = null;
}

const authStore = new AuthStore();

export { compareProfile };
export default authStore;
