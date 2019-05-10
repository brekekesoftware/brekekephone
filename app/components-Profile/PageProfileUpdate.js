import React from 'react';

import Main from '../components-shared/Main';
import ProfileForm from './ProfileForm';

class PageProfileUpdate extends React.Component {
  render() {
    return (
      <Main title="Edit Server" onBack={true} onReset={true}>
        <ProfileForm />
      </Main>
    );
  }
}

export default PageProfileUpdate;
