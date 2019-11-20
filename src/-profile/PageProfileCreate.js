import React from 'react';

import g from '../global';
import ProfileCreateForm from './ProfileCreateForm';

const PageProfileCreate = () => (
  <ProfileCreateForm
    onBack={g.backToPageProfileSignIn}
    onSave={p => {
      g.upsertProfile(p);
      g.backToPageProfileSignIn();
    }}
    title="New Server"
  />
);

export default PageProfileCreate;
