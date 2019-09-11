import {
  mdiAccountCircleOutline,
  mdiServerNetwork,
  mdiTextboxPassword,
  mdiWebBox,
  mdiWebpack,
} from '@mdi/js';
import cloneDeep from 'lodash/cloneDeep';
import { action, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import AppField from '../---shared/AppField';
import AppFieldHeader from '../---shared/AppFieldHeader';
import { genEmptyProfile } from '../---shared/authStore';
import Layout from '../shared/Layout';

@observer
class ProfileCreateForm extends React.Component {
  @observable profile = {
    ...genEmptyProfile(),
    ...cloneDeep(this.props.updatingProfile),
  };
  @observable addingPark = '';

  componentDidUpdate(prevProps) {
    if (
      this.props.isUpdate &&
      this.props.updatingProfile?.id !== prevProps.updatingProfile?.id
    ) {
      runInAction(() => {
        Object.assign(this.profile, this.props.updatingProfile);
      });
    }
  }

  setF = k =>
    action(v => {
      this.profile[k] = v;
      const { ucHostname, ucPort, pbxHostname, pbxPort } = this.profile;
      if (k === 'ucEnabled' && !ucHostname && !ucPort) {
        this.profile.ucHostname = pbxHostname;
        this.profile.ucPort = pbxPort;
      }
    });

  @action addingParkOnChange = v => {
    this.addingPark = v;
  };
  @action addingParkOnCreate = () => {
    this.addingPark = this.addingPark.trim();
    if (!this.addingPark) {
      return;
    }
    this.profile.parks.push(this.addingPark);
    this.addingPark = '';
  };
  onParkRemoveF = i =>
    action(() => {
      this.profile.parks = this.profile.parks.filter((p, _i) => _i !== i);
    });

  onSaveBtnPress = () => {
    // TODO validate
    this.props.onSaveBtnPress(this.profile);
  };

  render() {
    const {
      pbxUsername,
      pbxPassword,
      pbxTenant,
      pbxHostname,
      pbxPort,
      pbxPhoneIndex,
      turnEnabled,
      ucEnabled,
      ucHostname,
      ucPort,
      parks,
    } = this.profile;
    const { isUpdate, updatingProfile } = this.props;
    return (
      <Layout
        header={{
          onBackBtnPress: this.props.onBackBtnPress,
          title: `${isUpdate ? 'Edit' : 'New'} Server`,
          description: isUpdate
            ? updatingProfile
              ? updatingProfile.pbxUsername
              : 'Server profile not found'
            : 'Create a new sign in profile',
        }}
        footer={{
          onBackBtnPress: this.props.onBackBtnPress,
          onSaveBtnPress: this.onSaveBtnPress,
        }}
      >
        {!(isUpdate && !updatingProfile) && (
          <React.Fragment>
            <AppFieldHeader text="PBX" />
            <AppField
              autoFocus
              name="USERNAME"
              icon={mdiAccountCircleOutline}
              value={pbxUsername}
              onValueChange={this.setF('pbxUsername')}
            />
            <AppField
              secureTextEntry
              autoComplete={`${isUpdate ? 'current' : 'new'}-password`}
              name="PASSWORD"
              icon={mdiTextboxPassword}
              value={pbxPassword}
              onValueChange={this.setF('pbxPassword')}
            />
            <AppField
              name="TENANT"
              icon={mdiWebpack}
              value={pbxTenant}
              onValueChange={this.setF('pbxTenant')}
            />
            <AppField
              name="HOSTNAME"
              icon={mdiWebBox}
              value={pbxHostname}
              onValueChange={this.setF('pbxHostname')}
            />
            <AppField
              name="PORT"
              icon={mdiServerNetwork}
              value={pbxPort}
              onValueChange={this.setF('pbxPort')}
            />
            <AppField
              type="Switch"
              name="TURN"
              value={turnEnabled}
              onValueChange={this.setF('turnEnabled')}
            />
            <AppFieldHeader text="UC" hasMargin />
            <AppField
              type="Switch"
              name="UC"
              value={ucEnabled}
              onValueChange={this.setF('ucEnabled')}
            />
            <AppField
              disabled={!ucEnabled}
              name="HOSTNAME"
              icon={mdiWebBox}
              value={ucHostname}
              onValueChange={this.setF('ucHostname')}
            />
            <AppField
              disabled={!ucEnabled}
              name="PORT"
              icon={mdiServerNetwork}
              value={ucPort}
              onValueChange={this.setF('ucPort')}
            />
            <AppFieldHeader text="PARKS" hasMargin />
            {parks.map((p, i) => (
              <AppField
                disabled
                key={`park-i${i}-${p}`}
                name={`PARK ${i + 1}`}
                value={p}
                onRemoveBtnPress={this.onParkRemoveF(i)}
              />
            ))}
            <AppField
              name="NEW PARK"
              value={this.addingPark}
              onValueChange={this.addingParkOnChange}
              onCreateBtnPress={this.addingParkOnCreate}
            />
          </React.Fragment>
        )}
      </Layout>
    );
  }
}

export default ProfileCreateForm;
