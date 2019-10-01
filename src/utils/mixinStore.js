const mixinStore = $ => ({
  upsert: (k, v, idK = `id`) => {
    $.set(k, arr => {
      const updated = arr.reduce((u, _v) => {
        if (!u && _v[idK] === v[idK]) {
          Object.assign(_v, v);
          return true;
        }
        return u;
      }, false);
      if (!updated) {
        arr.push(v);
      }
      return arr;
    });
  },
  remove: (k, id, idK = `id`) => {
    $.set(k, arr => arr.filter(v => v[idK] !== id));
  },
});

export default mixinStore;
