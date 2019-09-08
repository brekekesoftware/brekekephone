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

import AppBody from '../shared/AppBody';
import AppField from '../shared/AppField';
import AppFieldHeader from '../shared/AppFieldHeader';
import AppFooter from '../shared/AppFooter';
import AppHeader from '../shared/AppHeader';
import { genEmptyProfile } from '../shared/authStore';
import routerStore from '../shared/routerStore';

@observer
class FormCreateProfile extends React.Component {
  @observable profile = {
    ...genEmptyProfile(),
    ...cloneDeep(this.props.updatingProfile),
  };
  @observable addingPark = '';

  componentDidUpdate(prevProps) {
    const p = this.props.updatingProfile;
    if (this.props.isUpdate && p?.id !== prevProps.updatingProfile?.id) {
      runInAction(() => {
        Object.assign(this.profile, p);
      });
    }
  }

  get = key => this.profile[key];
  @action set = (key, value) => {
    if (key === 'ucEnabled') {
      if (!this.profile.ucHostname && !this.profile.ucPort) {
        this.profile.ucHostname = this.profile.pbxHostname;
        this.profile.ucPort = this.profile.pbxPort;
      }
    }
    this.profile[key] = value;
  };
  fset = key => value => {
    this.set(key, value);
  };

  @action onParkCreate = () => {
    this.addingPark = this.addingPark.trim();
    if (!this.addingPark) {
      return;
    }
    this.profile.parks.push(this.addingPark);
    this.addingPark = '';
  };
  onParkRemoveFn = i =>
    action(() => {
      this.profile.parks = this.profile.parks.filter((p, _i) => _i !== i);
    });

  render() {
    const { isUpdate, updatingProfile: p } = this.props;
    const goBack = routerStore.goBackFn(routerStore.goToPageSignIn);
    const g = this.get;
    const f = this.fset;
    return (
      <React.Fragment>
        <AppHeader
          onBackBtnPress={goBack}
          text={`${isUpdate ? 'Edit' : 'New'} Server`}
          subText={
            isUpdate
              ? p
                ? p.pbxUsername
                : 'Server profile not found'
              : 'Create a new sign in profile'
          }
        />
        {!(isUpdate && !p) && (
          <AppBody hasFooter>
            <AppFieldHeader text="PBX" />
            <AppField
              autoFocus
              name="USERNAME"
              icon={mdiAccountCircleOutline}
              value={g('pbxUsername')}
              onValueChange={f('pbxUsername')}
            />
            <AppField
              secureTextEntry
              autoComplete={`${isUpdate ? 'current' : 'new'}-password`}
              name="PASSWORD"
              icon={mdiTextboxPassword}
              value={g('pbxPassword')}
              onValueChange={f('pbxPassword')}
            />
            <AppField
              name="TENANT"
              icon={mdiWebpack}
              value={g('pbxTenant')}
              onValueChange={f('pbxTenant')}
            />
            <AppField
              name="HOSTNAME"
              icon={mdiWebBox}
              value={g('pbxHostname')}
              onValueChange={f('pbxHostname')}
            />
            <AppField
              name="PORT"
              icon={mdiServerNetwork}
              value={g('pbxPort')}
              onValueChange={f('pbxPort')}
            />
            <AppField
              type="Switch"
              name="TURN"
              value={g('turnEnabled')}
              onValueChange={f('turnEnabled')}
            />
            <AppFieldHeader text="UC" hasMargin />
            <AppField
              type="Switch"
              name="UC"
              value={g('ucEnabled')}
              onValueChange={f('ucEnabled')}
            />
            <AppField
              disabled={!g('ucEnabled')}
              name="HOSTNAME"
              icon={mdiWebBox}
              value={g('ucHostname')}
              onValueChange={f('ucHostname')}
            />
            <AppField
              disabled={!g('ucEnabled')}
              name="PORT"
              icon={mdiServerNetwork}
              value={g('ucPort')}
              onValueChange={f('ucPort')}
            />
            <AppFieldHeader text="PARKS" hasMargin />
            {g('parks').map((p, i) => (
              <AppField
                key={p + '-i-' + i}
                name={`Park ${i + 1}`}
                value={p}
                onRemoveBtnPress={this.onParkRemoveFn(i)}
              />
            ))}
            <AppField
              name="Type new park here"
              value={this.addingPark}
              onValueChange={action(v => (this.addingPark = v))}
              onCreateBtnPress={this.onParkCreate}
            />
          </AppBody>
        )}
        <AppFooter />
      </React.Fragment>
    );
  }
}

export default FormCreateProfile;
