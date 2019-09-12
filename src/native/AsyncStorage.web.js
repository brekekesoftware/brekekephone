const AsyncStorage = {
  getItem: (...args) => Promise.resolve(window.localStorage.getItem(...args)),
  setItem: (...args) => Promise.resolve(window.localStorage.setItem(...args)),
  removeItem: (...args) =>
    Promise.resolve(window.localStorage.removeItem(...args)),
};

export default AsyncStorage;
