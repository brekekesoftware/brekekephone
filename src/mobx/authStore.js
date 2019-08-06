import { computed, observable } from 'mobx';

import BaseStore from './BaseStore';

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
    return !//
    (!this.profile || this.pbxState !== 'stopped');
  }
  @computed get sipShouldAuth() {
    return !//
    (this.pbxState !== 'success' || this.sipState !== 'stopped');
  }
  @computed get ucShouldAuth() {
    return !//
    (
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

  // TODO add documentation
  userExtensionProperties = null;
}

export default new AuthStore();
