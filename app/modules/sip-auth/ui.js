import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity as Button,
  Text,
} from 'react-native';
import { std, rem } from '../styleguide';
import { st } from '../pbx-auth/ui';

const SIPAuth = p => (
  <View style={st.main}>
    {p.failure || <Text style={st.message}>CONNECTING TO SIP</Text>}
    {p.failure && <Text style={st.message}>CONNECTING FAILED</Text>}
    <View style={st.buttons}>
      {p.failure && p.retryable && (
        <Button style={st.retry} onPress={p.retry}>
          <Text style={st.retryText}>Retry</Text>
        </Button>
      )}
      <Button style={st.abort} onPress={p.abort}>
        <Text style={st.abortText}>Abort</Text>
      </Button>
    </View>
  </View>
);

export default SIPAuth;
