import { Container } from 'native-base';
import React from 'react';

import PageContact from '../components-Contacts/PageContact';
import Headers from './Header';
import FooterTabs from './FooterTabs';
import PageRecents from '../components-Recents/PageRecents';


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
