import orderBy from 'lodash/orderBy';
import {
  Body,
  Button,
  Container,
  Content,
  H2,
  Header,
  Left,
  ListItem,
  Right,
  Text,
  Thumbnail,
  View,
} from 'native-base';
import React from 'react';

import Icons from '../components-shared/Icon';

class TransferAttend extends React.Component {
  render() {
    const p = this.props;
    return (
      <Container>
        <Header transparent>
          <Left>
            <Button>
              <Icons name="arrow-back" />
            </Button>
          </Left>
        </Header>
        <Content>
          <Left leftpd18>
            <H2>Duan Huynh</H2>
          </Left>
          <View av_transfer>
            <View center>
              <Thumbnail
                source={{
                  uri:
                    'https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg',
                }}
              />
              <Text>From</Text>
              <H2>Duan Huynh</H2>
            </View>
            <View center>
              <Icons name="arrow-forward" />
            </View>
            <View center>
              <Thumbnail
                source={{
                  uri:
                    'https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg',
                }}
              />
              <Text>To</Text>
              <H2>Huynh Duan</H2>
            </View>
          </View>
        </Content>
      </Container>
    );
  }
}

export default TransferAttend;
