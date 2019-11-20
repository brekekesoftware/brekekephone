import { observer } from 'mobx-react';
import React from 'react';

import g from '../global';
import ProfileCreateForm from './ProfileCreateForm';

const PageProfileUpdate = observer(props => (
  <ProfileCreateForm
    onBack={g.backToPageProfileSignIn}
    onSave={p => {
      g.upsertProfile(p);
      g.backToPageProfileSignIn();
    }}
    title="Update Server"
    updatingProfile={g.profilesMap[props.id]}
  />
));

export default PageProfileUpdate;
