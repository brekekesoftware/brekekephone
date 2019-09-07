import { observer } from 'mobx-react';
import { Button, Container, Content, Form, Text } from 'native-base';
import React from 'react';

import Headers from '../components-Home/Header';
import { TextInput } from '../components-shared/Input';
import authStore from '../mobx/authStore';
import routerStore from '../mobx/routerStore';
import toast from '../shared/Toast';

@observer
class NewCallPark extends React.Component {
  state = {
    ...authStore.getProfile(this.props.match.params.profile),
  };
  componentDidUpdate(prevProps) {
    const id = this.props.match.params.profile;
    const prevId = prevProps.match.params.profile;
    if (id !== prevId) {
      this.setState({
        ...authStore.getProfile(id),
      });
    }
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
      toast.error('Invalid park number');
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
      toast.error('Invalid park number');
      return;
    }

    const _parks = [addingPark, ...parks.filter(_ => _ !== addingPark)];

    authStore.upsertProfile({
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

    routerStore.goToSettings();
  };
}

export default NewCallPark;
