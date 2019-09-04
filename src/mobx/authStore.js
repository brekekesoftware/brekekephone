import { action, computed, observable } from 'mobx';
import shortid from 'shortid';

import Alert from '../shared/alert';
import AsyncStorage from '../shared/AsyncStorage';
import { getUrlParams } from '../shared/deeplink';
import { resetBadgeNumber } from '../shared/pushNotification';
import toast from '../shared/toast';
import BaseStore from './BaseStore';
import * as routerUtils from './routerStore';

class AuthStore extends BaseStore {
  // stopped
  // connecting
  // success
  // failure
  @observable pbxState = 'stopped';
  @observable sipState = 'stopped';
  @observable ucState = 'stopped';
  @observable ucLoginFromAnotherPlace = false;
  @computed get pbxShouldAuth() {
    return !(!this.profile || this.pbxState !== 'stopped');
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
  @observable profile = null;
  @action signin = id => {
    const p = this.allProfiles.find(p => p.id === id);
    if (!p) {
      return false;
    }
    if (!p.pbxPassword && !p.accessToken) {
      routerUtils.goToProfileUpdate(p.id);
      toast.error('The profile password is empty');
      return true;
    }
    this.profile = p;
    routerUtils.goToAuth();
    resetBadgeNumber();
    return true;
  };

  @observable allProfiles = [];
  loadProfilesFromLocalStorage = async () => {
    const arr = await AsyncStorage.getItem('authStore.allProfiles');
    this.set('allProfiles', arr || []);
  };
  saveProfilesToLocalStorage = async (arr = this.allProfiles) => {
    try {
      await AsyncStorage.setItem('authStore.allProfiles', arr);
    } catch (err) {
      console.error('authStore.set.allProfiles:', err);
      toast.error('Can not save profiles to local storage');
    }
  };
  @action createProfile = profile => {
    this.allProfiles.push(profile);
    this.saveProfilesToLocalStorage();
  };
  @action updateProfile = profile => {
    const i = this.allProfiles.findIndex(p => p.id === profile.id);
    if (i < 0) {
      return;
    }
    this.allProfiles[i] = Object.assign(this.allProfiles[i], profile);
    this.saveProfilesToLocalStorage();
  };
  @action removeProfile = id => {
    Alert.alert('Remove profile', 'Do you want to remove this profile?', [
      {
        text: 'Cancel',
        onPress: () => {
          //
        },
      },
      {
        text: 'Ok',
        onPress: () => {
          this._removeProfile(id);
        },
      },
    ]);
  };
  @action _removeProfile = id => {
    this.allProfiles = this.allProfiles.filter(p => p.id !== id);
    this.saveProfilesToLocalStorage();
  };

  // TODO add documentation
  userExtensionProperties = null;

  findProfile = p => {
    if (!p?.pbxUsername) {
      return null;
    }
    const compareField = (p1, p2, field) => {
      const v1 = p1[field];
      const v2 = p2[field];
      return !v1 || !v2 || v1 === v2;
    };
    const compareProfile = _p =>
      compareField(p, _p, 'pbxUsername') &&
      compareField(p, _p, 'pbxTenant') &&
      compareField(p, _p, 'pbxHostname') &&
      compareField(p, _p, 'pbxPort');
    return this.profiles.find(compareProfile);
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
      this.updateProfile(p);
      if (p.pbxPassword || p.accessToken) {
        this.signin(p.id);
      } else {
        routerUtils.goToProfileUpdate(p.id);
      }
      return;
    }
    //
    const newP = {
      id: shortid(),
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
    //
    this.createProfile(newP);
    if (newP.accessToken) {
      this.signin(newP.id);
    } else {
      routerUtils.goToProfileUpdate(newP.id);
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
    const p = this.findProfile(n);
    return p && this.signin(p);
  };
}

export default new AuthStore();
