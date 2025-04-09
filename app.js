import net from "net";
import db from "./db.js"; // Your database module

const PORT = 6379; // Redis default port

const server = net.createServer((socket) => {
  console.log("Client connected!");

  socket.write(
    "Welcome to Redis-like Store! Type commands like SET key value, GET key, etc.\n"
  );

  let step = null;
  let clientId = null; // Store the client ID for transactions

  socket.on("data", (data) => {
    const input = data.toString().trim();
    if (!input) return;
    let response = "";

    // Handle MULTI command
    if (step === "QUEUE") {
      const commandUpper = input.toUpperCase();
      if (commandUpper === "EXEC") {
        response = db.transaction.exec(clientId); // Execute queued commands
        step = null; // Exit transaction mode
      } else if (commandUpper === "DISCARD") {
        response = db.transaction.discard(clientId); // Discard queue
        step = null; // Exit transaction mode
      } else {
        // Queue the command
        response = db.transaction.queueCommand(clientId, input);
      }
      socket.write(response);
      return; // Don't process further in the main switch
    }

    const parts = input.split(" ");
    const command = parts[0].toUpperCase(); // Extract command
    const args = parts.slice(1).map((arg) => arg.replace(/^"(.*)"$/, "$1"));

    switch (command) {
      // STRING COMMANDS
      case "SET":
        if (args.length < 2) {
          response = "-ERROR: SET requires a key and a value\r\n";
        } else {
          const key = args[0];
          const value = args.slice(1).join(" "); // Join multi-word values
          db.string.set(key, value);
          response = "+OK\r\n";
        }
        break;

      case "GET":
        if (args.length !== 1) {
          response = "-ERROR: GET requires exactly one key\r\n";
        } else {
          const value = db.string.get(args[0]);
          response = value !== null ? `+${value}\r\n` : "$-1\r\n"; // Return (nil) if key not found
        }
        break;

      case "DEL":
        if (args.length < 1) {
          response = "-ERROR: DEL requires at least one key\r\n";
        } else {
          db.store.remove(args[0]);
          response = "+OK\r\n";
        }
        break;

      case "APPEND":
        if (args.length < 2) {
          response = "-ERROR: APPEND requires a key and a value\r\n";
        } else {
          db.string.append(args[0], args.slice(1).join(" "));
          response = "+OK\r\n";
        }
        break;

      case "STRLEN":
        if (args.length !== 1) {
          response = "-ERROR: STRLEN requires exactly one key\r\n";
        } else {
          const length = db.string.strlen(args[0]);
          response = `:${length}\r\n`;
        }
        break;

      case "INCR":
        if (args.length !== 1) {
          response = "-ERROR: INCR requires exactly one key\r\n";
        } else {
          const newValue = db.string.incr(args[0]);
          response = `:${newValue}\r\n`;
        }
        break;

      case "DECR":
        if (args.length !== 1) {
          response = "-ERROR: DECR requires exactly one key\r\n";
        } else {
          const newValue = db.string.decr(args[0]);
          response = `:${newValue}\r\n`;
        }
        break;

      case "INCRBY":
        if (args.length !== 2 || isNaN(args[1])) {
          response = "-ERROR: INCRBY requires a key and a numeric value\r\n";
        } else {
          const newValue = db.string.incrBy(args[0], Number(args[1]));
          response = `:${newValue}\r\n`;
        }
        break;

      case "DECRBY":
        if (args.length !== 2 || isNaN(args[1])) {
          response = "-ERROR: DECRBY requires a key and a numeric value\r\n";
        } else {
          const newValue = db.string.decBy(args[0], Number(args[1]));
          response = `:${newValue}\r\n`;
        }
        break;

      case "GETRANGE":
        if (args.length !== 3 || isNaN(args[1]) || isNaN(args[2])) {
          response =
            "-ERROR: GETRANGE requires a key, start index, and end index\r\n";
        } else {
          const value = db.string.getRange(
            args[0],
            Number(args[1]),
            Number(args[2])
          );
          response = `+${value}\r\n`;
        }
        break;

      case "SETRANGE":
        if (args.length < 3 || isNaN(args[1])) {
          response =
            "-ERROR: SETRANGE requires a key, offset, and new value\r\n";
        } else {
          const newLength = db.string.setRange(
            args[0],
            Number(args[1]),
            args.slice(2).join(" ")
          );
          response = `:${newLength}\r\n`;
        }
        break;

      // JSON COMMANDS
      case "JSON.SET":
        if (args.length < 3) {
          response = "-ERROR: JSON.SET requires a key, path, and value\r\n";
        } else {
          const key = args[0];
          const path = args[1];
          // Correctly construct the JSON string using JSON.stringify()
          const value = args.slice(2).join(" ");

          try {
            // Validate if the value is a valid JSON
            const parsedValue = JSON.parse(value);
            db.json.set(key, path, parsedValue); // Set the parsed JSON value
            response = "+OK\r\n";
          } catch (error) {
            // If JSON parsing fails, return an error response
            response = "-ERROR: Invalid JSON value\r\n";
          }
        }
        break;

      case "JSON.GET":
        if (args.length !== 1) {
          response = "-ERROR: JSON.GET requires exactly one key\r\n";
        } else {
          const value = db.json.get(args[0]);
          response =
            value !== null ? `+${JSON.stringify(value)}\r\n` : "$-1\r\n"; // Return (nil) if key not found
        }
        break;

      case "JSON.DEL":
        if (args.length < 1) {
          response = "-ERROR: JSON.DEL requires at least one key\r\n";
        } else {
          try {
            db.json.del(args[0]);
            response = "+OK\r\n";
          } catch (error) {
            response = `${error.message}\r\n`;
          }
        }
        break;

      case "JSON.ARRAPPEND":
        if (args.length < 3) {
          response =
            "-ERROR: JSON.ARRAPPEND requires a key, path, and value\r\n";
        } else {
          const key = args[0];
          const path = args[1];

          try {
            const value = args.slice(2).join(" ");
            db.json.arrAppend(key, path, value);
            response = "+OK\r\n";
          } catch (error) {
            response = `${error.message}\r\n`;
          }
        }
        break;

      case "LPUSH":
        if (args.length < 2) {
          response = "-ERROR: LPUSH requires a key and at least one value\r\n";
        } else {
          const key = args[0];
          const values = args.slice(1);
          db.list.lpush(key, ...values);
          response = `:[${db.store.get(key)}]\r\n`;
        }
        break;

      case "RPUSH":
        if (args.length < 2) {
          response = "-ERROR: RPUSH requires a key and at least one value\r\n";
        } else {
          const key = args[0];
          const values = args.slice(1);
          db.list.rpush(key, ...values);
          response = `:[${db.store.get(key)}]\r\n`;
        }
        break;

      case "LPOP":
        if (args.length !== 1) {
          response = "-ERROR: LPOP requires exactly one key\r\n";
        } else {
          const value = db.list.lpop(args[0]);
          response = value !== null ? `+${value} removed\r\n` : "$-1\r\n"; // Return (nil) if key not found
        }
        break;

      case "RPOP":
        if (args.length !== 1) {
          response = "-ERROR: RPOP requires exactly one key\r\n";
        } else {
          const value = db.list.rpop(args[0]);
          response = value !== null ? `+${value}\r\n` : "$-1\r\n"; // Return (nil) if key not found
        }
        break;

      case "LRANGE":
        if (args.length !== 3 || isNaN(args[1]) || isNaN(args[2])) {
          response =
            "-ERROR: LRANGE requires a key, start index, and end index\r\n";
        } else {
          const key = args[0];
          const start = Number(args[1]);
          const end = Number(args[2]);
          const values = db.list.lrange(key, start, end);
          response = `+${JSON.stringify(values)}\r\n`;
        }

      case "LINDEX":
        if (args.length !== 2 || isNaN(args[1])) {
          response = "-ERROR: LINDEX requires a key and an index\r\n";
        } else {
          const key = args[0];
          const index = Number(args[1]);
          const value = db.list.lindex(key, index);
          response = value !== null ? `+${value}\r\n` : "$-1\r\n"; // Return (nil) if key not found
        }
        break;

      case "LSET":
        if (args.length !== 3 || isNaN(args[1])) {
          response = "-ERROR: LSET requires a key, index, and value\r\n";
        } else {
          const key = args[0];
          const index = Number(args[1]);
          const value = args[2];
          db.list.lset(key, index, value);
          response = "+OK\r\n";
        }
        break;

      // Set Commands
      case "SADD":
        if (args.length < 2) {
          response = "-ERROR: SADD requires a key and at least one value\r\n";
        } else {
          const key = args[0];
          const values = args.slice(1);

          try {
            db.set.sadd(key, ...values); // Attempt to add values to the set
            response = `:[${[...db.store.get(key)].join(" ")}]\r\n`; // Return the updated set
          } catch (error) {
            // Handle errors, such as TypeErrors or unexpected issues
            response = `-ERROR: ${error.message}\r\n`;
          }
        }
        break;

      case "SREM":
        if (args.length < 2) {
          response = "-ERROR: SREM requires a key and at least one value\r\n";
        } else {
          const key = args[0];
          const values = args.slice(1);
          db.set.srem(key, ...values);
          response = `:[${[...db.store.get(key)].join(" ")}]\r\n`;
        }
        break;

      case "SISMEMBER":
        if (args.length !== 2) {
          response = "-ERROR: SISMEMBER requires a key and a value\r\n";
        } else {
          const key = args[0];
          const value = args[1];
          const isMember = db.set.sismember(key, value);
          response = isMember ? "+1\r\n" : "+0\r\n";
        }
        break;

      case "SMEMBERS":
        if (args.length !== 1) {
          response = "-ERROR: SMEMBERS requires exactly one key\r\n";
        } else {
          const key = args[0];
          const members = db.set.smembers(key);
          response = `+${JSON.stringify(members)}\r\n`;
        }
        break;

      case "SINTER":
        if (args.length < 1) {
          response = "-ERROR: SINTER requires at least one key\r\n";
        } else {
          const keys = args;
          const intersection = db.set.sinter(...keys);
          response = `+${JSON.stringify(intersection)}\r\n`;
        }
        break;

      case "SUNION":
        if (args.length < 1) {
          response = "-ERROR: SUNION requires at least one key\r\n";
        } else {
          const keys = args;
          const union = db.set.sunion(...keys);
          response = `+${JSON.stringify(union)}\r\n`;
        }
        break;

      case "SDIFF":
        if (args.length < 1) {
          response = "-ERROR: SDIFF requires at least one key\r\n";
        } else {
          const keys = args;
          const difference = db.set.sdiff(...keys);
          response = `+${JSON.stringify(difference)}\r\n`;
        }
        break;

      // Hash Commands
      case "HSET":
        if (args.length < 3) {
          response = "-ERROR: HSET requires a key, field, and value\r\n";
        } else {
          const key = args[0];
          const field = args[1];
          const value = args[2];
          try {
            db.hash.hset(key, field, value);
            response = "+OK\r\n";
          } catch (error) {
            response = `${error.message}\r\n`;
          }
        }
        break;

      case "HGET":
        if (args.length !== 2) {
          response = "-ERROR: HGET requires a key and a field\r\n";
        } else {
          const key = args[0];
          const field = args[1];
          try {
            const value = db.hash.hget(key, field);
            response = value !== null ? `+${value}\r\n` : "$-1\r\n"; // Return (nil) if key not found
          } catch (error) {
            response = `${error.message}\r\n`;
          }
        }
        break;

      case "HMSET":
        if (args.length < 3 || args.length % 2 === 0) {
          response =
            "-ERROR: HMSET requires a key and at least one field-value pair\r\n";
        } else {
          const key = args[0];
          const pairs = args.slice(1);
          const obj = {};

          for (let i = 0; i < pairs.length; i += 2) {
            const field = pairs[i].replace(/:$/, ""); // Remove trailing colon
            const value = pairs[i + 1].replace(/,$/, ""); // Remove trailing comma
            obj[field] = value;
          }

          try {
            db.hash.hmset(key, obj);
            response = "+OK\r\n";
          } catch (error) {
            response = `${error.message}\r\n`;
          }
        }
        break;

      case "HGETALL":
        if (args.length !== 1) {
          response = "-ERROR: HGETALL requires a key\r\n";
        } else {
          const key = args[0];

          try {
            const hash = db.hash.hgetall(key);

            response = `+${JSON.stringify(hash)}\r\n`;
          } catch (error) {
            response = `${error.message}\r\n`;
          }
        }
        break;

      case "HDEL":
        if (args.length < 2) {
          response = "-ERROR: HDEL requires a key and at least one field\r\n";
        } else {
          const key = args[0];
          const fields = args.slice(1);
          try {
            const count = db.hash.hdel(key, ...fields);
            response = `+${count}\r\n`;
          } catch (error) {
            response = `${error.message}\r\n`;
          }
        }
        break;

      case "HEXISTS":
        if (args.length !== 2) {
          response = "-ERROR: HEXISTS requires a key and a field\r\n";
        } else {
          const key = args[0];
          const field = args[1];
          try {
            const exists = db.hash.hexists(key, field);
            response = exists ? "+1\r\n" : "+0\r\n";
          } catch (error) {
            response = `${error.message}\r\n`;
          }
        }
        break;

      case "HLEN":
        if (args.length !== 1) {
          response = "-ERROR: HLEN requires a key\r\n";
        } else {
          const key = args[0];
          try {
            const length = db.hash.hlen(key);
            response = `+${length}\r\n`;
          } catch {
            response = `${error.message}\r\n`;
          }
        }
        break;

      // Sorted Set Commands
      case "ZADD":
        if (args.length < 3 || isNaN(args[1])) {
          response = "-ERROR: ZADD requires a key, score, and value\r\n";
        } else {
          const key = args[0];
          const score = Number(args[1]);
          const value = args.slice(2).join(" ");
          db.zset.zadd(key, score, value);
          response = "+OK\r\n";
        }
        break;

      case "ZRANGE":
        if (args.length < 3) {
          response =
            "-ERROR: ZRANGE requires a key, start index, and end index\r\n";
        } else {
          const key = args[0];
          const start = Number(args[1]);
          const end = Number(args[2]);
          const values = db.zset.zrange(key, start, end);
          response = `+${JSON.stringify(values)}\r\n`;
        }
        break;

      case "ZRANK":
        if (args.length !== 2) {
          response = "-ERROR: ZRANK requires a key and a value\r\n";
        } else {
          const key = args[0];
          const value = args[1];
          const rank = db.zset.zrank(key, value);
          response = rank !== null ? `+${rank}\r\n` : "$-1\r\n"; // Return (nil) if key not found
        }
        break;

      case "ZREM":
        if (args.length < 2) {
          response = "-ERROR: ZREM requires a key and at least one value\r\n";
        } else {
          const key = args[0];
          const values = args.slice(1);
          const count = db.zset.zrem(key, ...values);
          response = `+${count}\r\n`;
        }
        break;

      case "ZRANGEBYSCORE":
        if (args.length < 3) {
          response =
            "-ERROR: ZRANGEBYSCORE requires a key, min score, and max score\r\n";
        } else {
          const key = args[0];
          const min = Number(args[1]);
          const max = Number(args[2]);
          const values = db.zset.zrangebyscore(key, min, max);
          response = `+${JSON.stringify(values)}\r\n`;
        }
        break;

      // Stream Commands
      case "XADD":
        if (args.length < 3) {
          response = "-ERROR: XADD requires a key, field, and value\r\n";
        } else {
          const key = args[0];
          const fieldValues = args.slice(1);
          try {
            // Attempt to add the entry to the stream
            const id = db.stream.xadd(key, ...fieldValues);
            response = `+${id}\r\n`;
          } catch (error) {
            // Handle errors, such as invalid field-value pairs or corrupted stream
            response = `-ERROR: ${error.message}\r\n`;
          }
        }
        break;

      case "XREAD": {
        if (args.length < 2) {
          response = "-ERROR: XREAD requires at least a count and a key\r\n";
        } else {
          const count = Number(args[0]);
          const key = args[1];
          const startId = args[2] || "0"; // Default to "0" if not provided
          const entries = db.stream.xread({ count, stream: key, startId });
          response = `+${JSON.stringify(entries)}\r\n`;
        }
        break;
      }

      case "XRANGE":
        if (args.length < 3) {
          response = "-ERROR: XRANGE requires a key, start ID, and end ID\r\n";
        } else {
          const key = args[0];
          const startID = args[1];
          const endID = args[2];
          const entries = db.stream.xrange(key, startID, endID);
          response = `+${JSON.stringify(entries)}\r\n`;
        }
        break;

      case "XLEN":
        if (args.length !== 1) {
          response = "-ERROR: XLEN requires a key\r\n";
        } else {
          const key = args[0];
          const length = db.stream.xlen(key);
          response = `+${length}\r\n`;
        }
        break;

      case "XGROUP":
        if (args.length < 2) {
          response = "-ERROR: XGROUP requires a key and a group name\r\n";
        } else {
          const key = args[0];
          const group = args[1];
          try {
            db.stream.xgroupCreate(key, group); // Attempt to create the consumer group
            response = "+OK\r\n";
          } catch (error) {
            // Handle errors, such as stream not existing
            response = `${error.message}\r\n`;
          }
        }
        break;

      case "XREADGROUP":
        if (args.length < 3) {
          response =
            "-ERROR: XREADGROUP requires a stream name, group name, and count\r\n";
        } else {
          const stream = args[0];
          const group = args[1];
          const count = Number(args[2]);
          const entries = db.stream.xreadgroup(stream, group, count);
          response = `+${JSON.stringify(entries)}\r\n`;
        }
        break;

      case "XACK":
        if (args.length < 3) {
          response =
            "-ERROR: XACK requires a stream name, group name, and message ID\r\n";
        } else {
          const stream = args[0];
          const group = args[1];
          const id = args[2];
          const acked = db.stream.xack(stream, group, id);
          response = acked ? "+OK\r\n" : "-ERROR: Message not found\r\n";
        }
        break;

      // Geospatial Commands
      case "GEOADD":
        if (args.length < 4) {
          response =
            "-ERROR: GEOADD requires a key, longitude, latitude, and city name\r\n";
        } else {
          const key = args[0];
          const lon = Number(args[1]);
          const lat = Number(args[2]);
          const member = args[3];
          db.geo.geoadd(key, lat, lon, member);
          response = "+OK\r\n";
        }
        break;

      case "GEOSEARCH":
        if (args.length < 4) {
          response =
            "-ERROR: GEOSEARCH requires a key, longitude, latitude, and member\r\n";
        } else {
          const key = args[0];
          const lon = Number(args[1]);
          const lat = Number(args[2]);
          const radius = Number(args[3]);
          if (isNaN(radius) || isNaN(lon) || isNaN(lat)) {
            response =
              "-ERROR: GEOSEARCH requires a key, longitude, latitude, and radius\r\n";
          }
          const results = db.geo.geosearch(key, lat, lon, radius);
          response = `+${JSON.stringify(results)}\r\n`;
        }
        break;
      case "GEODIST":
        if (args.length < 3) {
          response = "-ERROR: GEODIST requires a key, name1, name2\r\n";
        } else {
          const key = args[0];
          const member1 = args[1];
          const member2 = args[2];
          const distance = db.geo.geodist(key, member1, member2);
          response = distance !== null ? `+${distance}\r\n` : "$-1\r\n"; // Return (nil) if key not found
        }
        break;

      // BITMAPS
      case "SETBIT":
        if (args.length < 3) {
          response = "-ERROR: SETBIT requires a key, offset, and value\r\n";
        } else {
          const key = args[0];
          const offset = Number(args[1]);
          const value = Number(args[2]);
          if (isNaN(offset) || offset < 0 || (value !== 0 && value !== 1)) {
            response =
              "-ERROR: SETBIT offset must be non-negative and value must be 0 or 1\r\n";
          } else {
            db.bitmap.setBit(key, offset, value);
            response = "+OK\r\n";
          }
        }
        break;

      case "GETBIT":
        if (args.length < 2) {
          response = "-ERROR: GETBIT requires a key and an offset\r\n";
        } else {
          const key = args[0];
          const offset = Number(args[1]);
          const value = db.bitmap.getBit(key, offset);
          response = value !== null ? `+${value}\r\n` : "$-1\r\n"; // Return (nil) if key not found
        }
        break;

      case "BITCOUNT":
        if (args.length < 1) {
          response = "-ERROR: BITCOUNT requires a key\r\n";
        } else {
          const key = args[0];
          const count = db.bitmap.bitCount(key);
          response = `+${count}\r\n`;
        }
        break;

      case "BITOP":
        if (args.length < 3) {
          response =
            "-ERROR: BITOP requires an operation, destination key, and at least one source key\r\n";
        } else {
          const operation = args[0];
          const destKey = args[1];
          const sourceKeys = args.slice(2);
          db.bitmap.bitOp(operation, destKey, ...sourceKeys);
          response = "+OK\r\n";
        }
        break;

      // BITFIELD
      case "BITFIELD":
        if (args.length < 3) {
          response =
            "-ERROR: BITFIELD requires a key and at least one operation\r\n";
        } else {
          const key = args[0];
          let overflowMode = "WRAP"; // Default mode
          let operations = [];

          let i = 1;
          while (i < args.length) {
            const token = args[i].toUpperCase();

            if (token === "OVERFLOW") {
              overflowMode = args[i + 1]?.toUpperCase();
              if (!["WRAP", "SAT", "FAIL"].includes(overflowMode)) {
                response = `-ERROR: Invalid overflow mode: ${overflowMode}\r\n`;
                break;
              }
              i += 2;
            } else if (
              token === "SET" ||
              token === "GET" ||
              token === "INCRBY"
            ) {
              const op = token;
              const type = args[i + 1];
              const offset = args[i + 2];
              const value = op === "GET" ? null : args[i + 3];
              console.log(op + " " + value);
              if (!type || !offset || (op !== "GET" && value === undefined)) {
                response = `-ERROR: Incomplete ${op} operation\r\n`;
                break;
              }

              const operation =
                op === "GET" ? [op, type, offset] : [op, type, offset, value];

              operations.push(operation);
              i += op === "GET" ? 3 : 4;
            } else {
              response = `-ERROR: Unexpected token: ${token}\r\n`;
              break;
            }
          }

          if (!response) {
            const results = db.bitfield.executeBitfieldOperations(
              key,
              operations,
              overflowMode
            );
            response = `+${JSON.stringify(results)}\r\n`;
          }
        }
        break;
      // HyperLogLog Commands
      case "PFADD":
        if (args.length < 2) {
          response =
            "-ERROR: PFADD requires a key and at least one element\r\n";
        } else {
          const key = args[0];
          const elements = args.slice(1);
          db.hll.pfAdd(key, ...elements);
          response = "+OK\r\n";
        }
        break;
      case "PFCOUNT":
        if (args.length !== 1) {
          response = "-ERROR: PFCOUNT requires exactly one key\r\n";
        } else {
          const key = args[0];
          const count = db.hll.pfCount(key);
          response = `:${count}\r\n`;
        }
        break;
      case "PFMERGE":
        if (args.length < 2) {
          response =
            "-ERROR: PFMERGE requires a destination key and at least one source key\r\n";
        } else {
          const destKey = args[0];
          const sourceKeys = args.slice(1);
          db.hll.pfMerge(destKey, ...sourceKeys);
          response = "+OK\r\n";
        }
        break;

      // Time Series Commands
      case "TS.CREATE":
        if (args.length !== 1) {
          response = "-ERROR: TS.CREATE requires a key\r\n";
        } else {
          const key = args[0];
          try {
            db.ts.create(key);
            response = "+OK\r\n";
          } catch (error) {
            response = `${error.message}\r\n`;
          }
        }
        break;
      case "TS.ADD":
        if (args.length < 3) {
          response = "-ERROR: TS.ADD requires a key, timestamp, and value\r\n";
        } else {
          const key = args[0];
          const timestamp = Number(args[1]);
          const value = Number(args[2]);
          try {
            db.ts.add(key, timestamp, value);
            response = "+OK\r\n";
          } catch (error) {
            response = `${error.message}\r\n`;
          }
        }
        break;
      case "TS.RANGE":
        if (args.length < 3) {
          response =
            "-ERROR: TS.RANGE requires a key, start timestamp, and end timestamp\r\n";
        } else {
          const key = args[0];
          const startTime = Number(args[1]);
          const endTime = Number(args[2]);
          try {
            const values = db.ts.range(key, startTime, endTime);
            response = `+${JSON.stringify(values)}\r\n`;
          } catch (error) {
            response = `${error.message}\r\n`;
          }
        }
        break;
      case "TS.GET":
        if (args.length !== 1) {
          response = "-ERROR: TS.GET requires exactly one key\r\n";
        } else {
          const key = args[0];
          const value = db.ts.get(key);
          response =
            value !== null ? `+${JSON.stringify(value)}\r\n` : "$-1\r\n"; // Return (nil) if key not found
        }
        break;
      case "TS.DOWNSAMPLE":
        if (args.length < 2) {
          response = "-ERROR: TS.DOWNSAMPLE requires a key and an interval\r\n";
        } else {
          const key = args[0];
          const interval = Number(args[1]);
          try {
            const value = db.ts.downsample(key, interval);
            response = `+${JSON.stringify(value)}\r\n`;
          } catch (error) {
            response = `${error.message}\r\n`;
          }
        }
        break;

      case "TS.AGGREGATE":
        if (args.length < 4) {
          response =
            "-ERROR: TS.AGGREGATE requires a key, start time, end time, and aggregation type\r\n";
        } else {
          const key = args[0];
          const startTime = Number(args[1]);
          const endTime = Number(args[2]);
          const aggType = args[3];
          try {
            const values = db.ts.aggregate(key, startTime, endTime, aggType);
            response = `+${values}\r\n`;
          } catch (error) {
            response = `${error.message}\r\n`;
          }
        }
        break;

      // TTL Commands
      case "EXPIRE":
        if (args.length < 2) {
          response = "-ERROR: EXPIRE requires a key and a timeout\r\n";
        } else {
          const key = args[0];
          const timeout = Number(args[1]);
          const expire = db.ttl.expire(key, timeout);
          response = `${expire}\r\n`;
        }
        break;
      case "PEXPIRE":
        if (args.length < 2) {
          response = "-ERROR: PEXPIRE requires a key and a timeout\r\n";
        } else {
          const key = args[0];
          const timeout = Number(args[1]);
          const pexpire = db.ttl.pexpire(key, timeout);
          response = `${pexpire}\r\n`;
        }
        break;
      case "TTL":
        if (args.length !== 1) {
          response = "-ERROR: TTL requires exactly one key\r\n";
        } else {
          const key = args[0];
          const ttl = db.ttl.ttl(key);
          response = `:${ttl}\r\n`;
        }
        break;
      case "PTTL":
        if (args.length !== 1) {
          response = "-ERROR: PTTL requires exactly one key\r\n";
        } else {
          const key = args[0];
          const ttl = db.ttl.pttl(key);
          response = `:${ttl}\r\n`;
        }
        break;
      case "PERSIST":
        if (args.length !== 1) {
          response = "-ERROR: PERSIST requires exactly one key\r\n";
        } else {
          const key = args[0];
          const result = db.ttl.persist(key);
          response = `:${result}\r\n`;
        }
        break;

      // Transactions Command
      case "MULTI":
        if (args.length !== 0) {
          response = "-ERROR: Enter a client id for your transaction\r\n";
        }
        clientId = args[0]; // Get the client ID for the transaction
        db.transaction.multi(clientId); // Start a transaction
        response = "+OK\r\n";
        step = "QUEUE";
        break;

      // PUB/SUB Commands
      case "SUBSCRIBE":
        if (args.length < 1) {
          response = "-ERROR: SUBSCRIBE requires at least one channel\r\n";
        } else {
          const channels = args[0];
          response = "+OK\r\n";
          db.subscribe(socket, channels); // Subscribe to channels
        }
        break;
      case "UNSUBSCRIBE":
        if (args.length < 1) {
          response = "-ERROR: UNSUBSCRIBE requires at least one channel\r\n";
        } else {
          const channels = args[0];
         const result = db.unsubscribe(socket, channels); // Unsubscribe from channels
          response = `${result}\r\n`;
        }
        break;

      case "PUBLISH":
        if (args.length < 2) {
          response = "-ERROR: PUBLISH requires a channel and a message\r\n";
        } else {
          const channel = args[0];
          const message = args.slice(1).join(" ");
          response = "+OK\r\n";
          db.publish(channel, message); // Publish a message to a channel
        }
        break;
      // SAVE
      case "SAVE":
        db.saveSnapshot(); // Save the current state to a snapshot file
        response = "+OK\r\n";
        break;
      case "DEL":
        if (args.length < 1) {
          response = "-ERROR: DEL requires at least one key\r\n";
        } else {
          const keys = args;
          response = "+OK\r\n";
          db.store.remove(keys);
        }
        break;
      case "CLEAR":
        db.clearStore(); // Clear the in-memory store
        db.clearAOF();
        db.clearSnapshot(); // Clear the snapshot file
        response = "+OK\r\n";
        break;

      case "QUIT":
        response = "+Goodbye!\r\n";
        socket.write(response);
        db.clearStore();
        db.clearSnapshot();
        process.exit(0);

      default:
        response = "-ERROR: Unknown command\r\n";
    }

    socket.write(response);
  });

  socket.on("end", () => {
    console.log("Client disconnected.");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
