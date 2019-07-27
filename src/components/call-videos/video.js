import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { RTCView } from 'react-native-webrtc';

const st = StyleSheet.create({
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default p =>
  p.sourceObject ? (
    <RTCView style={st.video} streamURL={p.sourceObject.toURL()} />
  ) : (
    <ActivityIndicator />
  );
