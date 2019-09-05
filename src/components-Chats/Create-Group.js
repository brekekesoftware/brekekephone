import { mdiPlusCircleOutline } from '@mdi/js';
import {
  Body,
  Button,
  Container,
  Content,
  Form,
  Left,
  ListItem,
  Text,
  View,
} from 'native-base';
import React from 'react';

import Headers from '../components-Home/Header';
import Avatar from '../components-shared/Avatar';
import { TextInput } from '../components-shared/Input';
import SvgIcon from '../shared/SvgIcon';

const User = p => (
  <ListItem listChat onPress={p.toggle}>
    <Left>
      <Avatar source={p.avatar} status={p.status} />
    </Left>
    <Body>
      {(() => {
        if (p.name) {
          return <Text>{p.name}</Text>;
        } else {
          return <Text>{p.id}</Text>;
        }
      })()}
    </Body>
  </ListItem>
);

class CreateGroup extends React.Component {
  render() {
    const p = this.props;
    return (
      <Container>
        <Headers title="New Group" />
        <Content>
          <View center>
            <Button>
              <SvgIcon width="50" height="50" path={mdiPlusCircleOutline} />
            </Button>
          </View>
          <Form>
            <TextInput
              label="NEW GROUP"
              placeholder="Group name"
              value={p.name}
              onChange={p.setName}
            />
          </Form>
          <Button full success onPress={p.create}>
            <Text>SAVE</Text>
          </Button>
          <Text>Members</Text>
          {p.buddyIds.map(id => (
            <User
              key={id}
              {...p.buddyById[id]}
              selected={p.members.includes(id)}
              toggle={() => p.toggleBuddy(id)}
            />
          ))}
        </Content>
      </Container>
    );
  }
}

export default CreateGroup;
