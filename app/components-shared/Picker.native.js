import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ModalPicker from 'react-native-modal-picker';
import { std } from '../styleguide';
import { st } from './Input';

const Picker = p => (
  // https://github.com/peacechen/react-native-modal-selector
  <ModalPicker
    data={p.options.map(o => ({
      key: o.value,
      label: o.label,
    }))}
    onChange={o => p.onChange(o.key)}
  >
    <View>
      <Text style={st.input}>
        {(p.options.find(o => o.value === p.value) || {}).label}
      </Text>
    </View>
  </ModalPicker>
);

p.propTypes = {
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Picker;
