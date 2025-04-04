export const commandHandlers = {
  // String commands
  "db.string.set": function (data) {
    this.string.set(data.key, data.value);
  },
  "db.string.append": function (data) {
    this.string.append(data.key, data.value);
  },
  "db.string.incrBy": function (data) {
    this.string.incrBy(data.key, data.value);
  },
  "db.string.decrBy": function (data) {
    this.string.decrBy(data.key, data.value);
  },
  "db.string.getRange": function (data) {
    this.string.getRange(data.key, data.start, data.end);
  },
  "db.string.setRange": function (data) {
    this.string.setRange(data.key, data.offset, data.value);
  },

  // JSON commands
  "db.json.set": function (data) {
    this.json.set(data.key, data.path, data.value);
  },
  "db.json.del": function (data) {
    this.json.del(data.key, data.path);
  },
  "db.json.arrAppend": function (data) {
    this.json.arrAppend(data.key, data.path, data.value);
  },

  // List commands
  "db.list.lpush": function (data) {
    this.list.lpush(data.key, ...data.val);
  },
  "db.list.rpush": function (data) {
    this.list.rpush(data.key, ...data.val);
  },
  "db.list.lpop": function (data) {
    this.list.lpop(data.key);
  },
  "db.list.rpop": function (data) {
    this.list.rpop(data.key);
  },
  "db.list.lset": function (data) {
    this.list.lset(data.key, data.index, data.value);
  },

  // Set commands
  "db.set.sadd": function (data) {
    this.set.sadd(data.key, ...data.val);
  },
  "db.set.srem": function (data) {
    this.set.srem(data.key, ...data.val);
  },

  // Hash commands
  "db.hash.hset": function (data) {
    this.hash.hset(data.key, data.field, data.value);
  },
  "db.hash.hmset": function (data) {
    this.hash.hmset(data.key, data.obj);
  },
  "db.hash.hdel": function (data) {
    this.hash.hdel(data.key, ...data.fields);
  },

  // Sorted Set commands
  "db.sorted.zadd": function (data) {
    this.zset.zadd(data.key, data.score, data.value);
  },

  // Stream commands
  "db.stream.xadd": function (data) {
    this.stream.xadd(data.key, data.score, data.fields);
  },

  // Geo commands
  "db.geo.geoadd": function (data) {
    this.geo.geoadd(data.key, data.lat, data.lon, data.name);
  },

  // Bitmap commands
  "db.bitmap.setBit": function (data) {
    this.bitmap.setBit(data.key, data.offset, data.value);
  },
  "db.bitmap.bitOp": function (data) {
    this.bitmap.bitOp(data.op, data.destKey, ...data.keys);
  },

  // Bitfield commands
  "db.bitfield.setBitfield": function (data) {
    this.bitfield.setBitfield(
      data.key,
      data.type,
      data.offset,
      data.value,
      data.overflowMode
    );
  },
  "db.bitfield.incrByBitfield": function (data) {
    this.bitfield.incrByBitfield(
      data.key,
      data.type,
      data.offset,
      data.increment,
      data.overflowMode
    );
  },

  // HyperLogLog commands
  "db.hll.pfadd": function (data) {
    this.hll.pfAdd(data.key, ...data.elements);
  },
  "db.hll.pfmerge": function (data) {
    this.hll.pfMerge(data.destKey, ...data.sourceKeys);
  },

  // Time Series commands
  "db.ts.create": function (data) {
    this.ts.create(data.key);
  },
  "db.ts.add": function (data) {
    this.ts.add(data.key, data.timestamp, data.value);
  },
  "db.ts.downsample": function (data) {
    this.ts.downsample(data.key, data.interval);
  },
  "db.ts.aggregate": function (data) {
    this.ts.aggregate(data.key, data.startTime, data.endTime, data.aggType);
  },

// Pub/Sub commands
  PUBLISH: function (data) {
    this.publish(data.channel, data.message);
  },
  SUBSCRIBE: function (data) {
    this.subscribe(data.socket, data.channel);
  },
};
