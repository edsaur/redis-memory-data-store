class JsonStore {
  constructor(store, appendToAOF) {
    this.store = store;
    this.appendToAOF = appendToAOF;
  }

  // Generates a JSON object and stores it in the store;
  // $ is the root of the object
  set(key, path, value) {
    let storedValue = this.store.get(key);

    let jsonData =
      storedValue && typeof storedValue === "string"
        ? JSON.parse(storedValue)
        : {}; // Ensure jsonData is always an object

    if (path === "$") {
      jsonData = value; // Set the entire object
    } else {
      this.setPath(jsonData, path, value); // Set value at specified path
    }

    this.store.set(key, JSON.stringify(jsonData)); // Store as JSON string
    this.appendToAOF(`db.json.set`, { key, path, value });
  }

  // Retrieves a JSON object from the store and returns it;

  get(key, path = "$") {
    if (!this.store.has(key)) return null; // throws Error if key does not exist
    let jsonData = JSON.parse(this.store.get(key)); // Get the JSON object
    if (path === "$") return jsonData; // Return the entire object if path is $

    return this.getPath(jsonData, path); // Return the value at the specified path
  }

  del(key, path = "$") {
    if (!this.store.has(key)) return false; // Return false instead of throwing an error

    if (path === "$") {
      this.store.remove(key); // Delete the entire object
      this.appendToAOF("db.json.del", { key });
      return true;
    }

    let jsonData = JSON.parse(this.store.get(key));

    if (this.deletePath(jsonData, path)) {
      this.store.set(key, JSON.stringify(jsonData)); // Only delete the value at the specified path
      this.appendToAOF("db.json.del", { key });
      return true;
    }

    return null;
  }

  arrAppend(key, path, value) {
    if (!this.store.has(key)) throw new Error("Key does not exist");
    let jsonData = JSON.parse(this.store.get(key));

    let arr = this.getPath(jsonData, path);
    if (!Array.isArray(arr)) throw new Error("Path is not an array");
    arr.push(value);
    this.store.set(key, JSON.stringify(jsonData));
    this.appendToAOF("db.json.arrAppend", { key, path, value });

    return arr.length;
  }

  // HELPER METHODS for JsonStore
  setPath(obj, path, value) {
    const keys = path.replace(/\[(\d+)\]/g, ".$1").split("."); // ✅ Convert array indices properly
    // console.log("keys: " + keys);
    let current = obj;
    // console.log("current: " + current);

    for (let i = 0; i < keys.length - 1; i++) {
      let key = keys[i];
      //   console.log("here " + key);

      let nextKey = keys[i + 1];
      //   console.log("here " + nextKey);

      let isArrayIndex = !isNaN(parseInt(nextKey)); // ✅ Check if next key is a number (array index)
      //   console.log("here " + isArrayIndex);

      // Convert key to number if it's an array index
      if (!isNaN(parseInt(key))) {
        key = parseInt(key);
        // console.log("Key: " + key);
      }

      // Ensure correct data structure exists
      if (!(key in current)) {
        current[key] = isArrayIndex ? [] : {}; // Create array if next key is a number
      }

      current = current[key]; // Move deeper into the object
      //   console.log("Current: " + current);
    }

    let finalKey = keys[keys.length - 1];

    // Handle array index assignment
    if (!isNaN(finalKey)) {
      finalKey = parseInt(finalKey);
      if (!Array.isArray(current))
        throw new Error(`Expected an array at '${path}' but found an object.`);
      current[finalKey] = value; // ✅ Assign to the correct index
    } else {
      current[finalKey] = value; // ✅ Assign normal key-value pair
    }
  }

  getPath(obj, path) {
    const keys = path.replace(/\[|\]/g, "").split(".");
    let current = obj;

    for (let key of keys) {
      if (current[key] === undefined) return null;
      current = current[key];
    }

    return current;
  }

  deletePath(obj, path) {
    const keys = path.replace(/\[|\]/g, "").split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current || typeof current !== "object")
        throw new Error("Path is not an object"); // Ensure current is an object
      if (!(keys[i] in current)) throw new Error("Key does not exist"); // Key does not exist
      current = current[keys[i]]; // Traverse deeper
    }

    let lastKey = keys[keys.length - 1];
    if (current && lastKey in current) {
      delete current[lastKey]; // Delete the actual key
      return true;
    }
    throw new Error("Path does not exist");
  }
}

export default JsonStore;
