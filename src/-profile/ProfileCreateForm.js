import {
  mdiAccountCircleOutline,
  mdiServerNetwork,
  mdiTextboxPassword,
  mdiWebBox,
  mdiWebpack,
} from '@mdi/js';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { action, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import { genEmptyProfile } from '../-/authStore';
import g from '../global';
import Field from '../shared/Field';
import FieldGroup from '../shared/FieldGroup';
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
  closureOnParkRemove = i => () => {
    g.showPrompt({
      title: `Remove Park: ${this.profile.parks[i]}`,
      message: `Do you want to remove this park?`,
      onConfirm: action(() => {
        this.profile.parks = this.profile.parks.filter((p, _i) => _i !== i);
      }),
    });
  };

  hasUnsavedChanges = () => {
    const { isUpdate, updatingProfile } = this.props;
    const p = isUpdate
      ? updatingProfile
      : Object.assign(genEmptyProfile(), {
          id: this.profile.id,
        });
    return p && !isEqual(this.profile, p);
  };
  onBackBtnPress = () => {
    if (!this.hasUnsavedChanges()) {
      this.props.onBackBtnPress();
      return;
    }
    g.showPrompt({
      title: `Discard Unsaved`,
      message: `Do you want to discard unsaved changes and go back?`,
      onConfirm: this.props.onBackBtnPress,
      confirmText: 'DISCARD',
    });
  };
  onRefreshBtnPress = () => {
    if (!this.hasUnsavedChanges()) {
      // TODO show toast
      return;
    }
    g.showPrompt({
      title: `Discard Unsaved`,
      message: `Do you want to discard unsaved changes?`,
      onConfirm: action(() => {
        Object.assign(
          this.profile,
          this.props.isUpdate ? this.props.updatingProfile : genEmptyProfile(),
        );
      }),
      confirmText: 'DISCARD',
    });
  };
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
    const { isUpdate, updatingProfile: u } = this.props;
    return (
      <Layout
        header={{
          onBackBtnPress: this.onBackBtnPress,
          title: `${isUpdate ? 'Update' : 'New'} Server`,
          description: isUpdate
            ? u
              ? `${u.pbxUsername} - ${u.pbxHostname}`
              : 'Server profile not found'
            : 'Create a new sign in profile',
        }}
        footer={{
          onBackBtnPress: this.onBackBtnPress,
          onRefreshBtnPress: this.onRefreshBtnPress,
          onSaveBtnPress: this.onSaveBtnPress,
        }}
      >
        {!(isUpdate && !u) && (
          <React.Fragment>
            <FieldGroup title="PBX">
              <Field
                autoFocus
                name="USERNAME"
                icon={mdiAccountCircleOutline}
                value={pbxUsername}
                onValueChange={this.setF('pbxUsername')}
              />
              <Field
                secureTextEntry
                name="PASSWORD"
                icon={mdiTextboxPassword}
                value={pbxPassword}
                onValueChange={this.setF('pbxPassword')}
              />
              <Field
                name="TENANT"
                icon={mdiWebpack}
                value={pbxTenant}
                onValueChange={this.setF('pbxTenant')}
              />
              <Field
                name="HOSTNAME"
                icon={mdiWebBox}
                value={pbxHostname}
                onValueChange={this.setF('pbxHostname')}
              />
              <Field
                keyboardType="numeric"
                name="PORT"
                icon={mdiServerNetwork}
                value={pbxPort}
                onValueChange={this.setF('pbxPort')}
              />
              <Field
                type="Switch"
                name="TURN"
                value={turnEnabled}
                onValueChange={this.setF('turnEnabled')}
              />
            </FieldGroup>
            <FieldGroup title="UC" hasMargin>
              <Field
                type="Switch"
                name="UC"
                value={ucEnabled}
                onValueChange={this.setF('ucEnabled')}
              />
              <Field
                disabled={!ucEnabled}
                name="HOSTNAME"
                icon={mdiWebBox}
                value={ucHostname}
                onValueChange={this.setF('ucHostname')}
              />
              <Field
                keyboardType="numeric"
                disabled={!ucEnabled}
                name="PORT"
                icon={mdiServerNetwork}
                value={ucPort}
                onValueChange={this.setF('ucPort')}
              />
            </FieldGroup>
            <FieldGroup title="PARKS" hasMargin>
              {parks.map((p, i) => (
                <Field
                  disabled
                  key={`park-i${i}-${p}`}
                  name={`PARK ${i + 1}`}
                  value={p}
                  onRemoveBtnPress={this.closureOnParkRemove(i)}
                />
              ))}
              <Field
                name="NEW PARK"
                value={this.addingPark}
                onValueChange={this.addingParkOnChange}
                onCreateBtnPress={this.addingParkOnCreate}
              />
            </FieldGroup>
          </React.Fragment>
        )}
      </Layout>
    );
  }
}

export default ProfileCreateForm;
