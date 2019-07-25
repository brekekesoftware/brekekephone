import React, { Component } from 'react';
import { ListItem, Content, Left, Button, Body, Right, Text, List  } from 'native-base';
import {FlatList} from 'react-native';


const Park = p => (
  <List>
    <ListItem>
      <Left>
        <Body>
          <Text>{p.name}</Text>
          <Text note>Extension: {p.extension}</Text>
        </Body>
      </Left>
      <Right>
        <Button success>
          <Text>PARK</Text>
        </Button>
      </Right>
    </ListItem>
  </List>
)

let data_demo = [
  {
    name: 'Park 1',
    extension: '*827',
  },
  {
    name: 'Park 2',
    extension: '*714',
  },
  {
    name: 'Park 3',
    extension: '*615',
  },
  {
    name: 'Park 4',
    extension: '*891',
  },
]

class CallPark extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: data_demo,
    };
  }


	render() {
		return (
      <Content>
        <List>       
          <FlatList
            data={this.state.data}
            renderItem={({ item: rowData }) => {
              return <Park name={rowData.name} extension={rowData.extension} />;
            }}
          />
        </List>
     </Content>
		)
	}
}

export default CallPark;
