import { action, computed, observable } from 'mobx';
import shortid from 'shortid';

import g from '../global';
import AsyncStorage from '../native/AsyncStorage';
import arrToMap from './arrToMap';
import BaseStore from './BaseStore';
import { getUrlParams } from './deeplink';
import { resetBadgeNumber } from './pushNotification';
import routerStore from './routerStore';

const compareField = (p1, p2, field) => {
  const v1 = p1[field];
  const v2 = p2[field];
  return !v1 || !v2 || v1 === v2;
};
const compareProfile = (p1, p2) => {
  return (
    p1.pbxUsername && // Must have pbxUsername
    compareField(p1, p2, 'pbxUsername') &&
    compareField(p1, p2, 'pbxTenant') &&
    compareField(p1, p2, 'pbxHostname') &&
    compareField(p1, p2, 'pbxPort')
  );
};

const genEmptyProfile = () => ({
  id: shortid(),
  pbxTenant: '',
  pbxUsername: '',
  pbxHostname: '',
  pbxPort: '',
  pbxPassword: '',
  pbxPhoneIndex: '4',
  pbxTurnEnabled: false,
  parks: [],
  ucEnabled: false,
  ucHostname: '',
  ucPort: '',
  accessToken: '',
  recentCalls: [],
});

class AuthStore extends BaseStore {
  // 'stopped'
  // 'connecting'
  // 'success'
  // 'failure'
  @observable pbxState = 'stopped';
  @observable sipState = 'stopped';
  @observable ucState = 'stopped';
  @observable ucLoginFromAnotherPlace = false;
  @computed get pbxShouldAuth() {
    return !(!this.signedInId || this.pbxState !== 'stopped');
  }
  @computed get sipShouldAuth() {
    return !(this.pbxState !== 'success' || this.sipState !== 'stopped');
  }
  @computed get ucShouldAuth() {
    return !(
      !this.profile?.ucEnabled ||
      this.ucState !== 'stopped' ||
      this.ucLoginFromAnotherPlace
    );
  }

  // id
  // pbxHostname
  // pbxPort
  // pbxTenant
  // pbxUsername
  // pbxPassword
  // pbxPhoneIndex
  // pbxTurnEnabled
  // parks
  // ucEnabled
  // ucHostname
  // ucPort
  // ucPathname
  // accessToken
  // recentCalls?[]
  //    id
  //    incoming
  //    answered
  //    partyName
  //    partyNumber
  //    created
  @observable profiles = [];
  loadProfilesFromLocalStorage = async () => {
    let arr = await AsyncStorage.getItem('authStore.profiles');
    if (arr && !Array.isArray(arr)) {
      try {
        arr = JSON.parse(arr);
      } catch (err) {
        arr = null;
      }
    }
    if (arr) {
      this.set('profiles', arr);
    }
  };
  saveProfilesToLocalStorage = async (arr = this.profiles) => {
    try {
      await AsyncStorage.setItem('authStore.profiles', JSON.stringify(arr));
    } catch (err) {
      console.error('authStore.set.profiles:', err);
      g.showError({ message: 'Can not save profiles to local storage' });
    }
  };
  findProfile = _p => {
    return this.profiles.find(p => compareProfile(p, _p));
  };
  upsertProfile = _p => {
    const p = this.getProfile(_p.id);
    if (p) {
      Object.assign(p, _p);
      this.set('profiles', [...this.profiles]);
    } else {
      this.set('profiles', [...this.profiles, _p]);
    }
    this.saveProfilesToLocalStorage();
  };
  removeProfile = id => {
    g.showPrompt({
      title: 'Remove profile',
      message: 'Do you want to remove this profile?',
      onConfirm: () => {
        this._removeProfile(id);
      },
    });
  };
  @action _removeProfile = id => {
    this.profiles = this.profiles.filter(p => p.id !== id);
    this.saveProfilesToLocalStorage();
  };
  pushRecentCall = call => {
    this.upsert({
      id: this.signedInId,
      recentCalls: [...(this.profile?.recentCalls || []), call],
    });
  };
  removeRecentCall = id => {
    this.upsert({
      id: this.signedInId,
      recentCalls: this.profile?.recentCalls?.filter(c => c.id === id),
    });
  };
  //
  @computed get _profilesMap() {
    return arrToMap(this.profiles, 'id', p => p);
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
      routerStore.goToPageProfileUpdate(p.id);
      g.showError({ message: 'The profile password is empty' });
      return true;
    }
    this.set('signedInId', p.id);
    routerStore.goToAuth();
    resetBadgeNumber();
    return true;
  };

  handleUrlParams = async () => {
    const urlParams = await getUrlParams();
    if (!urlParams) {
      return;
    }
    //
    const { tenant, user, _wn, host, port } = urlParams;
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
        routerStore.goToPageProfileUpdate(p.id);
      }
      return;
    }
    //
    const newP = {
      ...genEmptyProfile(),
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
      routerStore.goToPageProfileUpdate(newP.id);
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
authStore.loadProfilesFromLocalStorage();

export { compareProfile, genEmptyProfile };
export default authStore;
