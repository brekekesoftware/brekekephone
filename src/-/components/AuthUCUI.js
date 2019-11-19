import React from 'react';
import { Text, TouchableOpacity as Btn, View } from 'react-native';

import { st } from './AuthPBXUI';

const UCAuth = p => (
  <View style={st.main}>
    {p.didPleonasticLogin && (
      <Text style={st.message}>UC SIGNED IN AT ANOTHER LOCATION</Text>
    )}
    {!p.didPleonasticLogin && !p.failure && (
      <Text style={st.message}>CONNECTING TO UC</Text>
    )}
    {!p.didPleonasticLogin && p.failure && (
      <Text style={st.message}>UC CONNECTION FAILED</Text>
    )}
    <View style={st.buttons}>
      {(p.didPleonasticLogin || p.failure) && (
        <Btn onPress={p.retry} style={st.retry}>
          <Text style={st.retryText}>Retry</Text>
        </Btn>
      )}
      <Btn onPress={p.abort} style={st.abort}>
        <Text style={st.abortText}>Abort</Text>
      </Btn>
    </View>
  </View>
);

export default UCAuth;
