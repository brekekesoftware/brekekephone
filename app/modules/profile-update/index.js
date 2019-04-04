import React, { Component } from 'react';
import { createModelView } from 'redux-model';
import createID from 'shortid';
import UI from './ui';

const mapGetter = getter => (state, props) => ({
  profile: getter.profiles.detailMapById(state)[props.match.params.profile],
});

const mapAction = action => emit => ({
  updateProfile(profile) {
    emit(action.profiles.update(profile));
  },
  routeToProfilesManage() {
    emit(action.router.goToProfilesManage());
  },
  showToast(message) {
    emit(action.toasts.create({ id: createID(), message }));
  },
});

class View extends Component {
  state = this.props.profile;

  render = () => (
    <UI
      profile={this.state}
      setPBXHostname={this.setPBXHostname}
      setPBXPort={this.setPBXPort}
      setPBXTenant={this.setPBXTenant}
      setPBXUsername={this.setPBXUsername}
      setPBXPassword={this.setPBXPassword}
      setAddingPark={this.setAddingPark}
      submitAddingPark={this.submitAddingPark}
      setUCEnabled={this.setUCEnabled}
      setUCHostname={this.setUCHostname}
      setUCPort={this.setUCPort}
      removePark={this.removePark}
      save={this.save}
      back={this.props.routeToProfilesManage}
    />
  );

  setPBXHostname = pbxHostname => {
    this.setState({ pbxHostname });
  };

  setPBXPort = pbxPort => {
    this.setState({ pbxPort });
  };

  setPBXTenant = pbxTenant => {
    this.setState({ pbxTenant });
  };

  setPBXUsername = pbxUsername => {
    this.setState({ pbxUsername });
  };

  setPBXPassword = pbxPassword => {
    this.setState({ pbxPassword });
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
    this.setState({ ucEnabled });
  };

  setUCHostname = ucHostname => {
    this.setState({ ucHostname });
  };

  setUCPort = ucPort => {
    this.setState({ ucPort });
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

  validate_info = () => {
    let special_characters = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (
      special_characters.test(this.state.pbxHostname[0]) ||
      special_characters.test(this.state.pbxHostname.slice(-1)) ||
      this.state.pbxHostname.length > 255
    ) {
      // hostname start and end as special character  and length > 255
      return { status: false, message: 'Hostname incorrect format' };
    }
    if (!/^[0][1-9]\d{0,4}$|^[1-9]\d{0,4}$/i.test(this.state.pbxPort)) {
      // max port 65536
      return { status: false, message: 'Port incorrect format' };
    }
    if (this.state.pbxPassword.length < 6) {
      // length password >= 6
      return { status: false, message: 'Password must be least 6 characters' };
    }
    return { status: true, message: '' };
  };

  save = () => {
    if (this.missingRequired()) {
      this.props.showToast('Missing required fields');
      return;
    }

    let valid_info = this.validate_info();
    if (valid_info.status === false) {
      this.props.showToast(valid_info.message);
      return;
    }

    const pbxHostname = this.state.pbxHostname.trim();
    const pbxPort = this.state.pbxPort.trim();
    const pbxTenant = this.state.pbxTenant.trim();
    const pbxUsername = this.state.pbxUsername.trim();
    const pbxPassword = this.state.pbxPassword.trim();
    const ucHostname = this.state.ucHostname.trim();
    const ucPort = this.state.ucPort.trim();
    let parks = [];
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
      parks: parks,
      ucEnabled: this.state.ucEnabled,
      ucHostname: ucHostname,
      ucPort: ucPort,
    });

    this.props.routeToProfilesManage();
  };
}

export default createModelView(mapGetter, mapAction)(View);
