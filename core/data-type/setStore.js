class SetStore {
  constructor(store, appendToAOF) {
    this.store = store;
    this.appendToAOF = appendToAOF;
  }

  sadd(key, ...vals) {
    if (!this.store.has(key)) {
      console.log(`Creating new set for key: ${key}`);
      this.store.set(key, new Set()); // ✅ Ensure it's a Set
    }

    const set = this.store.get(key);
    console.log(`Checking type of store.get("${key}") ->`, set);

    if (!(set instanceof Set)) {
      throw new TypeError(
        `Expected a Set for key "${key}", but got ${typeof set}:`,
        set
      );
    }

    let count = 0;
    for (const value of vals) {
      if (!set.has(value)) {
        set.add(value);
        count++;
      }
    }

    this.appendToAOF("db.set.sadd", [key, ...vals]);

    return count;
  }

  srem(key, ...vals) {
    if (!this.store.has(key)) return 0;

    const set = this.store.get(key);
    let count = 0;

    for (const value of vals) {
      if (set.has(value)) {
        set.delete(value);
        count++;
      }
    }

    this.appendToAOF("db.set.srem", { key, value: vals });
    return count;
  }

  // Check if a value is in the set
  sismember(key, value) {
    return this.store.has(key) && this.store.get(key).has(value);
  }

  // Get all values in a set
  smembers(key) {
    return this.store.has(key) ? Array.from(this.store.get(key)) : [];
  }

  // Get the intersection of multiple sets
  sinter(...keys) {
    let sets = keys.map((key) => this.store.get(key) || new Set());
    if (sets.length === 0) return [];

    let result = new Set(sets[0]);
    for (const currentSet of sets.slice(1)) {
      result = new Set([...result].filter((value) => currentSet.has(value)));
    }

    return Array.from(result);
  }

  // Get the union of multiple sets
  sunion(...keys) {
    let result = new Set();
    for (const key of keys) {
      const set = this.store.get(key) || new Set();
      for (const value of set) {
        result.add(value);
      }
    }

    return Array.from(result);
  }

  // Get the difference of multiple sets
  sdiff(...keys) {
    let result = new Set(this.store.get(keys[0]) || new Set());
    for (const key of keys.slice(1)) {
      const set = this.store.get(key) || new Set();
      for (const value of set) {
        result.delete(value);
      }
    }

    return Array.from(result);
  }
}

export default SetStore;
