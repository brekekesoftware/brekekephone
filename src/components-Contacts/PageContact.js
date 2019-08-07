import {
  Container,
  Content,
  Tab,
  TabHeading,
  Tabs,
  Text,
} from 'native-base';
import React, { Component } from 'react';

import Hearders from '../components-Home/Header';
import TabPhoneBook from './TabPhoneBook';
import TabUsers from './TabUsers';

class PageContact extends Component {
  render() {
    return (
      <Container>
        <Hearders title="Contact" />
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
            >
              <TabPhoneBook />
            </Tab>
          </Tabs>
        </Content>
      </Container>
    );
  }
}

export default PageContact;
