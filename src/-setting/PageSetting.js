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
      // authStore.upsertProfile(p);
      // showPromptUpProfile(p);
      g.showPrompt({
        title: `Save Profile`,
        message:
          'Do you want to update your profile,\n you need to sign out and then sign in again?',
        onConfirm: () => {
          authStore.upsertProfile(p);
          g.goToProfileSignIn();
        },
        confirmText: 'SAVE',
      });
    }}
  />
));

export default PageSetting;
