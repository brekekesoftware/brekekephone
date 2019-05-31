import React, { Component } from 'react';
import { Container, Header, Tab, Tabs, TabHeading, Icon, Text } from 'native-base';
import TabPhoneBook from './TabPhoneBook';
import TabUsers from './TabUsers';

class PageContact extends Component {
	render() {
		return (
      <Tabs>
        <Tab heading={<TabHeading><Text>PHONEBOOK</Text></TabHeading>}>
        	<TabPhoneBook/>
        </Tab>
        <Tab heading={ <TabHeading><Text>USERS</Text></TabHeading>}>
          <TabUsers/>
        </Tab>
      </Tabs>
		)
	}
}

export default PageContact;
