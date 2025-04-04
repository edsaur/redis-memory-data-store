// Store all string methods here

class StringStore {
  constructor(store, appendToAOF) {
    this.store = store;
    this.appendToAOF = appendToAOF;
  }

  set(key, value) {
    this.store.set(key, value);
    this.appendToAOF(`db.string.set`, { key, value });
  }

  get(key) {
    return this.store.get(key) || null;
  }

  // STRING OPERATIONS
  append(key, value) {
    if (!this.store.has(key)) {
      this.store.set(key, String(value));
    } else {
      this.store.set(key, this.store.get(key) + String(value));
      this.appendToAOF(`db.string.append`, { key, value });
    }

    return this.store.get(key).length;
  }

  strlen(key) {
    return this.store.has(key) ? this.store.get(key).length : 0;
  }

  // NUMBER OPERATIONS
  incr(key) {
    if (!this.store.has(key)) {
      this.store.set(key, "1");
    } else {
      let value = Number(this.store.get(key));
      if (isNaN(value)) throw new Error("Value is not an integer");
      this.store.set(key, String(value + 1));
      this.appendToAOF(`db.string.incr`, { key, value });
    }
    return this.store.get(key);
  }

  decr(key) {
    if (!this.store.has(key)) {
      this.store.set(key, "-1");
    } else {
      let value = Number(this.store.get(key));
      if (isNaN(value))
        throw new Error("ERR value is not a number or out of range");
      this.store.set(key, String(value - 1));
      this.appendToAOF(`db.string.decr`, { key, value });
    }
    return this.store.get(key);
  }

  incrBy(key, valToIncrement) {
    if (!this.store.has(key)) {
      this.store.set(key, String(value));
    } else {
      let value = Number(this.store.get(key));
      if (isNaN(value)) throw new Error("Value is not an integer");
      this.store.set(key, String(value + valToIncrement));
      this.appendToAOF(`db.string.incrBy`, { key, value });
    }

    return this.store.get(key);
  }

  decBy(key, valToDecrement) {
    if (!this.store.has(key)) {
      this.store.set(key, String(value));
    } else {
      let value = Number(this.store.get(key));
      if (isNaN(value)) throw new Error("Value is not an integer");
      this.store.set(key, String(value - valToDecrement));
      this.appendToAOF(`db.string.decrBy`, { key, value });
    }

    return this.store.get(key);
  }

  // SUBSTRING OPERATIONS

  getRange(key, start, end) {
    if (!this.store.has(key)) return null;
    let value = this.store.get(key);
    return value.substring(start, end + 1);
  }

  setRange(key, offset, substring) {
    if (!this.store.has(key)) {
      this.store.set(key, " ".repeat(offset) + substring);
    } else {
      let value = this.store.get(key);
      let newVal =
        value.substring(0, offset) +
        substring +
        value.substring(offset + substring.length);
      this.store.set(key, newVal);
    }

    return this.store.get(key).length;
  }
}

export default StringStore;
