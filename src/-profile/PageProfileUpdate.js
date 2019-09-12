import { observer } from 'mobx-react';
import React from 'react';

import authStore from '../-/authStore';
import g from '../global';
import ProfileCreateForm from './ProfileCreateForm';

const PageProfileUpdate = observer(p => (
  <ProfileCreateForm
    isUpdate
    updatingProfile={authStore.getProfile(p.match.params.id)}
    onBackBtnPress={g.backToProfileSignIn}
    onSaveBtnPress={p => {
      authStore.upsertProfile(p);
      g.backToProfileSignIn();
    }}
  />
));

export default PageProfileUpdate;
