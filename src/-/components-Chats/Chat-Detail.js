import { Container } from 'native-base';
import React from 'react';

import ChatMessages from './Chat-Messages';
import FooterChats from './Footer-Chats';
import HeaderChat from './Header-Chat';

class ChatsDetail extends React.Component {
  render() {
    const p = this.props;
    return (
      <Container>
        <HeaderChat
          ibuddyName={p.buddyName}
          buddyId={p.buddyId}
          resolve={p.resolveChat}
          back={p.back}
          resolveCreator={p.resolveCreator}
        />
        <ChatMessages
          hasMore={p.hasMore}
          loadingMore={p.loadingMore}
          ids={p.chatIds}
          resolve={p.resolveChat}
          loadMore={p.loadMore}
          acceptFile={p.acceptFile}
          rejectFile={p.rejectFile}
        />
        <FooterChats
          text={p.editingText}
          setText={p.setEditingText}
          submitText={p.submitEditingText}
          pickFile={p.pickFile}
        />
      </Container>
    );
  }
}

export default ChatsDetail;
