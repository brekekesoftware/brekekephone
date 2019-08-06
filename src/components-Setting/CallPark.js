import {
  Body,
  Button,
  Content,
  Left,
  List,
  ListItem,
  Right,
  Text,
} from 'native-base';
import React, { Component } from 'react';
import { FlatList } from 'react-native';

import Icons from '../components-shared/Icon';

const Park = p => (
  <ListItem callpark>
    <Left>
      <Text>{p.name}</Text>
      <Text note>Extension:{p.extension}</Text>
    </Left>
    <Right>
      <Button>
        <Icons name="create" />
      </Button>
    </Right>
  </ListItem>
);

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
];

class CallParkComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: data_demo,
    };
  }

  render() {
    const p = this.props;

    return (
      <Content>
        <List>
          <ListItem itemDivider>
            <Text>CALL PARK</Text>
          </ListItem>
          <FlatList
            data={this.state.data}
            renderItem={({ item: rowData }) => {
              return <Park name={rowData.name} extension={rowData.extension} />;
            }}
          />
          <ListItem>
            <Body>
              <Button full>
                <Text>NEW CALL PARK</Text>
              </Button>
            </Body>
          </ListItem>
        </List>
        <Button full iconLeft danger onPress={p.signout}>
          <Icons name="exit-to-app" />
          <Text>LOG OUT</Text>
        </Button>
      </Content>
    );
  }
}

export default CallParkComponent;
