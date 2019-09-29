import { mdiClose } from '@mdi/js';
import { Button, Header, Input, Item } from 'native-base';
import React from 'react';

import Icon from '../../shared/Icon';

class SearchContact extends React.Component {
  render() {
    const p = this.props;
    return (
      <Header search searchBar>
        <Item>
          <Input
            placeholder="Search name, phone number..."
            value={p.value}
            onChangeText={p.onValueChange}
          />
          {!!p.value && (
            <Button transparent onPress={() => p.onValueChange(``)}>
              <Icon path={mdiClose} width="18" height="18" />
            </Button>
          )}
        </Item>
      </Header>
    );
  }
}

export default SearchContact;
