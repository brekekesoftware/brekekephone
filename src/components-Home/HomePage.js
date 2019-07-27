import { Container, Content } from 'native-base';
import React from 'react';

import ChatsDetail from '../components-Chats/Chat-Detail';
import ChatsHome from '../components-Chats/Chats-Home';
import PageContact from '../components-Contacts/PageContact';
import CallPark from '../components-Incoming/CallPark';
import PageCalling from '../components-Incoming/PageCalling';
import PageInComingCall from '../components-Incoming/PageInComingCall';
import PagePhoneCall from '../components-Phone/PagePhoneCall';
import PageRecents from '../components-Recents/PageRecents';
import NewCallPark from '../components-Setting/NewCallPark';
import PageSetting from '../components-Setting/PageSetting';
import FooterTabs from './FooterTabs';
import Headers from './Header';

class HomePage extends React.Component {
  render() {
    return (
      <Container>
        <ChatsDetail />
      </Container>
    );
  }
}

export default HomePage;
