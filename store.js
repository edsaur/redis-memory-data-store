// Create a class for key-value storage
//  This will include the following methods:
// set, get, remove, has

import StringStore from "./data-type/stringStore";

class InMemoryStore {
  constructor() {
    this.store = new Map();
    this.string = new StringStore(this.store);
  }

  // CORE FUNCTIONS
  set(key, value) {
    this.store.set(key, value);
  }

  get(key) {
    return this.store.get(key) || null;
  }

  remove(key) {
    delete this.store.delete(key);
  }

  has(key) {
    return this.store.has(key);
  }


}

export default InMemoryStore;
