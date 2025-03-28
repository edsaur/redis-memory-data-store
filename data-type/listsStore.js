class ListStore {
    constructor(store, appendToAOF) {
      this.store = store;
      this.appendToAOF = appendToAOF;
    }
  
    lpush(key, ...val) {
      if (!this.store.has(key)) this.store.set(key, []);
  
      const list = this.store.get(key);
      this.store.set(key, [...val, ...list]);
      this.appendToAOF("db.list.lpush", { key, val });
  
      return this.store.get(key).length;
    }
  
    rpush(key, ...val) {
      if (!this.store.has(key)) this.store.set(key, []);
  
      const list = this.store.get(key);
      this.store.set(key, [...list, ...val]);
      this.appendToAOF("db.list.rpush", { key, val });
  
      return this.store.get(key).length;
    }
  
    lpop(key) {
      if (!this.store.has(key) || this.store.get(key).length === 0) return null;
  
      const list = this.store.get(key);
      const val = list.shift();
  
      this.appendToAOF("db.list.lpop", { key, val });
  
      return val;
    }
  
    rpop(key) {
      if (!this.store.has(key) || this.store.get(key).length === 0) return null;
      const list = this.store.get(key);
      const val = list.pop();
  
      this.appendToAOF("db.list.rpop", { key, val });
  
      return val;
    }
  
    lrange(key, start, end) {
      if (!this.store.has(key) || this.store.get(key).length === 0) return [];
  
      const list = this.store.get(key);
  
      return list.slice(start, end + 1);
    }
  
    lindex(key, index) {
      if(!this.store.has(key)) return null;
      const list = this.store.get(key);
  
      return list[index] ?? null;
    }
  
    lset(key, index, value) {
      if(!this.store.has(key)) return null;
      const list = this.store.get(key);
  
      if(index < 0 || index >= list.length) return null;
  
      list[index] = value;
      this.appendToAOF("db.list.lset", { key, index, value });
  
      return true;
  
    }
  }
  
  export default ListStore;
  