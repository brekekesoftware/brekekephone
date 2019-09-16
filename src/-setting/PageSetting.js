import { observer } from 'mobx-react';
import React from 'react';

import authStore from '../-/authStore';
import ProfileCreateForm from '../-profile/ProfileCreateForm';
import g from '../global';

const PageSetting = observer(p => (
  <ProfileCreateForm
    isUpdate
    updateFromSetting
    updatingProfile={authStore.profile}
    onSaveBtnPress={p => {
      authStore.upsertProfile(p);
      g.goToProfileSignIn();
      setTimeout(() => {
        authStore.signIn(p.id);
      }, 300);
    }}
  />
));

export default PageSetting;
