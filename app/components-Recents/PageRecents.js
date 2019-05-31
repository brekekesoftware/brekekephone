import React, { Component } from 'react';
import { Container, Header, Tab, Tabs, TabHeading, Icon, Text, Content, List } from 'native-base';
import {FlatList} from 'react-native';
import SearchContact from '../components-Contacts/SearchContact';
import Users from './Users';

data_demo = [
  {
    imageUrl: 'http://via.placeholder.com/160x160',
    title: 'something',
  },
  {
    imageUrl: 'http://via.placeholder.com/160x160',
    title: 'something two',
  },
  {
    imageUrl: 'http://via.placeholder.com/160x160',
    title: 'something',
  },
  {
    imageUrl: 'http://via.placeholder.com/160x160',
    title: 'something two',
  },
]




class PageRecents extends Component {
	constructor(props) {
    super(props);
    this.state = {
      data: data_demo,
    };
  }

  render() {
		return (
      <Container>
        <Content>
          <SearchContact/>
          <List>       
            <FlatList
              data={this.state.data}
              renderItem={({ item: rowData }) => {
                return <Users />;
              }}
            />
          </List>
        </Content>
      </Container>
		)
	}
}

export default PageRecents;



