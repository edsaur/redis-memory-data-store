class HashStore {
  constructor(store, appendToAOF) {
    this.store = store;
    this.appendToAOF = appendToAOF;
  }

  // HSET: Set field-value pair in a hash
  hset(key, field, value) {
    if (typeof key !== "string" || typeof field !== "string") {
      throw new Error("-ERROR: Key and field must be strings.");
    }
    if (!this.store.has(key)) {
      this.store.set(key, {});
    }
    const hash = this.store.get(key);
    const previousValue = hash[field]; //Store previous value for AOF logging
    hash[field] = value;
    this.appendToAOF("db.hash.hset", { key, field, value, previousValue });
    return 1;
  }

  // HGET: Get value of a field in a hash
  hget(key, field) {
    if (typeof key !== "string" || typeof field !== "string") {
      return "-ERROR: Key and field must be strings.";
    }
    return this.store.has(key) ? this.store.get(key)[field] : null;
  }

  // HMSET: Set multiple field-value pairs in a hash
  hmset(key, obj) {
    if (typeof key !== "string" || typeof obj !== "object") {
      return "-ERROR: Key must be a string, and value must be an object.";
    }
    if (!this.store.has(key)) this.store.set(key, {});
    const hash = this.store.get(key);
    Object.assign(hash, obj);
    this.appendToAOF("db.hash.hmset", { key, obj });
    return "OK";
  }

  // HGETALL: Get all field-value pairs in a hash
  hgetall(key) {
    if (typeof key !== "string") {
      return "-ERROR Key must be a string.";
    }
    return this.store.has(key) ? this.store.get(key) : {};
  }

  // Hdel: Delete one or more fields in a hash
  hdel(key, ...fields) {
    if (
      typeof key !== "string" ||
      !fields.every((f) => typeof f === "string")
    ) {
      return "-ERROR: Key and fields must be strings.";
    }
    if (!this.store.has(key)) return 0;
    const hash = this.store.get(key);
    let count = 0;
    for (const field of fields) {
      if (hash.hasOwnProperty(field)) {
        delete hash[field];
        count++;
      }
    }
    this.appendToAOF("db.hash.hdel", { key, fields });
    return count;
  }

  // HEXISTS: Check if a field exists in a hash
  hexists(key, field) {
    if (typeof key !== "string" || typeof field !== "string") {
      throw new Error("-ERROR: Key and field must be strings.");
    }
    return this.store.has(key) && this.store.get(key).hasOwnProperty(field)
      ? 1
      : 0;
  }

  //HLEN: Get the number of fields in a hash
  hlen(key) {
    if (typeof key !== "string") {
      throw new Error("-ERR: Key must be a string.");
    }
    const hash = this.store.get(key);
    return hash ? Object.keys(hash).length : 0;
  }
}

export default HashStore;
