import React, { Component } from 'react';
import { AppState, AsyncStorage, Platform, Text } from 'react-native';
import FCM, {
  FCMEvent,
  NotificationType,
  WillPresentNotificationResult,
} from 'react-native-fcm';
import { createModelView } from 'redux-model';
import createId from 'shortid';

import UserLanguage from '../../language/UserLanguage';
import * as routerUtils from '../../mobx/routerStore';
import { getUrlParams, setUrlParams } from '../../rn/deeplink';
import { setProfileManager } from './getset';
import UI from './ui';

const isIncoming = call => call.incoming && !call.answered;

const pushNotifTimeout = 20000 + 15000;

function parseCustomNotification_s(notif) {
  let customNotif = notif.custom_notification;
  if (!customNotif) {
    customNotif = notif;
  }
  if (typeof customNotif == 'string') {
    customNotif = JSON.parse(customNotif);
  }
  const currentTime = new Date().getTime();
  const expire = currentTime + pushNotifTimeout;
  customNotif['brekekephone.notif.expire'] = expire;
  return customNotif;
}

function registerFcmKilledListener() {
  this._shutodownNotificationListener = FCM.on(FCMEvent.Notification, notif => {
    const oCustomNotif = parseCustomNotification_s(notif);
    if (notif.opened_from_tray) {
      setTimeout(() => {
        this._onOpenCustomNotification(oCustomNotif);
      }, 500);
    } else {
      AsyncStorage.setItem('lastNotification', JSON.stringify(oCustomNotif));
    }
  });
}

function registerFcmAppListener() {
  this._foreOrBackgroundNotificationListener = FCM.on(
    FCMEvent.Notification,
    notif => {
      if (AppState.currentState !== 'background') {
        return;
      }
      if (notif.opened_from_tray) {
        setTimeout(() => {
          this._onOpenNotification(notif);
        }, 500);
      }
    },
  );
}

const mapGetter = getter => (state, props) => ({
  profileIds: getter.profiles.idsByOrder(state),
  profileById: getter.profiles.detailMapById(state),
  pushNotifies: getter.pushNotifies.notifDatas(state),
  callIds: getter.runningCalls
    .idsByOrder(state)
    .filter(id => isIncoming(getter.runningCalls.detailMapById(state)[id])),
  callById: getter.runningCalls.detailMapById(state),
});

const mapAction = action => emit => ({
  createProfile(profile) {
    emit(action.profiles.create(profile));
  },
  updateProfile(profile) {
    emit(action.profiles.update(profile));
  },
  removeProfile(id) {
    emit(action.profiles.remove(id));
  },
  setAuthProfile(profile) {
    emit(action.auth.setProfile(profile));
  },
  updateCall(call) {
    emit(action.runningCalls.update(call));
  },
  addPushnotif(notif) {
    emit(action.pushNotifies.add(notif));
  },
});

class View extends Component {
  state = {
    isReady: false,
  };

  constructor(props) {
    super(props);
    if (Platform.OS === 'android') {
      registerFcmKilledListener.call(this);
    }
  }

  _onOpenNotification(notif) {
    AsyncStorage.removeItem('lastNotification');
    const oCustomNotif = parseCustomNotification_s(notif);
    this._onOpenCustomNotification(oCustomNotif);
  }

  _onOpenCustomNotification(oCustomNotif) {
    AsyncStorage.removeItem('lastNotification');
    this.props.addPushnotif(oCustomNotif);
    this._signinByNotif(oCustomNotif);
  }

  componentWillUnmount() {
    if (this._foreOrBackgroundNotificationListener) {
      this._foreOrBackgroundNotificationListener.remove();
    }
    if (this._shutodownNotificationListener) {
      this._shutodownNotificationListener.remove();
    }
    setProfileManager(null);
    setUrlParams(null);
  }

