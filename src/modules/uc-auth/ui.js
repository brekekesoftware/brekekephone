import React from 'react';
import { Text, TouchableOpacity as Btn, View } from 'react-native';

import { st } from '../pbx-auth/ui';

const UC_CONNECT_STATES = {
  NONE: 0,
  CONNECTING: 1,
  CONNECTED: 2,
  CONNECT_FAILED: 3,
};

const UCAuth = p => (
  <View style={st.main}>
    {p.didPleonasticLogin && (
      <Text style={st.message}>UC SIGNED IN AT ANOTHER LOCATION</Text>
    )}
    {!p.didPleonasticLogin &&
      p.connectState === UC_CONNECT_STATES.CONNECTING && (
        <Text style={st.message}>CONNECTING TO UC</Text>
      )}
    {!p.didPleonasticLogin &&
      p.connectState === UC_CONNECT_STATES.CONNECT_FAILED && (
        <Text style={st.message}>UC CONNECTION FAILED</Text>
      )}
    <View style={st.buttons}>
      {(p.didPleonasticLogin ||
        p.connectState === UC_CONNECT_STATES.CONNECT_FAILED) && (
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
