const cache = {
    data: new Map(),
    timestamps: new Map(),
    
    set: (key, value) => {
      cache.data.set(key, value);
      cache.timestamps.set(key, Date.now());
    },
    
    get: (key) => {
      const timestamp = cache.timestamps.get(key);
      if (!timestamp) return null;
      
      // 5-minute cache invalidation
      if (Date.now() - timestamp > 5 * 60 * 1000) {
        cache.data.delete(key);
        cache.timestamps.delete(key);
        return null;
      }
      
      return cache.data.get(key);
    },
    
    isStale: (key) => {
      const timestamp = cache.timestamps.get(key);
      if (!timestamp) return true;
      return Date.now() - timestamp > 30 * 1000;
    }
  };
  


  console.log(cache)