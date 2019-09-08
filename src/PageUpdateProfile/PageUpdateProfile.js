import { observer } from 'mobx-react';
import React from 'react';

import FormCreateProfile from '../PageCreateProfile/FormCreateProfile';
import authStore from '../shared/authStore';
import routerStore from '../shared/routerStore';

const PageUpdateProfile = observer(p => {
  const goBack = routerStore.goBackFn(routerStore.goToPageSignIn);
  return (
    <FormCreateProfile
      isUpdate
      updatingProfile={authStore.getProfile(p.match.params.id)}
      onBackBtnPress={goBack}
      onSaveBtnPress={p => {
        authStore.upsertProfile(p);
        goBack();
      }}
    />
  );
});

export default PageUpdateProfile;
