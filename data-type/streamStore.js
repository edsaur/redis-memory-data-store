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

  xadd(key, idOrField, ...maybeFields) {
    if (!this.store.has(key)) {
      this.store.set(key, []);
    }

    let entryID, fieldValues;

    const isReplayID =
      typeof idOrField === "string" && /^\d+-\d+$/.test(idOrField);

    if (isReplayID) {
      // AOF replay mode
      entryID = idOrField;
      fieldValues = maybeFields;
    } else {
      // Normal CLI mode
      fieldValues = [idOrField, ...maybeFields];
      const timestamp = Date.now();
      const sequence = this.store.get(key).length + 1;
      entryID = `${timestamp}-${sequence}`;
    }

    if (fieldValues.length % 2 !== 0) {
      throw new Error("Field-values must be in key-value pairs.");
    }

    const formattedFields = [];
    for (let i = 0; i < fieldValues.length; i += 2) {
      formattedFields.push([fieldValues[i], fieldValues[i + 1]]);
    }

    const entry = { id: entryID, data: Object.fromEntries(formattedFields) };

    const stream = this.store.get(key);
    if (!Array.isArray(stream))
      throw new Error("Stream key corrupted, expected array.");
    stream.push(entry);

    // Only append to AOF if this is not from replay
    if (!isReplayID) {
      this.appendToAOF("db.stream.xadd", {
        key,
        id: entryID,
        fields: formattedFields,
      });
    }

    return entryID;
  }

  xread({ count, stream, startId = "0" }) {
    if (!this.store.has(stream)) return [];

    const entries = this.store.get(stream);
    const result = [];

    for (const entry of entries) {
      if (entry.id > startId) {
        result.push(entry);
        if (result.length >= count) break;
      }
    }

    return result;
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
    this.appendToAOF("db.stream.xgroupCreate", { stream, group });
    return true;
  }

  xreadgroup(stream, group, count) {
    if (!this.store.has(stream)) return [];
  
    const streamData = this.store.get(stream);
  
    // Ensure the group exists
    if (!this.consumerGroups.has(stream)) {
      this.consumerGroups.set(stream, new Map());
    }
  
    const groupMap = this.consumerGroups.get(stream);
    if (!groupMap.has(group)) {
      groupMap.set(group, []);
    }
  
    const groupPendingMessages = groupMap.get(group);
  
    // Get `count` number of **new messages** for this group
    const unacked = streamData.filter(
      (entry) => !groupPendingMessages.some((m) => m.id === entry.id)
    );
  
    const messagesToDeliver = unacked.slice(0, count);
  
    // ✅ Add to pending list
    groupPendingMessages.push(...messagesToDeliver);
  
    return messagesToDeliver;
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
