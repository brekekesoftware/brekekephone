import { observer } from 'mobx-react';
import React from 'react';
import { ScrollView } from 'react-native';
import Divider from '../components-shared/Divider';
import { TextInput } from '../components-shared/Input';
import SwitchStatus from '../components-shared/Switch';
import ButtonSave from './ButtonSave';
import ButtonNewField from './ButtonNewField';

@observer
class ProfileForm extends React.Component {

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
              // onChange={mobxClosureSet(s, 'pbxHostname')}
              onSubmit={this.onSubmit}
            />
            <TextInput
              required
              label="PORT"
              placeholder="Port"
              value={s.pbxPort}
              // onChange={mobxClosureSet(s, 'pbxPort')}
              onSubmit={this.onSubmit}
            />
            <TextInput
              label="TENANT"
              placeholder="Tenant"
              value={s.pbxTenant}
              // onChange={mobxClosureSet(s, 'pbxTenant')}
              onSubmit={this.onSubmit}
            />
            <TextInput
              required
              label="USERNAME"
              placeholder="Username"
              value={s.pbxUsername}
              // onChange={mobxClosureSet(s, 'pbxUsername')}
              onSubmit={this.onSubmit}
            />
            <TextInput
              required
              label="PASSWORD"
              placeholder="Password"
              value={s.pbxPassword}
              // onChange={mobxClosureSet(s, 'pbxPassword')}
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
              // onChange={mobxClosureSet(s, 'ucHostname')}
              onSubmit={this.onSubmit}
            />
            <TextInput
              required
              label="PORT"
              placeholder="Port"
              value={s.ucPort}
              // onChange={mobxClosureSet(s, 'ucPort')}
              onSubmit={this.onSubmit}
            />
          </Divider>
          <Divider title="PARKS">
            <TextInput
              required
              label="PART NUMBER"
              placeholder="Part Number"
              value={s.ucPort}
              // onChange={mobxClosureSet(s, 'ucPort')}
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
