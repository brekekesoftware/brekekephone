import React from 'react';
import FooterTabs from './FooterTabs';
import { Container, Content } from 'native-base';
import PageContact from '../components-Contacts/PageContact';
import Headers from './Header';
import PageRecents from '../components-Recents/PageRecents';
import PageSetting from '../components-Setting/PageSetting';
import NewCallPark from '../components-Setting/NewCallPark';
import PagePhoneCall from '../components-Phone/PagePhoneCall';
import PageCalling from '../components-Incoming/PageCalling';
import PageInComingCall from '../components-Incoming/PageInComingCall';
import CallPark from '../components-Incoming/CallPark';
import ChatsHome from '../components-Chats/Chats-Home';
import ChatsDetail from '../components-Chats/Chat-Detail';

class HomePage extends React.Component {
  render() {
    return (
    	<Container>
    		
    		<ChatsDetail/>
    		
      </Container>
    );
  }
}

export default HomePage;
