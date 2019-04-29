import { observer } from 'mobx-react';
import React from 'react';
import Divider from '../components-shared/Divider';
import { TextInput } from '../components-shared/Input';
import mobxClosureSet from '../util/mobxClosureSet';
import ProfileFormStore from './ProfileFormStore';

@observer
class ProfileForm extends React.Component {
  profileFormStore = new ProfileFormStore();

  onSubmit = () => {
    console.warn('Not implemented');
  };

  render() {
    const { profileFormStore: s } = this;

    return (
      <React.Fragment>
        <Divider title="PBX">
          <TextInput
            required
            label="Hostname"
            value={s.pbxHostname}
            onChange={mobxClosureSet(s, 'pbxHostname')}
            onSubmit={this.onSubmit}
          />
          <TextInput
            required
            label="Port"
            value={s.pbxPort}
            onChange={mobxClosureSet(s, 'pbxPort')}
            onSubmit={this.onSubmit}
          />
          <TextInput
            label="Tenant"
            value={s.pbxTenant}
            onChange={mobxClosureSet(s, 'pbxTenant')}
            onSubmit={this.onSubmit}
          />
          <TextInput
            required
            label="Username"
            value={s.pbxUsername}
            onChange={mobxClosureSet(s, 'pbxUsername')}
            onSubmit={this.onSubmit}
          />
          <TextInput
            required
            label="Password"
            value={s.pbxPassword}
            onChange={mobxClosureSet(s, 'pbxPassword')}
            onSubmit={this.onSubmit}
          />
        </Divider>
        <Divider title="UC">
          <TextInput
            required
            label="Hostname"
            value={s.ucHostname}
            onChange={mobxClosureSet(s, 'ucHostname')}
            onSubmit={this.onSubmit}
          />
          <TextInput
            required
            label="Port"
            value={s.ucPort}
            onChange={mobxClosureSet(s, 'ucPort')}
            onSubmit={this.onSubmit}
          />
        </Divider>
        <Divider title="PARKS" />
      </React.Fragment>
    );
  }
}

export default ProfileForm;
