import { createApi, createStore } from 'effector';

const pbxStore = createStore({
  //
});

const pbxStoreActions = createApi(pbxStore, {
  pbxOnClose: () => {
    //
  },
  pbxOnError: err => {
    //
  },
  pbxOnServerStatus: e => {
    //
  },
  pbxOnUserStatus: e => {
    //
  },
  pbxOnPark: e => {
    //
  },
  pbxOnVoiceMail: e => {
    //
  },
});

const pbx = null; // TODO

// Attach the handlers
pbx.onClose = pbxStoreActions.pbxOnClose;
pbx.onError = pbxStoreActions.pbxOnError;
pbx.notify_serverstatus = pbxStoreActions.pbxOnServerStatus;
pbx.notify_status = pbxStoreActions.pbxOnUserStatus;
pbx.notify_park = pbxStoreActions.pbxOnPark;
pbx.notify_voicemail = pbxStoreActions.pbxOnVoiceMail;
