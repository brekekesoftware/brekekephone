import { observer } from 'mobx-react';
import React from 'react';

import authStore from '../-/authStore';
import ProfileCreateForm from '../-profile/ProfileCreateForm';
import g from '../global';

const PageSetting = observer(p => (
  <ProfileCreateForm
    isUpdate
    isUpdateFromSetting
    updatingProfile={authStore.profile}
    onBackBtnPress={g.backToContactPage}
    onSaveBtnPress={(p, hasUnsavedChanges) => {
      if (!hasUnsavedChanges) {
        g.backToContactPage();
      }
      g.showPrompt({
        title: `Save Profile`,
        message:
          'Do you want to update your profile,\n you need to sign out and then sign in again?',
        onConfirm: () => {
          authStore.upsertProfile(p);
          g.goToProfileSignIn();
          setTimeout(() => authStore.signIn(p.id), 300);
        },
        confirmText: 'SAVE',
      });
    }}
  />
));

export default PageSetting;
