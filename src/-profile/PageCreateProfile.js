import React from 'react';

import authStore from '../---shared/authStore';
import routerStore from '../---shared/routerStore';
import FormCreateProfile from './FormCreateProfile';

const PageCreateProfile = () => {
  const goBack = routerStore.goBackFn(routerStore.goToPageProfileSignIn);
  return (
    <FormCreateProfile
      onBackBtnPress={goBack}
      onSaveBtnPress={p => {
        authStore.upsertProfile(p);
        goBack();
      }}
    />
  );
};

export default PageCreateProfile;
