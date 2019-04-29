import { createModelView } from 'redux-model';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { rem } from '../../styleguide';

const st = StyleSheet.create({
  main: {
    flex: 1,
  },
  notSuccess: {
    marginTop: rem(40),
  },
});

const mapGetter = getter => state => {
  const profile = getter.auth.profile(state);
  if (!profile) {
    return { success: false };
  }
  return {
    success:
      getter.auth.pbx.success(state) &&
      getter.auth.sip.success(state) &&
      (!profile.ucEnabled || getter.auth.uc.success(state)),
  };
};

class Auth extends React.Component {
  render() {
    const s = [st.main];
    if (!this.props.success) {
      s.push(st.notSuccess);
    }
    return <View style={s}>{this.props.children}</View>;
  }
}

export default createModelView(mapGetter)(Auth);
