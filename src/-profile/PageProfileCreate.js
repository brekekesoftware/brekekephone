import React from 'react';

import authStore from '../-/authStore';
import g from '../global';
import ProfileCreateForm from './ProfileCreateForm';

const PageProfileCreate = () => (
  <ProfileCreateForm
    onBackBtnPress={g.backToProfileSignIn}
    onSaveBtnPress={p => {
      authStore.upsertProfile(p);
      g.backToProfileSignIn();
    }}
  />
);

export default PageProfileCreate;
