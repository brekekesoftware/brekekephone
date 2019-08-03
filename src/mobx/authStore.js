import { computed, observable } from 'mobx';

import BaseStore from './BaseStore';

class AuthStore extends BaseStore {
  //
  // started
  // success
  // failure
  // stopped
  @observable pbxState = '';
  @observable sipState = '';
  @observable ucState = '';
  @observable ucLoginFromAnotherPlace = false;

  @computed get pbxShouldAuth() {
    return this.profile && (!this.pbxState || this.pbxState === 'stopped');
  }
  @computed get sipShouldAuth() {
    return (
      this.pbxState === 'success' &&
      (!this.sipState || this.sipState === 'stopped')
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