  async componentDidMount() {
    setProfileManager(this);

    //
    this.handleUrlParams();

    await UserLanguage.init_s();
    await AsyncStorage.getItem('lastNotification').then(sData => {
      if (sData) {
        const customNotif = JSON.parse(sData);
        const currentTime = new Date().getTime();
        const expire = customNotif['brekekephone.notif.expire'];
        const bTimeout = currentTime > expire;
        if (bTimeout) {
          AsyncStorage.removeItem('lastNotification');
        } else {
          this._onOpenCustomNotification(customNotif);
        }
      }
    });

    if (Platform.OS === 'android') {
      FCM.createNotificationChannel({
        id: 'default',
        name: 'Default',
        description: 'used for example',
        priority: 'high',
      });
      registerFcmAppListener.call(this);
      FCM.getInitialNotification().then(notif => {
        // TODO
      });
      try {
        await FCM.requestPermissions({
          badge: false,
          sound: true,
          alert: true,
        });
      } catch (e) {
        console.error(e);
      }
      FCM.getFCMToken().then(token => {
        // TODO
      });
    }
    //
    this.setState({ isReady: true });
  }

  handleUrlParams = async () => {
    //
    const { tenant, user, _wn, host, port } = await getUrlParams();
    if (!user || !tenant) {
      return;
    }
    //
    let uid = this._getUidByCustomNotif({
      tenant,
      to: user,
    });
    const u = this.props.profileById[uid];
    if (u) {
      if (_wn) {
        u.accessToken = _wn;
      }
      if (!u.pbxHostname) {
        u.pbxHostname = host;
      }
      if (!u.pbxPort) {
        u.pbxPort = port;
      }
      this.props.updateProfile(u);
      if (u.pbxPassword || u.accessToken) {
        this.signin(uid);
      } else {
        routerUtils.goToProfileUpdate(uid);
      }
      return;
    }
    //
    const newU = {
      //
      id: createId(),
      pbxTenant: tenant,
      pbxUsername: user,
      //
      pbxHostname: host,
      pbxPort: port,
      pbxPassword: '',
      pbxTurnEnabled: false,
      parks: [],
      ucEnabled: false,
      ucHostname: '',
      ucPort: '',
      //
      accessToken: _wn,
    };
    //
    this.props.createProfile(newU);
    if (newU.accessToken) {
      this.signin(newU.id);
    } else {
      routerUtils.goToProfileUpdate(newU.id);
    }
  };

  _getUidByCustomNotif(notif) {
    const nPbxTenant = notif.tenant;
    const nPbxUsername = notif.to;
    const nPbxPort = notif.pbxPort;
    const nPbxHostname = notif.pbxHostname;

    const nIsPbxUsernameEmpty = !nPbxUsername || nPbxUsername.length === 0;
    const nIsPbxTenantEmpty = !nPbxTenant || nPbxTenant.length === 0;
    const nIsPbxPortEmpty = !nPbxPort || nPbxPort.length === 0;
    const nIsPbxHostnameEmpty = !nPbxHostname || nPbxHostname.length === 0;

    const profiles = this.props.profileById;
    const uids = Object.keys(profiles);
    for (let i = 0; i < uids.length; i++) {
      const uid = uids[i];
      const profile = profiles[uid];
      const pPbxUsername = profile.pbxUsername;

      if (!nIsPbxUsernameEmpty) {
        if (nPbxUsername !== pPbxUsername) {
          continue;
        }
      }

      const pPbxTenant = profile.pbxTenant;
      if (!nIsPbxTenantEmpty) {
        if (nPbxTenant !== pPbxTenant) {
          continue;
        }
      }

      const pPbxHostname = profile.pbxHostname;
      if (!nIsPbxHostnameEmpty) {
        if (nPbxHostname !== pPbxHostname) {
          continue;
        }
      }

      const pPbxPort = profile.pbxPort;
      if (!nIsPbxPortEmpty) {
        if (nPbxPort !== pPbxPort) {
          continue;
        }
      }

      return uid;
    }

    return null;
  }

  _signinByNotif(customNotif) {
    const uid = this._getUidByCustomNotif(customNotif);
    if (!uid) {
      return;
    }
    this.signin(uid);
  }

  render() {
    if (!this.state || this.state.isReady !== true) {
      return <Text />;
    }

    return (
      <UI
        profileIds={this.props.profileIds}
        resolveProfile={this.resolveProfile}
        create={routerUtils.goToProfilesCreate}
        update={routerUtils.goToProfileUpdate}
        signin={this.signin}
        remove={this.props.removeProfile}
      />
    );
  }

  resolveProfile = id => this.props.profileById[id];

  signin = id => {
    let profile = this.resolveProfile(id);
    this.props.setAuthProfile(profile);
    routerUtils.goToAuth();
  };
}

export default createModelView(mapGetter, mapAction)(View);
