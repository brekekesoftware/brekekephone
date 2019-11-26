import { observer } from 'mobx-react';
import React from 'react';

import authStore from '../-/authStore';
import AuthPBX from '../-/components/AuthPBX';
import AuthSIP from '../-/components/AuthSIP';
import AuthUC from '../-/components/AuthUC';
import CallVideos from '../-/components/CallVideos';
import CallVoices from '../-/components/CallVoices';
import Callbar from '../-incoming/CallBar';
import CallNotify from '../-notify/CallNotify';
import ChatGroupInvite from '../-notify/ChatGroupInvite';

const RootAuth = observer(() => {
  if (!authStore.signedInId) {
    return null;
  }
  return (
    <React.Fragment>
      <AuthPBX />
      <AuthSIP />
      <AuthUC />
      <CallNotify />
      <CallVideos />
      <CallVoices />
      <ChatGroupInvite />
      <Callbar />
    </React.Fragment>
  );
});

export default RootAuth;
