import React from 'react';
import { ActivityIndicator } from 'react-native';

export default p =>
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
    <ActivityIndicator />
  );
