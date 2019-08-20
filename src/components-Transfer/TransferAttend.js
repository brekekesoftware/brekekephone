import {
  Button,
  Container,
  Content,
  H2,
  Header,
  Icon,
  Left,
  Text,
  Thumbnail,
  View,
} from 'native-base';
import React from 'react';

class TransferAttend extends React.Component {
  render() {
    return (
      <Container>
        <Header transparent>
          <Left>
            <Button>
              <Icon type="MaterialIcons" name="arrow-back" />
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
              <Icon type="MaterialIcons" name="arrow-forward" />
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
