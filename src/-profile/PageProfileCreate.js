import React from 'react';

import g from '../global';
import ProfileCreateForm from './ProfileCreateForm';

const PageProfileCreate = () => (
  <ProfileCreateForm
    title="New Server"
    onBack={g.backToPageProfileSignIn}
    onSave={p => {
      g.upsertProfile(p);
      g.backToPageProfileSignIn();
    }}
  />
);

export default PageProfileCreate;
