import React from 'react';

import authStore from '../-/authStore';
import routerStore from '../-/routerStore';
import ProfileCreateForm from './ProfileCreateForm';

const PageProfileCreate = () => {
  const goBack = routerStore.goBackFn(routerStore.goToPageProfileSignIn);
  return (
    <ProfileCreateForm
      onBackBtnPress={goBack}
      onSaveBtnPress={p => {
        authStore.upsertProfile(p);
        goBack();
      }}
    />
  );
};

export default PageProfileCreate;
