import { observer } from 'mobx-react';
import React from 'react';

import g from '../global';
import intl from '../intl/intl';
import ProfileCreateForm from './ProfileCreateForm';

const PageProfileUpdate = observer(props => (
  <ProfileCreateForm
    onBack={g.backToPageProfileSignIn}
    onSave={p => {
      g.upsertProfile(p);
      g.backToPageProfileSignIn();
    }}
    title={intl`Update Server`}
    updatingProfile={g.profilesMap[props.id]}
  />
));

export default PageProfileUpdate;
