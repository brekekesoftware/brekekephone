import { Button, Container, Content, Form, Text } from 'native-base';
import React, { Component } from 'react';

import { TextInput } from '../components-shared/Input';

class NewCallPark extends Component {
  render() {
    return (
      <Container>
        <Content>
          <Form>
            <TextInput label="PARK NAME" placeholder="Enter park name" />
            <TextInput label="EXTENSION" placeholder="Enter extension" />
          </Form>
          <Button full disabled success>
            <Text>SAVE</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}

export default NewCallPark;
