import { createModel } from '@thenewvu/redux-model';
import immutable from '@thenewvu/immutable';
import pick from 'lodash.pick';

export default createModel({
  prefix: 'auth',
  origin: {
    pbx: {
      started: false,
      success: false,
      failure: false,
      stopped: false,
    },
    sip: {
      started: false,
      success: false,
      failure: false,
      stopped: false,
    },
    uc: {
      started: false,
      success: false,
      failure: false,
      stopped: false,
    },
    profile: null,
    userExtensionProperties: null,
  },
  getter: {
    pbx: {
      started: state => state.pbx.started,
      success: state => state.pbx.success,
      failure: state => state.pbx.failure,
      stopped: state => state.pbx.stopped,
    },
    sip: {
      started: state => state.sip.started,
      success: state => state.sip.success,
      failure: state => state.sip.failure,
      stopped: state => state.sip.stopped,
    },
    uc: {
      started: state => state.uc.started,
      success: state => state.uc.success,
      failure: state => state.uc.failure,
      stopped: state => state.uc.stopped,
    },
    profile: state => state.profile,
    userExtensionProperties: state => state.userExtensionProperties,
  },
  action: {
    setUserExtensionProperties: (prevState, props) =>
      immutable.on(prevState)(immutable.vset('userExtensionProperties', props)),

    setProfile: (prevState, profile) =>
      immutable.on(prevState)(
        immutable.vset(
          'profile',
          pick(profile, [
            'id',
            'pbxHostname',
            'pbxPort',
            'pbxTenant',
            'pbxUsername',
            'pbxPassword',
            'parks',
            'ucEnabled',
            'ucHostname',
            'ucPort',
            'accessToken',
          ]),
        ),
      ),

    pbx: {
      onStarted: prevState =>
        immutable.on(prevState)(immutable.vset('pbx', { started: true })),
      onSuccess: prevState =>
        immutable.on(prevState)(immutable.vset('pbx', { success: true })),
      onFailure: prevState =>
        immutable.on(prevState)(immutable.vset('pbx', { failure: true })),
      onStopped: prevState =>
        immutable.on(prevState)(immutable.vset('pbx', { stopped: true })),
    },
    sip: {
      onStarted: prevState =>
        immutable.on(prevState)(immutable.vset('sip', { started: true })),
      onSuccess: prevState =>
        immutable.on(prevState)(immutable.vset('sip', { success: true })),
      onFailure: prevState =>
        immutable.on(prevState)(immutable.vset('sip', { failure: true })),
      onStopped: prevState =>
        immutable.on(prevState)(immutable.vset('sip', { stopped: true })),
    },
    uc: {
      onStarted: prevState =>
        immutable.on(prevState)(immutable.vset('uc', { started: true })),
      onSuccess: prevState =>
        immutable.on(prevState)(immutable.vset('uc', { success: true })),
      onFailure: prevState =>
        immutable.on(prevState)(immutable.vset('uc', { failure: true })),
      onStopped: prevState =>
        immutable.on(prevState)(immutable.vset('uc', { stopped: true })),
    },
  },
});
