import React from 'react';
import FooterTabs from './FooterTabs';
import { Container, Content } from 'native-base';
import PageContact from '../components-Contacts/PageContact';
import Headers from './Header';
import PageRecents from '../components-Recents/PageRecents';

class HomePage extends React.Component {
  render() {
    return (
    	<Container>
    		<Headers title='Contact'/>
    		<PageContact/>
      	<FooterTabs/>
      </Container>
    );
  }
}

export default HomePage;
