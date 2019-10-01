import { observer } from 'mobx-react';
import React from 'react';

import authStore from '../-/authStore';
import ProfileCreateForm from '../-profile/ProfileCreateForm';
import g from '../global';

const PageProfileCurrent = observer(p => (
  <ProfileCreateForm
    title="Current Server"
    updatingProfile={authStore.profile}
    onBack={g.backToPageProfileSignIn}
    onSave={(p, hasUnsavedChanges) => {
      if (!hasUnsavedChanges) {
        g.backToContactsBrowse();
      }
      g.showPrompt({
        title: `Save Server`,
        message: `Do you want to update your profile,\n you need to sign out and then sign in again?`,
        onConfirm: () => {
          g.upsertProfile(p);
          g.goToPageProfileSignIn();
          setTimeout(() => authStore.signIn(p.id), 300);
        },
        confirmText: `SAVE`,
      });
    }}
  />
));

export default PageProfileCurrent;
