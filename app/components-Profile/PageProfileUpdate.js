import React from 'react';
import ProfileForm from './ProfileForm';
import Main from '../components-shared/Main';

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