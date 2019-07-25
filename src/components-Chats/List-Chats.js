import React, { Component } from 'react';
import { Container, Content, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
import { FlatList, StyleSheet} from 'react-native';
import SearchContact from '../components-Contacts/SearchContact';



const st = StyleSheet.create({
  navright:{
    flexDirection: 'row',
  },
  btnFab:{
    backgroundColor: '#74bf53',
  }
})


const User = p => (
  <ListItem onPress={() => ""} thumbnail>
    <Left>
      <Thumbnail source={{ uri: 'https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg' }} />
    </Left>
    <Body>
      <Text>Aerald Richards</Text>
      <Text note>Tell me more about…</Text>
    </Body>
    <Right style={st.navright}>
      <Text note>05/07/2019</Text>                    
    </Right>
  </ListItem> 
)

let data_demo = [
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

class ListChats extends Component {
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
                return <User />;
              }}
            />   
            <FlatList
              data={this.state.data}
              renderItem={({ item: rowData }) => {
                return <User />;
              }}
            />
          </List>
        </Content>
      </Container>
    );
  }
}

export default ListChats;

