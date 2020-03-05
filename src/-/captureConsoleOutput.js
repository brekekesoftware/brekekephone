import CircularJson from 'circular-json';
import moment from 'moment';

// Write a log to console to note about this
console.info(`captureConsoleOutput: console output is being captured!`);

const lv = [`debug`, `log`, `info`, `warn`, `error`];

const errorOutput = () => {
  //
};
const otherOutput = () => {
  //
};

const createConsoleFn = k => (...args) => {
  const outputFn = k === `error` ? errorOutput : otherOutput;
  const msg =
    moment().format(`YYYY/MM/DD HH:mm:ss`) +
    ` ${k.toUpperCase()} ` +
    args
      .map(a =>
        !a
          ? `` + a
          : a.message && a.stacks
          ? a.message + ` ` + a.stacks
          : typeof a === `object`
          ? CircularJson.stringify(a)
          : `` + a,
      )
      .join(` `)
      .replace(/\s+/g, ` `);
  outputFn(msg);
};

const capturedConsole = lv.reduce((m, k) => {
  m[k] = createConsoleFn(k);
  return m;
}, {});

lv.forEach(k => {
  Object.defineProperty(console, k, {
    get() {
      return capturedConsole[k];
    },
    set() {
      /* Keep using our functions */
    },
  });
});
