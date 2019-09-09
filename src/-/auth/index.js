import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { rem } from '../../-/styleguide';
import authStore from '../../shared/authStore';

const st = StyleSheet.create({
  main: {
    flex: 1,
  },

  notSuccess: {
    marginTop: rem(40),
  },
});

@observer
class Auth extends React.Component {
  @computed
  get success() {
    const { profile, pbxState, sipState, ucState } = authStore;

    return (
      profile &&
      pbxState === 'success' &&
      sipState === 'success' &&
      (!profile.ucEnabled || ucState === 'success')
    );
  }

  render() {
    const s = [st.main];

    if (!this.success) {
      s.push(st.notSuccess);
    }

    return <View style={s}>{this.props.children}</View>;
  }
}

export default Auth;
