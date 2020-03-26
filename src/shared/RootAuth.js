import { observer } from 'mobx-react';
import React from 'react';

import CallBar from '../-call/CallBar';
import CallNotify from '../-call/CallNotify';
import ChatGroupInvite from '../-chat/ChatGroupInvite';
import authStore from '../global/authStore';
import AuthPBX from '../shared/AuthPBX';
import AuthSIP from '../shared/AuthSIP';
import AuthUC from '../shared/AuthUC';
import CallVideos from '../shared/CallVideos';
import CallVoices from '../shared/CallVoices';

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
      <CallBar />
      <CallVideos />
      <CallVoices />
      <ChatGroupInvite />
    </React.Fragment>
  );
});

export default RootAuth;
