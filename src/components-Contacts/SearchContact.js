import { Button, Header, Input, Item, Text } from 'native-base';
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import { std } from '../styleguide';

const st = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: std.color.shade2,
    padding: std.gap.lg,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    paddingVertical: 0,
    paddingHorizontal: std.gap.lg,
    height: std.textSize.md + std.gap.lg * 2,
    color: std.color.shade9,
    textAlign: 'left',
    backgroundColor: std.color.shade0,
    borderRadius: std.gap.sm,
  },
});

const pure = Component =>
  class extends PureComponent {
    render = () => <Component {...this.props} />;
  };

const SearchContact = pure(p => (
  <Header style={st.search} searchBar>
    <Item>
      <Input
        style={st.searchInput}
        placeholder="Search name, phone number..."
        value={p.value}
        onChangeText={p.setValue}
      />
      {!!p.value && (
        <Button style={st.searchClear} onPress={() => p.setValue('')}>
          <Text style={st.optIcon}>icon_x_circle</Text>
        </Button>
      )}
    </Item>
  </Header>
));

export default SearchContact;
