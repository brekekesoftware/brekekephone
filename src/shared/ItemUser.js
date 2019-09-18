import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text, TouchableOpacity } from '../native/Rn';
import v from '../variables';
import Avatar from './Avatar';
import Icon from './Icon';

const s = StyleSheet.create({
  Item: {
    borderBottomWidth: 1,
    borderColor: v.borderBg,
    height: 80,
    alignItems: 'stretch',
  },
  Item__last: {
    borderBottomWidth: 0,
  },
  Item_Name: {
    position: 'absolute',
    top: 20,
    left: 70,
    fontSize: v.fontSizeSubTitle,
    color: v.subColor,
  },
  Item_Icon: {
    position: 'absolute',
    flexDirection: 'row',
    top: 20,
    right: 15,
  },
  Item_Icon__pd: {
    paddingLeft: 20,
  },
});

const renderItem = p => (
  <View>
    <View style={[s.Item, p.last && s.Item__last]}>
      <View>
        <Avatar source={{ uri: p.avatar }} />
      </View>
      <Text style={s.Item_Name}>{p.name}</Text>
    </View>
    <View style={s.Item_Icon}>
      {p.icon &&
        p.icon.map((v, i) => (
          <TouchableOpacity onPress={p.function[i]}>
            <Icon path={v} style={s.Item_Icon__pd} />
          </TouchableOpacity>
        ))}
    </View>
  </View>
);

const Item = p => {
  return renderItem({
    ...p,
  });
};

export default Item;
