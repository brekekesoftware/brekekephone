import type { JSExceptionHandler } from 'react-native-exception-handler'
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler'

export const registerOnUnhandledError = (fn: JSExceptionHandler) => {
  setJSExceptionHandler(fn)
  setNativeExceptionHandler(nativeErr => {
    //
    console.error('exception-handler error:', nativeErr)
  })
}
