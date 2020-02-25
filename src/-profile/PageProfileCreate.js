import React from 'react';

import g from '../global';
import intl from '../intl/intl';
import ProfileCreateForm from './ProfileCreateForm';

const PageProfileCreate = () => (
  <ProfileCreateForm
    onBack={g.backToPageProfileSignIn}
    onSave={p => {
      g.upsertProfile(p);
      g.backToPageProfileSignIn();
    }}
    title={intl`New Account`}
  />
);

export default PageProfileCreate;
