import React from 'react';

import g from '../global';
import Layout from '../shared/Layout';
import Message from './Message';

class ChatDetail extends React.Component {
  render() {
    return (
      <Layout
        header={{
          onBackBtnPress: g.goToChatsRecent,
          title: 'Alan Walker',
        }}
      >
        <Message />
      </Layout>
    );
  }
}

export default ChatDetail;
