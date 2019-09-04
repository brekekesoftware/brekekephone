import { setJSExceptionHandler } from 'react-native-exception-handler';

import prompt from './prompt';

const onGlobalJSError = err => {
  if (!err) {
    return;
  }
  console.error('onGlobalJSError', err);
  prompt(`Error: ${err.name}`, err.message);
};

setJSExceptionHandler(onGlobalJSError, true);
