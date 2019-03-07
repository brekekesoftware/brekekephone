import React from 'react';
import { View, TouchableOpacity as Btn, Text } from 'react-native';
import { st } from '../pbx-auth/ui';

const UC_CONNECT_STATES = {
  NONE: 0,
  CONNECTING: 1,
  CONNECTED: 2,
  CONNECT_FAILED: 3,
};

const UCAuth = p => (
  <View style={st.main}>
    {p.connectState === UC_CONNECT_STATES.CONNECTING && (
      <Text style={st.message}>CONNECTING TO UC</Text>
    )}
    {p.connectState === UC_CONNECT_STATES.CONNECT_FAILED && (
      <Text style={st.message}>CONNECTING FAILED</Text>
    )}
    <View style={st.buttons}>
      {p.connectState === UC_CONNECT_STATES.CONNECT_FAILED && (
        <Btn style={st.retry} onPress={p.retry}>
          <Text style={st.retryText}>Retry</Text>
        </Btn>
      )}
      <Btn style={st.abort} onPress={p.abort}>
        <Text style={st.abortText}>Abort</Text>
      </Btn>
    </View>
  </View>
);

export { UC_CONNECT_STATES };
export default UCAuth;
