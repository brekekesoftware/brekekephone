import { observer } from 'mobx-react';
import { Button, Container, Content, Form, Text } from 'native-base';
import React from 'react';
import { createModelView } from 'redux-model';

import Headers from '../components-Home/Header';
import { TextInput } from '../components-shared/Input';
import * as routerUtils from '../mobx/routerStore';

@observer
@createModelView(
  getter => (state, props) => ({
    profile: getter.profiles.detailMapById(state)[props.match.params.profile],
  }),
  action => emit => ({
    updateProfile(profile) {
      emit(action.profiles.update(profile));
    },
  }),
)
@observer
class NewCallPark extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.profile;
  }

  render() {
    return (
      <Container>
        <Headers title="Call Park" />
        <Content>
          <Form>
            <TextInput
              label="PARK NAME"
              placeholder="Enter park name"
              value={this.addingPark}
              onChange={this.setAddingPark}
            />
            <TextInput label="EXTENSION" placeholder="Enter extension" />
          </Form>
          <Button full success onPress={this.save}>
            <Text>SAVE</Text>
          </Button>
        </Content>
      </Container>
    );
  }

  setAddingPark = addingPark => {
    this.setState({
      addingPark: addingPark.trim(),
    });
  };

  submitAddingPark = () => {
    const { addingPark, parks } = this.state;

    if (!addingPark) {
      return;
    }

    if (/[^a-z0-9_]/.test(addingPark)) {
      this.props.showToast('Invalid park number');
      return;
    }

    this.setState({
      parks: [addingPark, ...parks.filter(_ => _ !== addingPark)],
      addingPark: '',
    });
  };

  save = () => {
    const pbxHostname = this.state.pbxHostname.trim();
    const pbxPort = this.state.pbxPort.trim();
    const pbxTenant = this.state.pbxTenant.trim();
    const pbxUsername = this.state.pbxUsername.trim();
    const pbxPassword = this.state.pbxPassword.trim();
    const pbxPhoneIndex = this.state.pbxPhoneIndex || '4';
    const pbxTurnEnabled = this.state.pbxTurnEnabled;
    const ucHostname = this.state.ucHostname.trim();
    const ucPort = this.state.ucPort.trim();

    const { addingPark, parks } = this.state;

    if (!addingPark) {
      return;
    }

    if (/[^a-z0-9_]/.test(addingPark)) {
      this.props.showToast('Invalid park number');
      return;
    }

    const _parks = [addingPark, ...parks.filter(_ => _ !== addingPark)];

    this.props.updateProfile({
      id: this.state.id,
      pbxHostname: pbxHostname,
      pbxPort: pbxPort,
      pbxTenant: pbxTenant,
      pbxUsername: pbxUsername,
      pbxPassword: pbxPassword,
      pbxPhoneIndex: pbxPhoneIndex,
      pbxTurnEnabled: pbxTurnEnabled,
      parks: _parks,
      ucEnabled: this.state.ucEnabled,
      ucHostname: ucHostname,
      ucPort: ucPort,
    });

    routerUtils.goToSettings();
  };
}

export default NewCallPark;
