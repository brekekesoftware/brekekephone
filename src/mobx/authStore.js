import { action, observable } from 'mobx';

import BaseStore from './BaseStore';

const profileFields = [
  'id',
  'pbxHostname',
  'pbxPort',
  'pbxTenant',
  'pbxUsername',
  'pbxPassword',
  'pbxPhoneIndex',
  'pbxTurnEnabled',
  'parks',
  'ucEnabled',
  'ucHostname',
  'ucPort',
  'accessToken',
];

class AuthStore extends BaseStore {
  @observable
  pbxState = '';

  @observable
  sipState = '';

  @observable
  ucState = '';

  @observable
  ucLoginFromAnotherPlace = false;

  @observable
  profile = null;

  userExtensionProperties = null;
}

export { profileFields };
export default new AuthStore();
