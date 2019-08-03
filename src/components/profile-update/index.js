import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';

import * as routerUtils from '../../mobx/routerStore';
import { validateHostname, validatePort } from '../../utils/validator';
import UI from './ui';
import toast from '../../nativeModules/toast';

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
class View extends Component {
  constructor(props) {
    super(props);
    this.state = props.profile;
    this.state.pbxPhoneIndex = this.state.pbxPhoneIndex || '4';
  }

  render = () => (
    <UI
      profile={this.state}
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

    if (!addingPark) return;

    this.setState({
      parks: [addingPark, ...parks.filter(_ => _ !== addingPark)],
      addingPark: '',
    });
  };

  removePark = park => {
    this.setState(state => ({
      parks: state.parks.filter(_ => _ !== park),
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
    const pbxPhoneIndex = this.state.pbxPhoneIndex || '4';
    const pbxTurnEnabled = this.state.pbxTurnEnabled;
    const ucHostname = this.state.ucHostname.trim();
    const ucPort = this.state.ucPort.trim();
    const parks = [];

    for (let i = 0; i < this.state.parks.length; i++) {
      parks.push(this.state.parks[i].trim());
    }

    this.props.updateProfile({
      id: this.state.id,
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
