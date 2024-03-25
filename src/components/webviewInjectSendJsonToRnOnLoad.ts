import { Platform } from 'react-native'

export const webviewInjectSendJsonToRnOnLoad = (title?: boolean) =>
  Platform.OS === 'ios'
    ? `
window.addEventListener('load', function() {
  sendJsonToRn({ loading: false });
});
`
    : // event load doesnt work on android webview
      // need to have a jquery implementation
      `
var ready = function (fn) {
  if (typeof fn !== 'function') {
    return;
  }
  if (document.readyState === 'complete' ) {
    return fn();
  }
  document.addEventListener('DOMContentLoaded', fn, false);
};
ready(function() {
  sendJsonToRn({ loading: false });
});
`
