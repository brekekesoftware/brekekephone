import { Button, Left, ListItem, Right, Text, View } from 'native-base';
import React from 'react';

class Header extends React.Component {
  render() {
    const p = this.props;
    return (
      <View heaederServer>
        <ListItem end>
          <Right>
            {p.profileIds.length !== 0 ? (
              <Button onPress={p.create}>
                <Text>New</Text>
              </Button>
            ) : null}
          </Right>
        </ListItem>
        <ListItem start>
          <Left>
            <Text>Servers</Text>
            <Text note>{p.profileIds.length} SERVER IN TOTAL</Text>
          </Left>
        </ListItem>
      </View>
    );
  }
}

export default Header;
