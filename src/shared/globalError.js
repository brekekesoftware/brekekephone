import { setJSExceptionHandler } from 'react-native-exception-handler';

import Alert from './alert';

const onGlobalJSError = err => {
  if (!err) {
    return;
  }
  console.error('onGlobalJSError', err);
  Alert.alert(
    `Error: ${err.name}`,
    err.message,
    [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {},
      },
    ],
    {
      cancelable: true,
    },
  );
};

setJSExceptionHandler(onGlobalJSError, true);
