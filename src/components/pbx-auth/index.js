import { observe } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import authStore from '../../mobx/authStore';
import * as routerUtils from '../../mobx/routerStore';
import toast from '../../nativeModules/toast';
import UI from './ui';

@observer
class View extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.auth();
    this.clearObserve = observe(authStore, 'pbxShouldAuth', this.auth);
  }
  componentWillUnmount() {
    this.clearObserve();
    this.context.pbx.disconnect();
    authStore.set('pbxState', 'stopped');
  }

  auth = () => {
    if (!authStore.pbxShouldAuth) {
      return;
    }
    //
    this.context.pbx.disconnect();
    authStore.set('pbxState', 'started');
    //
    this.context.pbx
      .connect(authStore.profile)
      .then(() => {
        authStore.set('pbxState', 'success');
      })
      .catch(err => {
        authStore.set('pbxState', 'failure');
        toast.error(`Failed to login to pbx, err: ${err?.message}`);
      });
  };

  render() {
    return authStore.pbxState === 'success' ? null : (
      <UI
        retryable={!!authStore.profile}
        failure={this.props.failure}
        abort={routerUtils.goToProfilesManage}
        retry={this.auth}
      />
    );
  }
}

export default View;
