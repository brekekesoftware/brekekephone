import {
  Tab,
  TabHeading,
  Tabs,
  Text,
} from 'native-base';
import React, { Component } from 'react';

import TabPhoneBook from './TabPhoneBook';
import TabUsers from './TabUsers';

class PageContact extends Component {
  render() {
    return (
      <Tabs>
        <Tab
          heading={
            <TabHeading>
              <Text>PHONEBOOK</Text>
            </TabHeading>
          }
        >
          <TabPhoneBook />
        </Tab>
        <Tab
          heading={
            <TabHeading>
              <Text>USERS</Text>
            </TabHeading>
          }
        >
          <TabUsers />
        </Tab>
      </Tabs>
    );
  }
}

export default PageContact;
