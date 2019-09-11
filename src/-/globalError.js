import { setJSExceptionHandler } from 'react-native-exception-handler';

import prompt from './prompt';

if (process.env.NODE_ENV === 'production') {
  const onGlobalJSError = err => {
    if (!err) {
      return;
    }
    prompt(`Error: ${err.name}`, err.message);
    console.error('onGlobalJSError', err);
  };
  setJSExceptionHandler(onGlobalJSError, true);
}
