import React from 'react';
import { Text, TouchableOpacity as Btn, View } from 'react-native';

import { st } from './AuthPBXUI';

const SIPAuth = p => (
  <View style={st.main}>
    {p.failure || <Text style={st.message}>CONNECTING TO SIP</Text>}
    {p.failure && <Text style={st.message}>SIP CONNECTION FAILED</Text>}
    <View style={st.buttons}>
      {p.failure && p.retryable && (
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

export default SIPAuth;
