import { observer } from 'mobx-react';
import React from 'react';

import g from '../global';
import ProfileCreateForm from './ProfileCreateForm';

const PageProfileUpdate = observer(props => (
  <ProfileCreateForm
    title="Update Server"
    updatingProfile={g.profilesMap[props.id]}
    onBack={g.backToPageProfileSignIn}
    onSave={p => {
      g.upsertProfile(p);
      g.backToPageProfileSignIn();
    }}
  />
));

export default PageProfileUpdate;
