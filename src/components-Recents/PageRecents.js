import { Container, Content } from 'native-base';
import React from 'react';

import SearchContact from '../components-Contacts/SearchContact';
import Headers from '../components-Home/Header';
import Users from './Users';

class PageRecents extends React.Component {
  render() {
    const p = this.props;
    return (
      <Container>
        <Headers title="Recent" />
        <SearchContact />
        <Content>
          {p.callIds.map(id => (
            <Users
              key={id}
              {...p.resolveCall(id)}
              resolveUser={p.resolveUser}
              callBack={() => p.callBack(id)}
              remove={() => p.removeCall(id)}
            />
          ))}
        </Content>
      </Container>
    );
  }
}

export default PageRecents;
