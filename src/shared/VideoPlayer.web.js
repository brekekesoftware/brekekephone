import { observer } from 'mobx-react';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

const css = StyleSheet.create({
  loading: {
    flex: 1,
    width: `100%`,
    height: `100%`,
    padding: 50,
  },
});

export default observer(p =>
  p.sourceObject ? (
    <video
      autoPlay
      height="100%"
      ref={video => {
        if (video) {
          video.srcObject = p.sourceObject;
        }
      }}
      width="100%"
    />
  ) : (
    <ActivityIndicator style={css.loading} />
  ),
);
