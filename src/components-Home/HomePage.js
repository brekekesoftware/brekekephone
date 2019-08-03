import { Container } from 'native-base';
import React from 'react';

import PageRecents from '../components-Recents/PageRecents';
import FooterTabs from './FooterTabs';
import Headers from './Header';

class HomePage extends React.Component {
  render() {
    return (
      <Container>
        <Headers title="Contacts" />
        <PageRecents />
        <FooterTabs />
      </Container>
    );
  }
}

export default HomePage;
