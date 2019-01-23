import React from 'react';
import { RTCView } from 'react-native-webrtc';
import { StyleSheet, ActivityIndicator } from 'react-native';

const st = StyleSheet.create({
  video: { flex: 1, width: '100%', height: '100%' },
});
//const st = StyleSheet.create({video: {flex: 1}})

export default p =>
  p.sourceObject ? (
    <RTCView style={st.video} streamURL={p.sourceObject.toURL()} />
  ) : (
    <ActivityIndicator />
  );
