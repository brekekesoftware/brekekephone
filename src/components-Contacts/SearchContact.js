import { mdiClose } from '@mdi/js';
import { Button, Header, Input, Item } from 'native-base';
import React from 'react';

import SvgIcon from '../shared/SvgIcon';

class SearchContact extends React.Component {
  render() {
    const p = this.props;
    return (
      <Header search searchBar>
        <Item>
          <Input
            placeholder="Search name, phone number..."
            value={p.value}
            onChangeText={p.setValue}
          />
          {!!p.value && (
            <Button transparent onPress={() => p.setValue('')}>
              <SvgIcon path={mdiClose} width="18" height="18" />
            </Button>
          )}
        </Item>
      </Header>
    );
  }
}

export default SearchContact;
