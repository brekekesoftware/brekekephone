import { Container } from 'native-base';
import React from 'react';

import Main from '../components-shared/Main';
import ProfileForm from './ProfileForm';

class PageProfileCreate extends React.Component {
  render() {
    return (
      <Main title="Create Server" onBack={true} onReset={true}>
        <ProfileForm />
      </Main>
    );
  }
}

export default PageProfileCreate;
