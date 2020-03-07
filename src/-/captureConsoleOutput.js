// Write a log to console to note about this
console.info(`captureConsoleOutput: console output is being captured!`);

const lv = [`debug`, `log`, `info`, `warn`, `error`];

const customConsoleObject = lv.reduce((m, k) => {
  // debugStore was added globally in src/global/debugStore.js so it can be used here
  m[k] = (...args) => window.debugStore?.captureConsoleOutput(k, ...args);
  return m;
}, {});

lv.forEach(k => {
  Object.defineProperty(console, k, {
    get() {
      return customConsoleObject[k];
    },
    set() {
      // Prevent set to keep using our functions
    },
  });
});
