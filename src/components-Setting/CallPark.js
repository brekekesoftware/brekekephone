import { mdiExitToApp, mdiPencil } from '@mdi/js';
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
import React from 'react';
import { FlatList } from 'react-native';

import SvgIcon from '../components-shared/SvgIcon';

const Park = p => (
  <ListItem callpark>
    <Left>
      <Text>{p.name}</Text>
      <Text note>Extension:{p.extension}</Text>
    </Left>
    <Right>
      <Button>
        <SvgIcon path={mdiPencil} />
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

class CallParkComponent extends React.Component {
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
          <SvgIcon path={mdiExitToApp} />
          <Text>LOG OUT</Text>
        </Button>
      </Content>
    );
  }
}

export default CallParkComponent;
