import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler';

const registerOnUnhandledError = fn => {
  setJSExceptionHandler(fn);
  setNativeExceptionHandler(nativeErr => {
    //
  });
};

export default registerOnUnhandledError;
