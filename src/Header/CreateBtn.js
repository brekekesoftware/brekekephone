import { mdiPlus } from '@mdi/js';
import React from 'react';

import g from '../global';
import { StyleSheet, TouchableOpacity } from '../native/Rn';
import Icon from '../shared/Icon';

const css = StyleSheet.create({
  CreateBtn: {
    position: `absolute`,
    top: 11,
    right: 5,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: g.colors.primary,
  },
  CreateBtn__white: {
    backgroundColor: g.bg,
  },
});

const CreateBtn = ({ onPress, white }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[css.CreateBtn, white && css.CreateBtn__white]}
  >
    <Icon color={white ? `black` : `white`} path={mdiPlus} />
  </TouchableOpacity>
);

export default CreateBtn;
