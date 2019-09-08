import { observer } from 'mobx-react';
import React from 'react';

import FormCreateProfile from '../PageCreateProfile/FormCreateProfile';
import authStore from '../shared/authStore';

const PageUpdateProfile = observer(p => (
  <FormCreateProfile
    isUpdate
    updatingProfile={authStore.getProfile(p.match.params.id)}
  />
));

export default PageUpdateProfile;
