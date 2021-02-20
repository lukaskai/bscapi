const cache = [];

export default {
  get(key) {
    const cacheValue = cache[key];
    if (!cacheValue || new Date(cacheValue.invalidationTime) < Date.now()) return false;
    return JSON.parse(JSON.stringify(cacheValue.value));
  },

  store(key, value, invalidationTime) {
    cache[key] = {
      value: JSON.parse(JSON.stringify(value)),
      invalidationTime,
    };
  },
};
