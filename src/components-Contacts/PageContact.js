import { Container, Content, Tab, TabHeading, Tabs, Text } from 'native-base';
import React from 'react';

import Hearders from '../components-Home/Header';
import TabUsers from './TabUsers';

class PageContacts extends React.Component {
  render() {
    return (
      <Container>
        <Hearders title="Contacts" />
        <Content>
          <Tabs>
            <Tab
              heading={
                <TabHeading>
                  <Text>USERS</Text>
                </TabHeading>
              }
            >
              <TabUsers {...this.props} />
            </Tab>
            <Tab
              heading={
                <TabHeading>
                  <Text>PHONEBOOK</Text>
                </TabHeading>
              }
            />
          </Tabs>
        </Content>
      </Container>
    );
  }
}

export default PageContacts;
