import { Container, Content } from 'native-base';
import React from 'react';

import PageContact from '../components-Contacts/PageContact';
import PageRecents from '../components-Recents/PageRecents';
import FooterTabs from './FooterTabs';
import Headers from './Header';

class HomePage extends React.Component {
  render() {
    return (
      <Container>
        <Headers title="Contact" />
        <PageContact />
        <FooterTabs />
      </Container>
    );
  }
}

export default HomePage;
