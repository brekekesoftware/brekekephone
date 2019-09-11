import { observer } from 'mobx-react';
import React from 'react';

import authStore from '../---shared/authStore';
import routerStore from '../---shared/routerStore';
import ProfileCreateForm from './ProfileCreateForm';

const PageProfileUpdate = observer(p => {
  const goBack = routerStore.goBackFn(routerStore.goToPageProfileSignIn);
  return (
    <ProfileCreateForm
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

export default PageProfileUpdate;
