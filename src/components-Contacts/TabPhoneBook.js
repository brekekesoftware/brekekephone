import React, { Component } from 'react';
import { Container, Content, List, ListItem, Left, Body, Right, Thumbnail, Text, Icon, Button, Fab } from 'native-base';
import { FlatList, StyleSheet} from 'react-native';
import SearchContact from './SearchContact';



const st = StyleSheet.create({
  navright:{
    flexDirection: 'row',
  },
  btnFab:{
    backgroundColor: '#74bf53',
  }
})


const User = p => (
  <ListItem thumbnail>
    <Left>
      <Thumbnail source={{ uri: 'https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg' }} />
    </Left>
    <Body>
      <Text>Aong Bao</Text>
      <Text note="true">Phonebook Name</Text>
    </Body>
    <Right style={st.navright}>
      <Button transparent dark>
        <Icon name="call" type="MaterialIcons"/>
      </Button>
      <Button transparent dark>
        <Icon name="info" type="MaterialIcons"/>
      </Button>                     
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

class TabPhoneBook extends Component {
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
            <ListItem itemDivider>
              <Text>A</Text>
            </ListItem>         
            <FlatList
              data={this.state.data}
              renderItem={({ item: rowData }) => {
                return <User />;
              }}
            />
            <ListItem itemDivider>
              <Text>B</Text>
            </ListItem>         
            <FlatList
              data={this.state.data}
              renderItem={({ item: rowData }) => {
                return <User />;
              }}
            />
          </List>
        </Content>
        <Fab
          style={st.btnFab}
        >
          <Icon name="add" type="MaterialIcons"/> 
        </Fab>
      </Container>
    );
  }
}

export default TabPhoneBook;

