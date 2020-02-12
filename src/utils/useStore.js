import { useRef } from 'react';

import createStore from '../utils/createStore';

const useStore = mixin => {
  const r = useRef();
  if (!r.current) {
    if (mixin && typeof mixin !== `function`) {
      throw new Error(`useStore: mixin must be a function, found ${mixin}`);
    }
    r.current = createStore(mixin);
  }
  return r.current;
};

export default useStore;
