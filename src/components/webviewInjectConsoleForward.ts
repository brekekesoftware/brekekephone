export const webviewInjectConsoleForward = `
(function() {
  if (window.__brekekeConsoleForwarded) {
    return;
  }
  window.__brekekeConsoleForwarded = true;
  function fmt(args) {
    return Array.prototype.map
      .call(args, function(a) {
        if (typeof a === 'string') {
          return a;
        }
        try {
          return JSON.stringify(a);
        } catch (e) {
          return String(a);
        }
      })
      .join(' ');
  }
  function send(level, msg) {
    try {
      window.ReactNativeWebView &&
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ __brekekeConsole: { level: level, msg: '[WebView] ' + msg } }),
        );
    } catch (e) {}
  }
  ['log', 'warn', 'error'].forEach(function(level) {
    var original = console[level] ? console[level].bind(console) : function() {};
    console[level] = function() {
      original.apply(console, arguments);
      send(level, fmt(arguments));
    };
  });
  window.addEventListener('error', function(e) {
    send('error', (e.message || e) + ' ' + (e.filename || '') + ':' + (e.lineno || ''));
  });
  window.addEventListener('unhandledrejection', function(e) {
    var reason = e.reason && (e.reason.stack || e.reason.message) ? e.reason.stack || e.reason.message : e.reason;
    send('error', 'unhandledrejection: ' + reason);
  });
})();
`
