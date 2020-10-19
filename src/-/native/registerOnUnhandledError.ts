import {
  JSExceptionHandler,
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler'

const registerOnUnhandledError = (fn: JSExceptionHandler) => {
  setJSExceptionHandler(fn)
  setNativeExceptionHandler(nativeErr => {
    //
    console.error(nativeErr)
  })
}

export default registerOnUnhandledError
