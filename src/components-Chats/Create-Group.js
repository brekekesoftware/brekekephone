import { mdiPlusCircleOutline } from '@mdi/js';
import { Button, Container, Content, Form, Text, View } from 'native-base';
import React from 'react';

import Headers from '../components-Home/Header';
import { TextInput } from '../components-shared/Input';
import SvgIcon from '../components-shared/SvgIcon';

class CreateGroup extends React.Component {
  render() {
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
            <TextInput label="NEW GROUP" placeholder="Group name" />
          </Form>
          <Button full success onPress={this.save}>
            <Text>SAVE</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}

export default CreateGroup;
