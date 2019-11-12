import 'brekekejs/lib/jsonrpc';
import 'brekekejs/lib/pal';

import { createApi, createStore } from 'effector';

export const store = createStore({
  //
});

const actions = createApi(store, {
  palOnClose: s => {
    //
  },
  palOnError: (s, err) => {
    //
  },
  palOnServerStatus: (s, ev) => {
    //
  },
  palOnUserStatus: (s, ev) => {
    //
  },
  palOnPark: (s, ev) => {
    //
  },
  palOnVoiceMail: (s, ev) => {
    //
  },
});

export const login = async p => {
  const wsUri = `wss://${p.pbxHostname}:${p.pbxPort}/pbx/ws`;
  const pal = window.Brekeke.pbx.getPal(wsUri, {
    tenant: p.pbxTenant,
    login_user: p.pbxUsername,
    login_password: p.pbxPassword,
    _wn: p.accessToken,
    park: p.parks,
    voicemail: `self`,
    user: `*`,
    status: true,
    secure_login_password: false,
    phonetype: `webphone`,
  });
  // 0: release, 1: dev, 2: debug for all messages
  // process.env.NODE_ENV === `production` ? 0 : 2;
  pal.debugLevel = 0;
  //
  let timeoutId = 0;
  await Promise.race([
    new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        timeoutId = 0;
        reject(new Error(`PBX login timeout`));
        pal.close();
      }, 10000);
    }),
    new Promise((resolve, reject) => {
      pal.login(resolve, reject);
    }),
  ]);
  clearTimeout(timeoutId);
  //
  pal.onClose = actions.palOnClose;
  pal.onError = actions.palOnError;
  pal.notify_serverstatus = actions.palOnServerStatus;
  pal.notify_status = actions.palOnUserStatus;
  pal.notify_park = actions.palOnPark;
  pal.notify_voicemail = actions.palOnVoiceMail;
};
