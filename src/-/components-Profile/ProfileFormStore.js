import { observable } from 'mobx';

class ProfileFormStore {
  @observable
  pbxHostname = '';

  @observable
  pbxPort = '';

  @observable
  pbxTenant = '';

  @observable
  pbxUsername = '';

  @observable
  pbxPassword = '';

  @observable
  ucEnabled = false;

  @observable
  ucHostname = '';

  @observable
  ucPort = '';

  @observable
  parks = [];

  @observable
  addingPark = '';
}

export default ProfileFormStore;
