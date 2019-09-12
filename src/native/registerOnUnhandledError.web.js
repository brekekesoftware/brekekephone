const registerOnUnhandledError = fn => {
  window.addEventListener('error', fn);
};

export default registerOnUnhandledError;
