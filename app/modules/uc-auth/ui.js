import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity as Button,
  Text,
} from 'react-native';
import { std, rem } from '../styleguide';
import { UC_CONNECT_STATES } from './uc-connect-state';
import { st } from '../pbx-auth/ui';

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

export default UCAuth;
