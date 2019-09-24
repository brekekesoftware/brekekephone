import { observer } from 'mobx-react';
import React from 'react';

import authStore from '../-/authStore';
import ProfileCreateForm from '../-profile/ProfileCreateForm';
import g from '../global';

const PageProfileCurrent = observer(p => (
  <ProfileCreateForm
    isUpdate
    title="Current Server"
    updatingProfile={authStore.profile}
    onBackBtnPress={g.backToContactsBrowse}
    onSaveBtnPress={(p, hasUnsavedChanges) => {
      if (!hasUnsavedChanges) {
        g.backToContactsBrowse();
      }
      g.showPrompt({
        title: `Save Server`,
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

export default PageProfileCurrent;
