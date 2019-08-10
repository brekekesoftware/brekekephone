import { observer } from 'mobx-react';
import React from 'react';
import { createModelView } from 'redux-model';
import createId from 'shortid';

import * as routerUtils from '../../mobx/routerStore';
import toast from '../../nativeModules/toast';
import { validateHostname, validatePort } from '../../utils/validator';
import UI from './ui';

@observer
@createModelView(
  getter => (state, props) => ({
    //
  }),
  action => emit => ({
    createProfile(profile) {
      emit(action.profiles.create(profile));
    },
  }),
)
@observer
class View extends React.Component {
  state = {
    pbxHostname: '',
    pbxPort: '',
    pbxTenant: '',
    pbxUsername: '',
    pbxPassword: '',
    pbxPhoneIndex: '4',
    pbxTurnEnabled: false,
    ucEnabled: false,
    ucHostname: '',
    ucPort: '',
    parks: [],
    addingPark: '',
  };

  render = () => (
    <UI
      pbxHostname={this.state.pbxHostname}
      pbxPort={this.state.pbxPort}
      pbxTenant={this.state.pbxTenant}
      pbxUsername={this.state.pbxUsername}
      pbxPassword={this.state.pbxPassword}
      pbxPhoneIndex={this.state.pbxPhoneIndex}
      pbxTurnEnabled={this.state.pbxTurnEnabled}
      parks={this.state.parks}
      addingPark={this.state.addingPark}
      ucEnabled={this.state.ucEnabled}
      ucHostname={this.state.ucHostname}
      ucPort={this.state.ucPort}
      setPBXHostname={this.setPBXHostname}
      setPBXPort={this.setPBXPort}
      setPBXTenant={this.setPBXTenant}
      setPBXUsername={this.setPBXUsername}
      setPBXPassword={this.setPBXPassword}
      setPBXPhoneIndex={this.setPBXPhoneIndex}
      setPBXTurnEnabled={this.setPBXTurnEnabled}
      setAddingPark={this.setAddingPark}
      submitAddingPark={this.submitAddingPark}
      setUCEnabled={this.setUCEnabled}
      setUCHostname={this.setUCHostname}
      setUCPort={this.setUCPort}
      removePark={this.removePark}
      save={this.save}
      back={routerUtils.goToProfilesManage}
    />
  );

  setPBXHostname = pbxHostname => {
    this.setState({
      pbxHostname,
    });
  };

  setPBXPort = pbxPort => {
    this.setState({
      pbxPort,
    });
  };

  setPBXTenant = pbxTenant => {
    this.setState({
      pbxTenant,
    });
  };

  setPBXUsername = pbxUsername => {
    this.setState({
      pbxUsername,
    });
  };

  setPBXPassword = pbxPassword => {
    this.setState({
      pbxPassword,
    });
  };

  setPBXPhoneIndex = pbxPhoneIndex => {
    this.setState({
      pbxPhoneIndex,
    });
  };

  setPBXTurnEnabled = pbxTurnEnabled => {
    this.setState({
      pbxTurnEnabled,
    });
  };

  _isStringEmpty = s => {
    return !s && 0 === s.length;
  };

  setUCEnabled = ucEnabled => {
    if (ucEnabled) {
      if (
        this._isStringEmpty(this.state.ucHostname) &&
        this._isStringEmpty(this.state.ucPort)
      ) {
        if (
          !this._isStringEmpty(this.state.pbxHostname) &&
          !this._isStringEmpty(this.state.pbxPort)
        ) {
          this.setUCHostname(this.state.pbxHostname);
          this.setUCPort(this.state.pbxPort);
        }
      }
    }

    this.setState({
      ucEnabled,
    });
  };

  setUCHostname = ucHostname => {
    this.setState({
      ucHostname,
    });
  };

  setUCPort = ucPort => {
    this.setState({
      ucPort,
    });
  };

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

  removePark = park => {
    this.setState(prevState => ({
      parks: prevState.parks.filter(_ => _ !== park),
    }));
  };

  missingRequired = () =>
    !this.state.pbxHostname ||
    !this.state.pbxPort ||
    !this.state.pbxUsername ||
    !this.state.pbxPassword ||
    (this.state.ucEnabled && (!this.state.ucHostname || !this.state.ucPort));

  save = () => {
    if (this.missingRequired()) {
      toast.error('Missing required fields');
      return;
    }

    if (!validateHostname(this.state.pbxHostname)) {
      toast.error('Host name is invalid');
      return;
    }

    if (!validatePort(this.state.pbxPort)) {
      toast.error('Port is invalid');
      return;
    }

    const pbxHostname = this.state.pbxHostname.trim();
    const pbxPort = this.state.pbxPort.trim();
    const pbxTenant = this.state.pbxTenant.trim();
    const pbxUsername = this.state.pbxUsername.trim();
    const pbxPassword = this.state.pbxPassword.trim();
    const pbxPhoneIndex = this.state.pbxPhoneIndex;
    const pbxTurnEnabled = this.state.pbxTurnEnabled;
    const ucHostname = this.state.ucHostname.trim();
    const ucPort = this.state.ucPort.trim();
    const parks = [];

    for (let i = 0; i < this.state.parks.length; i++) {
      parks.push(this.state.parks[i].trim());
    }

    this.props.createProfile({
      id: createId(),
      pbxHostname: pbxHostname,
      pbxPort: pbxPort,
      pbxTenant: pbxTenant,
      pbxUsername: pbxUsername,
      pbxPassword: pbxPassword,
      pbxPhoneIndex: pbxPhoneIndex,
      pbxTurnEnabled: pbxTurnEnabled,
      parks: parks,
      ucEnabled: this.state.ucEnabled,
      ucHostname: ucHostname,
      ucPort: ucPort,
    });

    routerUtils.goToProfilesManage();
  };
}

export default View;
