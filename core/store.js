// Create a class for key-value storage
//  This will include the following methods:
// set, get, remove, has

class InMemoryStore {
  constructor() {
    this.store = new Map();
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
