function createTtlCache({ ttlMs }) {
  const store = new Map();

  return {
    get(key) {
      const entry = store.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },
    set(key, value) {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
    clear() {
      store.clear();
    }
  };
}

module.exports = { createTtlCache };


