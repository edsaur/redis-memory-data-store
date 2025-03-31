class StreamStore {
  constructor(store, appendToAOF) {
    this.store = store;
    this.appendToAOF = appendToAOF;
    this.consumerGroups = new Map(); // Stores consumer groups
  }

  generateID(lastID) {
    const timestamp = Date.now();
    let sequence = 0;

    if (lastID) {
      const [lastTimestamp, lastSequence] = lastID.split("-").map(Number);
      if (timestamp === lastTimestamp) {
        sequence = lastSequence + 1;
      }
    }
    return `${timestamp}-${sequence}`;
  }

  xadd(key, ...fieldValues) {
    if (!this.store.has(key)) {
      this.store.set(key, []);
    }

    // Ensure fieldValues is in correct format
    if (fieldValues.length % 2 !== 0) {
      throw new Error("Field-values must be in key-value pairs.");
    }

    const formattedFields = [];
    for (let i = 0; i < fieldValues.length; i += 2) {
      formattedFields.push([fieldValues[i], fieldValues[i + 1]]);
    }

    const timestamp = Date.now();
    const sequence = this.store.get(key).length + 1;
    const entryID = `${timestamp}-${sequence}`;

    const entry = { id: entryID, data: Object.fromEntries(formattedFields) };

    this.store.get(key).push(entry);
    this.appendToAOF("db.stream.xadd", { key, entry });

    return entryID;
  }

  xread(count, stream) {
    if (!this.store.has(stream)) return [];
    const entries = this.store.get(stream);
    return entries.slice(-count);
  }

  xrange(stream, startID, endID) {
    if (!this.store.has(stream)) return [];

    return this.store.get(stream).filter((entry) => {
      return entry.id >= startID && entry.id <= endID;
    });
  }

  xlen(stream) {
    return this.store.has(stream) ? this.store.get(stream).length : 0;
  }

  xgroupCreate(stream, group) {
    if (!this.store.has(stream)) {
      throw new Error("Stream does not exist.");
    }
    if (!this.consumerGroups.has(stream)) {
      this.consumerGroups.set(stream, new Map());
    }
    this.consumerGroups.get(stream).set(group, []);
  }

  xreadgroup(stream, group, count) {
    if (
      !this.consumerGroups.has(stream) ||
      !this.consumerGroups.get(stream).has(group)
    ) {
      throw new Error("Consumer group does not exist.");
    }

    const messages = this.store.get(stream).slice(-count);
    this.consumerGroups.get(stream).set(group, messages);
    return messages;
  }

  xack(stream, group, id) {
    if (
      !this.consumerGroups.has(stream) ||
      !this.consumerGroups.get(stream).has(group)
    ) {
      return false;
    }

    const groupMessages = this.consumerGroups.get(stream).get(group);
    const index = groupMessages.findIndex((msg) => msg.id === id);
    if (index !== -1) {
      groupMessages.splice(index, 1);
      return true;
    }
    return false;
  }
}

export default StreamStore;
