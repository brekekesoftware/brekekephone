import { observer } from 'mobx-react';
import React from 'react';
import { ScrollView } from 'react-native';

import { closureMobxSet } from '../../---shared/BaseStore';
import Divider from '../components-shared/Divider';
import { TextInput } from '../components-shared/Input';
import SwitchStatus from '../components-shared/Switch';
import ButtonNewField from './ButtonNewField';
import ButtonSave from './ButtonSave';
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
        <ScrollView>
          <Divider title="PBX">
            <TextInput
              required
              label="HOST NAME"
              placeholder="Host name"
              value={s.pbxHostname}
              onChange={closureMobxSet(s, 'pbxHostname')}
              onSubmit={this.onSubmit}
            />
            <TextInput
              required
              label="PORT"
              placeholder="Port"
              value={s.pbxPort}
              onChange={closureMobxSet(s, 'pbxPort')}
              onSubmit={this.onSubmit}
            />
            <TextInput
              label="TENANT"
              placeholder="Tenant"
              value={s.pbxTenant}
              onChange={closureMobxSet(s, 'pbxTenant')}
              onSubmit={this.onSubmit}
            />
            <TextInput
              required
              label="USERNAME"
              placeholder="Username"
              value={s.pbxUsername}
              onChange={closureMobxSet(s, 'pbxUsername')}
              onSubmit={this.onSubmit}
            />
            <TextInput
              required
              label="PASSWORD"
              placeholder="Password"
              value={s.pbxPassword}
              onChange={closureMobxSet(s, 'pbxPassword')}
              onSubmit={this.onSubmit}
            />
          </Divider>
          <Divider title="UC">
            <SwitchStatus />
            <TextInput
              required
              label="HOST NAME"
              placeholder="Host name"
              value={s.ucHostname}
              onChange={closureMobxSet(s, 'ucHostname')}
              onSubmit={this.onSubmit}
            />
            <TextInput
              required
              label="PORT"
              placeholder="Port"
              value={s.ucPort}
              onChange={closureMobxSet(s, 'ucPort')}
              onSubmit={this.onSubmit}
            />
          </Divider>
          <Divider title="PARKS">
            <TextInput
              required
              label="PART NUMBER"
              placeholder="Part Number"
              value={s.ucPort}
              onChange={closureMobxSet(s, 'ucPort')}
              onSubmit={this.onSubmit}
            />
          </Divider>
          <ButtonNewField title="NEW FIELD" />
          <ButtonSave title="SAVE" />
        </ScrollView>
      </React.Fragment>
    );
  }
}

export default ProfileForm;
