import net from "net";
import db from "../db.js"; // Your database module

const PORT = 6379; // Redis default port

const displayMenu = () => {
  return `\n=== Redis-like Interactive Menu ===
1. SET a key-value pair (String)
2. GET a value by key (String)
3. APPEND to a key (String)
4. STRLEN of a key (String)
5. INCR (Increment integer value)
6. DECR (Decrement integer value)
7. INCRBY (Increment by a specific value)
8. DECRBY (Decrement by a specific value)
9. GETRANGE (Substring retrieval)
10. SETRANGE (Overwrite part of a string)
11. JSON.SET (JSON)
12. JSON.GET (JSON)
13. JSON.DEL (JSON)
14. JSON.ARRAPPEND (JSON)
15. LPUSH (List)
16. RPUSH (List)
17. LPOP (List)
18. RPOP (List)
19. LRANGE (List)
20. LINDEX (List)
21. LSET (List)
22. SADD (Set)
23. SREM (Set)
24. SISMEMBERS (Set)
25. SMEMBERS (Set)
26. SINTER (Set)
27. SUNION (Set)
28. SDIFF (Set)
29. HSET (Hash)
30. HGET (Hash)
31. HMSET (Hash)
32. HGETALL (Hash)
33. HDEL (Hash)
34. HEXISTS (Hash)
35. ZADD (Sorted Set)
36. ZRANGE (Sorted Set)
37. ZRANK (Sorted Set)
38. ZRANGEBYSCORE (Sorted Set)
39. XADD (Stream)
40. XREAD (Stream)
41. XRANGE (Stream)
42. XLEN (Stream)
43. XGROUP CREATE (Stream)
44. XREADGROUP (Stream)
45. XACK (Stream)
46. GEOADD (Geospatial)
47. GEOSEARCH (Geospatial)
48. GEODIST (Geospatial)
49. BITMAP SETBIT
50. BITMAP GETBIT
51. BITMAP BITCOUNT
52. BITMAP BITOP
53. BITFIELD SET
54. BITFIELD GET
55. BITFIELD INCRBY
56. BITFIELD
57. PFADD (HyperLogLog)
58. PFCOUNT (HyperLogLog)
59. PFMERGE (HyperLogLog)
60. TS.CREATE (Time Series)
61. TS.ADD (Time Series)
62. TS.GET (Time Series)
63. TS.RANGE (Time Series)
64. TS.DOWNSAMPLE (Time Series)
65. TS.AGGREGATE (Time Series)
66. EXPIRY (Set expiration time)
67. PEXPIRE (Set expiration time in milliseconds)
68. TTL (Get time to live)
69. PTTL (Get time to live in milliseconds)
70. PERSIST (Remove expiration time)
71. MULTI (Start transaction)
72. SUBSCRIBE (Pub/Sub)
73. PUBLISH (Pub/Sub)
74. UNSUBSCRIBE (Pub/Sub)
75. Save snapshot
76. Quit
Enter your choice: `;
};

const server = net.createServer((socket) => {
  console.log("Client connected");

  // Send the menu to the client (Ncat)
  socket.write(displayMenu());

  let step = null; // Track what the user is doing
  let tempKey = null; // Temporary storage for multi-step inputs
  let tempField = null; // Temporary storage for multi-step inputs
  let tempMembers = []; // Temporary storage for multi-step inputs
  let tempScoreValuePairs = []; // Temporary storage for multi-step inputs
  let tempFieldValues = []; // Temporary storage for multi-step inputs
  let tempLongitude = null;
  let tempLatitude = null;
  let tempMember = null;
  let tempName1 = null;
  let tempName2 = null;

  let xreadCount = null; // Declare globally
  let startID = null; // Declare globally
  let endID = null; // Declare globally

  let group = null;
  let tempOp = null;
  let tempOffset = null;
  let tempStart = null;
  let tempEnd = null;
  let tempMin = null;
  let tempMax = null;
  let tempIndex = null;
  let tempPath = null;
  let tempFields = null;
  let tempJsonValue = null;
  let tempValue = null;
  let tempType = null;
  let tempOverflow = null;
  let clientId = null;
  let channel = null;
  let message = null;

  socket.on("data", (data) => {
    const input = data.toString().trim();

    // Handle multi-step input

    // String commands
    if (step === "set_key") {
      tempKey = input;
      socket.write("Enter value: ");
      step = "set_value";
      return;
    } else if (step === "set_value") {
      db.string.set(tempKey, input);
      // db.appendToAOF("db.string.set", { key: tempKey, value: input });
      socket.write(`+OK (Set ${tempKey} = ${input})\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "get_key") {
      const value = db.get(input);
      socket.write(value !== null ? `+${value}\r\n` : "$-1\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "append_key") {
      tempKey = input;
      socket.write("Enter value to append: ");
      step = "append_value";
      return;
    } else if (step === "append_value") {
      db.string.append(tempKey, input);
      // db.appendToAOF("db.string.append", { key: tempKey, value: input });
      socket.write(`+OK (Appended ${input} to ${tempKey})\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "strlen_key") {
      const length = db.string.strlen(input);
      socket.write(`:${length}\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "incr_key") {
      const newValue = db.string.incr(input);
      socket.write(`:${newValue}\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "decr_key") {
      const newValue = db.string.decr(input);
      socket.write(`:${newValue}\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "incrby_key") {
      tempKey = input;
      socket.write("Enter increment value: ");
      step = "incrby_value";
      return;
    } else if (step === "incrby_value") {
      const newValue = db.string.incrBy(tempKey, Number(input));
      socket.write(`:${newValue}\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "decrby_key") {
      tempKey = input;
      socket.write("Enter decrement value: ");
      step = "decrby_value";
      return;
    } else if (step === "decby_value") {
      const newValue = db.string.decBy(tempKey, Number(input));
      socket.write(`:${newValue}\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "getrange_key") {
      tempKey = input;
      socket.write("Enter start index: ");
      step = "getrange_start";
      return;
    } else if (step === "getrange_start") {
      tempStart = Number(input);
      socket.write("Enter end index: ");
      step = "getrange_end";
      return;
    } else if (step === "getrange_end") {
      const value = db.string.getRange(tempKey, tempStart, Number(input));
      socket.write(`+${value}\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "setrange_key") {
      tempKey = input;
      socket.write("Enter offset: ");
      step = "setrange_offset";
      return;
    } else if (step === "setrange_offset") {
      tempOffset = Number(input);
      socket.write("Enter new value: ");
      step = "setrange_value";
      return;
    } else if (step === "setrange_value") {
      const newLength = db.string.setRange(tempKey, tempOffset, input);
      socket.write(`:${newLength}\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    }

    // JSON commands
    else if (step === "json_set_key") {
      tempKey = input;
      socket.write("Enter JSON value: ");
      step = "json_set_value";
      return;
    } else if (step === "json_set_value") {
      try {
        db.json.set(tempKey, "$", input);
        db.appendToAOF("db.json.set", {
          key: tempKey,
          value: input,
        });
        socket.write("+OK\r\n");
      } catch (error) {
        socket.write("-ERR Invalid JSON value\r\n");
      } finally {
        socket.write(displayMenu());
        step = null;
        tempKey = null;
        tempJsonValue = null;
      }
      return;
    } else if (step === "json_get_key") {
      const jsonValue = db.json.get(input);
      if (jsonValue !== null) {
        socket.write(`+${JSON.stringify(jsonValue)}\r\n`);
      } else {
        socket.write("$-1\r\n");
      }
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "json_del_key") {
      const deleted = db.json.del(input);
      socket.write(deleted ? ":1\r\n" : ":0\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "json_arrappend_key") {
      tempKey = input;
      socket.write("Enter path (e.g., $.array): ");
      step = "json_arrappend_path";
      return;
    } else if (step === "json_arrappend_path") {
      tempPath = input;
      socket.write("Enter value to append: ");
      step = "json_arrappend_value";
      return;
    } else if (step === "json_arrappend_value") {
      try {
        const newLength = db.json.arrAppend(tempKey, tempPath, input);
        socket.write(`:${newLength}\r\n`);
      } catch (error) {
        socket.write("-ERR JSON array append failed\r\n");
      } finally {
        socket.write(displayMenu());
        step = null;
        tempKey = null;
        tempPath = null;
      }
      return;
    }

    // List commands
    else if (step === "lpush_key") {
      tempKey = input;
      socket.write("Enter value to push left: ");
      step = "lpush_value";
      return;
    } else if (step === "lpush_value") {
      db.list.lpush(tempKey, input);
      socket.write("+OK\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "rpush_key") {
      tempKey = input;
      socket.write("Enter value to push right: ");
      step = "rpush_value";
      return;
    } else if (step === "rpush_value") {
      db.list.rpush(tempKey, input);
      socket.write("+OK\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "lpop_key") {
      const value = db.list.lpop(input);
      socket.write(value !== null ? `+${value}\r\n` : "$-1\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "rpop_key") {
      const value = db.list.rpop(input);
      socket.write(value !== null ? `+${value}\r\n` : "$-1\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "lrange_key") {
      tempKey = input;
      socket.write("Enter start index: ");
      step = "lrange_start";
      return;
    } else if (step === "lrange_start") {
      tempStart = Number(input);
      socket.write("Enter end index: ");
      step = "lrange_end";
      return;
    } else if (step === "lrange_end") {
      const end = Number(input);
      const range = db.list.lrange(tempKey, tempStart, end);
      socket.write(`+${JSON.stringify(range)}\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "lindex_key") {
      tempKey = input;
      socket.write("Enter index: ");
      step = "lindex_value";
      return;
    } else if (step === "lindex_value") {
      const index = Number(input);
      const value = db.list.lindex(tempKey, index);
      socket.write(value !== null ? `+${value}\r\n` : "$-1\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "lset_key") {
      tempKey = input;
      socket.write("Enter index: ");
      step = "lset_index";
      return;
    } else if (step === "lset_index") {
      tempIndex = Number(input);
      socket.write("Enter new value: ");
      step = "lset_value";
      return;
    } else if (step === "lset_value") {
      db.list.lset(tempKey, tempIndex, input);
      socket.write("+OK\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "sadd_key") {
      tempKey = input;
      socket.write("Enter value to add: ");
      step = "sadd_value";
      return;
    } else if (step === "sadd_value") {
      db.set.sadd(tempKey, input);
      socket.write("+OK\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "srem_key") {
      tempKey = input;
      socket.write("Enter value to remove: ");
      step = "srem_value";
      return;
    } else if (step === "srem_value") {
      db.set.srem(tempKey, input);
      socket.write("+OK\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "sismember_key") {
      tempKey = input;
      socket.write("Enter value to check: ");
      step = "sismember_value";
      return;
    } else if (step === "sismember_value") {
      const exists = db.set.sismember(tempKey, input);
      socket.write(exists ? ":1\r\n" : ":0\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "smembers_key") {
      const members = db.set.smembers(input);
      socket.write(`+${JSON.stringify(members)}\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "sinter_key1") {
      tempKey = input;
      socket.write("Enter second set key: ");
      step = "sinter_key2";
      return;
    } else if (step === "sinter_key2") {
      const result = db.set.sinter(tempKey, input);
      socket.write(`+${JSON.stringify(result)}\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "sunion_key1") {
      tempKey = input;
      socket.write("Enter second set key: ");
      step = "sunion_key2";
      return;
    } else if (step === "sunion_key2") {
      const result = db.set.sunion(tempKey, input);
      socket.write(`+${JSON.stringify(result)}\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "sdiff_key1") {
      tempKey = input;
      socket.write("Enter second set key: ");
      step = "sdiff_key2";
      return;
    } else if (step === "sdiff_key2") {
      const result = db.set.sdiff(tempKey, input);
      socket.write(`+${JSON.stringify(result)}\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    }

    // hash commands
    else if (step === "hset_key") {
      tempKey = input;
      socket.write("Enter field name: ");
      step = "hset_field";
      return;
    } else if (step === "hset_field") {
      tempField = input;
      socket.write("Enter value: ");
      step = "hset_value";
      return;
    } else if (step === "hset_value") {
      db.hash.hset(tempKey, tempField, input);
      socket.write("+OK\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "hget_key") {
      tempKey = input;
      socket.write("Enter field name: ");
      step = "hget_field";
      return;
    } else if (step === "hget_field") {
      const value = db.hash.hget(tempKey, input);
      socket.write(value !== null ? `+${value}\r\n` : "$-1\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "hmset_key") {
      tempKey = input;
      tempFields = {};
      socket.write("Enter field name (or type 'done' to finish): ");
      step = "hmset_field";
      return;
    } else if (step === "hmset_field") {
      if (input.toLowerCase() === "done") {
        db.hash.hmset(tempKey, tempFields);
        socket.write("+OK\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      tempField = input;
      socket.write("Enter value: ");
      step = "hmset_value";
      return;
    } else if (step === "hmset_value") {
      tempFields[tempField] = input;
      socket.write("Enter next field name (or type 'done' to finish): ");
      step = "hmset_field";
      return;
    } else if (step === "hgetall_key") {
      const hashData = db.hash.hgetall(input);
      socket.write(hashData ? `+${JSON.stringify(hashData)}\r\n` : "$-1\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "hdel_key") {
      tempKey = input;
      socket.write("Enter field name to delete: ");
      step = "hdel_field";
      return;
    } else if (step === "hdel_field") {
      db.hash.hdel(tempKey, input);
      socket.write("+OK\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "hexists_key") {
      tempKey = input;
      socket.write("Enter field name to check: ");
      step = "hexists_field";
      return;
    } else if (step === "hexists_field") {
      const exists = db.hash.hexists(tempKey, input);
      socket.write(exists ? ":1\r\n" : ":0\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    }

    // Sorted Set commands
    else if (step === "zadd_key") {
      tempKey = input;
      socket.write("Enter score: ");
      step = "zadd_score";
      return;
    } else if (step === "zadd_score") {
      tempScore = parseFloat(input);
      if (isNaN(tempScore)) {
        socket.write("-ERR Invalid score\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      socket.write("Enter member name: ");
      step = "zadd_member";
      return;
    } else if (step === "zadd_member") {
      db.zset.zadd(tempKey, tempScore, input);
      socket.write("+OK\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "zrange_key") {
      tempKey = input;
      socket.write("Enter start index: ");
      step = "zrange_start";
      return;
    } else if (step === "zrange_start") {
      tempStart = parseInt(input);
      if (isNaN(tempStart)) {
        socket.write("-ERR Invalid start index\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      socket.write("Enter end index: ");
      step = "zrange_end";
      return;
    } else if (step === "zrange_end") {
      tempEnd = parseInt(input);
      if (isNaN(tempEnd)) {
        socket.write("-ERR Invalid end index\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      const members = db.zset.zrange(tempKey, tempStart, tempEnd);
      socket.write(`+${JSON.stringify(members)}\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "zrank_key") {
      tempKey = input;
      socket.write("Enter member name: ");
      step = "zrank_member";
      return;
    } else if (step === "zrank_member") {
      const rank = db.zset.zrank(tempKey, input);
      socket.write(rank !== null ? `:${rank}\r\n` : "$-1\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "zrem_key") {
      tempKey = input;
      socket.write("Enter member name to remove: ");
      step = "zrem_member";
      return;
    } else if (step === "zrem_member") {
      db.zset.zrem(tempKey, input);
      socket.write("+OK\r\n");
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "zrangebyscore_key") {
      tempKey = input;
      socket.write("Enter min score: ");
      step = "zrangebyscore_min";
      return;
    } else if (step === "zrangebyscore_min") {
      tempMin = parseFloat(input);
      if (isNaN(tempMin)) {
        socket.write("-ERR Invalid min score\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      socket.write("Enter max score: ");
      step = "zrangebyscore_max";
      return;
    } else if (step === "zrangebyscore_max") {
      tempMax = parseFloat(input);
      if (isNaN(tempMax)) {
        socket.write("-ERR Invalid max score\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      const members = db.zset.zrangebyscore(tempKey, tempMin, tempMax);
      socket.write(`+${JSON.stringify(members)}\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "xadd_key") {
      tempKey = input;
      socket.write(
        "Enter field-value pairs (comma-separated, e.g., name,Alice,age,25): "
      );
      step = "xadd_pairs";
      return;
    } else if (step === "xadd_pairs") {
      tempFieldValues = input.split(",").map((p) => p.trim());
      const xaddResult = db.stream.xadd(tempKey, ...tempFieldValues);
      db.appendToAOF("db.stream.xadd", {
        key: tempKey,
        fieldValues: tempFieldValues,
      });
      socket.write(`+${xaddResult}\r\n`);
      socket.write(displayMenu());
      step = null;
      tempFieldValues = [];
      return;
    } else if (step === "xread_count") {
      xreadCount = parseInt(input);
      socket.write("Enter stream: ");
      step = "xread_stream";
      return;
    } else if (step === "xread_stream") {
      const xreadResult = db.stream.xread(xreadCount, input);
      socket.write(`*${xreadResult.length}\r\n`);
      xreadResult.forEach((entry) => {
        socket.write(`*2\r\n`);
        socket.write(`$2\r\nid\r\n`);
        socket.write(`$${entry.id.length}\r\n${entry.id}\r\n`);
        socket.write(`$4\r\ndata\r\n`);
        socket.write(`*${Object.keys(entry.data).length * 2}\r\n`);
        Object.entries(entry.data).forEach(([key, value]) => {
          socket.write(`$${key.length}\r\n${key}\r\n`);
          socket.write(`$${value.length}\r\n${value}\r\n`);
        });
      });
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "xrange_stream") {
      tempKey = input;
      socket.write("Enter start ID: ");
      step = "xrange_startID";
      return;
    } else if (step === "xrange_startID") {
      startID = input;
      socket.write("Enter end ID: ");
      step = "xrange_endID";
      return;
    } else if (step === "xrange_endID") {
      endID = input;
      const xrangeResult = db.stream.xrange(tempKey, startID, endID);
      socket.write(`*${xrangeResult.length}\r\n`);
      xrangeResult.forEach((entry) => {
        socket.write(`*2\r\n`);
        socket.write(`$2\r\nid\r\n`);
        socket.write(`$${entry.id.length}\r\n${entry.id}\r\n`);
        socket.write(`$4\r\ndata\r\n`);
        socket.write(`*${Object.keys(entry.data).length * 2}\r\n`);
        Object.entries(entry.data).forEach(([key, value]) => {
          socket.write(`$${key.length}\r\n${key}\r\n`);
          socket.write(`$${value.length}\r\n${value}\r\n`);
        });
      });
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    } else if (step === "xlen_stream") {
      const xlenResult = db.stream.xlen(input);
      socket.write(`:${xlenResult}\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "xgroup_stream") {
      tempKey = input;
      socket.write("Enter group: ");
      step = "xgroup_group";
      return;
    } else if (step === "xgroup_group") {
      db.stream.xgroupCreate(tempKey, input);
      socket.write("+OK\r\n");
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    } else if (step === "xreadgroup_stream") {
      tempKey = input;
      socket.write("Enter group: ");
      step = "xreadgroup_group";
      return;
    } else if (step === "xreadgroup_group") {
      group = input;
      socket.write("Enter count: ");
      step = "xreadgroup_count";
      return;
    } else if (step === "xreadgroup_count") {
      const count = parseInt(input);
      const xreadgroupResult = db.stream.xreadgroup(tempKey, group, count);
      socket.write(`*${xreadgroupResult.length}\r\n`);
      xreadgroupResult.forEach((entry) => {
        socket.write(`*2\r\n`);
        socket.write(`$2\r\nid\r\n`);
        socket.write(`$${entry.id.length}\r\n${entry.id}\r\n`);
        socket.write(`$4\r\ndata\r\n`);
        socket.write(`*${Object.keys(entry.data).length * 2}\r\n`);
        Object.entries(entry.data).forEach(([key, value]) => {
          socket.write(`$${key.length}\r\n${key}\r\n`);
          socket.write(`$${value.length}\r\n${value}\r\n`);
        });
      });
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    } else if (step === "xack_stream") {
      tempKey = input;
      socket.write("Enter group: ");
      step = "xack_group";
      return;
    } else if (step === "xack_group") {
      group = input;
      socket.write("Enter id: ");
      step = "xack_id";
      return;
    } else if (step === "xack_id") {
      const id = input;
      const xackResult = db.stream.xack(tempKey, group, id);
      socket.write(`:${xackResult ? 1 : 0}\r\n`);
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    }

    // Geospatial commands
    else if (step === "geoadd_key") {
      tempKey = input;
      socket.write("Enter longitude: ");
      step = "geoadd_longitude";
      return;
    } else if (step === "geoadd_longitude") {
      tempLongitude = parseFloat(input);
      socket.write("Enter latitude: ");
      step = "geoadd_latitude";
      return;
    } else if (step === "geoadd_latitude") {
      tempLatitude = parseFloat(input);
      socket.write("Enter member: ");
      step = "geoadd_member";
      return;
    } else if (step === "geoadd_member") {
      tempMember = input;
      db.geo.geoadd(tempKey, tempLongitude, tempLatitude, tempMember);
      db.appendToAOF("db.geo.geoadd", {
        key: tempKey,
        lat: tempLatitude,
        lon: tempLongitude,
        name: tempMember,
      });
      socket.write(`:1\r\n`);
      socket.write(displayMenu());
      step = null;
      tempLongitude = null;
      tempLatitude = null;
      tempMember = null;
      return;
    } else if (step === "geosearch_key") {
      tempKey = input;
      socket.write("Enter longitude: ");
      step = "geosearch_longitude";
      return;
    } else if (step === "geosearch_longitude") {
      tempLongitude = parseFloat(input);
      socket.write("Enter latitude: ");
      step = "geosearch_latitude";
      return;
    } else if (step === "geosearch_latitude") {
      tempLatitude = parseFloat(input);
      socket.write("Enter radius: ");
      step = "geosearch_radius";
      return;
    } else if (step === "geosearch_radius") {
      const radius = parseFloat(input);
      const geosearchResult = db.geo.geosearch(
        tempKey,
        tempLatitude,
        tempLongitude,
        radius
      );
      socket.write(`*${geosearchResult.length}\r\n`);
      geosearchResult.forEach((member) => {
        socket.write(`*4\r\n`);
        socket.write(`$4\r\nname\r\n`);
        socket.write(`$${member.name.length}\r\n${member.name}\r\n`);
        socket.write(`$3\r\nlat\r\n`);
        socket.write(`$${member.lat.toString().length}\r\n${member.lat}\r\n`);
        socket.write(`$3\r\nlon\r\n`);
        socket.write(`$${member.lon.toString().length}\r\n${member.lon}\r\n`);
        socket.write(`$8\r\ndistance\r\n`);
        socket.write(`$${member.distance.length}\r\n${member.distance}\r\n`);
      });
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      tempLongitude = null;
      tempLatitude = null;
      return;
    } else if (step === "geodist_key") {
      tempKey = input;
      socket.write("Enter name1: ");
      step = "geodist_name1";
      return;
    } else if (step === "geodist_name1") {
      tempName1 = input;
      socket.write("Enter name2: ");
      step = "geodist_name2";
      return;
    } else if (step === "geodist_name2") {
      tempName2 = input;
      const geodistResult = db.geo.geodist(tempKey, tempName1, tempName2);
      socket.write(
        geodistResult !== null ? `+${geodistResult}\r\n` : "$-1\r\n"
      );
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      tempName1 = null;
      tempName2 = null;
      return;
    }

    // Bitmap commands
    else if (step === "setbit_key") {
      tempKey = input;
      step = "setbit_offset";
      socket.write("Enter bit offset:\r\n");
      return;
    } else if (step === "setbit_offset") {
      tempOffset = parseInt(input);
      if (isNaN(tempOffset) || tempOffset < 0) {
        socket.write("-ERR: Invalid offset\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      step = "setbit_value";
      socket.write("Enter bit value (0 or 1):\r\n");
      return;
    } else if (step === "setbit_value") {
      const bitValue = parseInt(input);
      if (bitValue !== 0 && bitValue !== 1) {
        socket.write("-ERR: Invalid bit value\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }

      db.bitmap.setBit(tempKey, tempOffset, bitValue);
      socket.write(`+Bit set at offset ${tempOffset} in key '${tempKey}'\r\n`);
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      tempOffset = null;
      return;
    } else if (step === "getbit_key") {
      tempKey = input;
      step = "getbit_offset";
      socket.write("Enter bit offset:\r\n");
      return;
    } else if (step === "getbit_offset") {
      const offset = parseInt(input);
      if (isNaN(offset) || offset < 0) {
        socket.write("-ERR: Invalid offset\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      const bitValue = db.bitmap.getBit(tempKey, offset);
      socket.write(
        `+Bit at offset ${offset} in key '${tempKey}': ${bitValue}\r\n`
      );
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    } else if (step === "bitcount_key") {
      tempKey = input;
      const count = db.bitmap.bitCount(tempKey);
      socket.write(`+Number of set bits in '${tempKey}': ${count}\r\n`);
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    } else if (step === "bitop_op") {
      tempOp = input.trim().toUpperCase();
      console.log(tempOp);
      if (!["AND", "OR", "XOR", "NOT"].includes(tempOp)) {
        socket.write("-ERR: Invalid operation (use AND, OR, XOR, NOT)\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      step = "bitop_destkey";
      socket.write("Enter destination key:\r\n");
      return;
    } else if (step === "bitop_destkey") {
      tempKey = input;
      step = "bitop_keys";
      socket.write("Enter source keys (comma-separated):\r\n");
      return;
    } else if (step === "bitop_keys") {
      const keys = input.split(",").map((key) => key.trim());
      const resultLength = db.bitmap.bitOp(tempOp, tempKey, ...keys);
      socket.write(
        `+Bit operation '${tempOp}' applied. Result length: ${resultLength}\r\n`
      );
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      tempOp = null;
      return;
    } else if (step === "bitfield_set_key") {
      tempKey = input;
      socket.write("Enter bitfield type (u8, s8, u16, s16, u32, s32): ");
      step = "bitfield_type";
      return;
    } else if (step === "bitfield_type") {
      tempType = input.toLowerCase();
      socket.write("Enter offset: ");
      step = "bitfield_offset";
      return;
    } else if (step === "bitfield_offset") {
      tempOffset = parseInt(input);
      if (isNaN(tempOffset) || tempOffset < 0) {
        socket.write("-ERR: Invalid offset\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      socket.write("Enter value: ");
      step = "bitfield_value";
      return;
    } else if (step === "bitfield_value") {
      tempValue = parseInt(input);
      if (isNaN(tempValue)) {
        socket.write("-ERR: Invalid value\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      socket.write("Enter overflow mode (WRAP, SAT, FAIL): ");
      step = "bitfield_overflow";
      return;
    } else if (step === "bitfield_overflow") {
      tempOverflow = input.trim().toUpperCase();
      if (!["WRAP", "SAT", "FAIL"].includes(tempOverflow)) {
        tempOverflow = "WRAP";
      }

      // Execute the setBitfield command
      db.bitfield.setBitfield(
        tempKey,
        tempType,
        tempOffset,
        tempValue,
        tempOverflow
      );
      socket.write("+OK\r\n");

      socket.write(displayMenu());
      step = null;
      tempKey = null;
      tempType = null;
      tempOffset = null;
      tempValue = null;
      tempOverflow = null;
      return;
    } else if (step === "get_bitfield") {
      tempKey = input;
      // For getting the bitfield
      socket.write("Enter bitfield type (u8, s8, u16, s16, u32, s32): ");
      step = "get_bitfield_type";
      return;
    } else if (step === "get_bitfield_type") {
      tempType = input.toLowerCase();
      socket.write("Enter offset: ");
      step = "get_bitfield_offset";
      return;
    } else if (step === "get_bitfield_offset") {
      tempOffset = parseInt(input);
      if (isNaN(tempOffset) || tempOffset < 0) {
        socket.write("-ERR: Invalid offset\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }

      // Fetch the bitfield value
      console.log(
        `Fetching bitfield for key: ${tempKey}, type: ${tempType}, offset: ${tempOffset}`
      );
      const result = db.bitfield.getBitfield(tempKey, tempType, tempOffset);
      socket.write(`+${result}\r\n`);
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      tempType = null;
      tempOffset = null;
      return;
    } else if (step === "incrby_bitfield") {
      // For the incrBy operation
      socket.write("Enter bitfield type (u8, s8, u16, s16, u32, s32): ");
      step = "incrby_type";
      return;
    } else if (step === "incrby_type") {
      tempType = input.toLowerCase();
      socket.write("Enter offset: ");
      step = "incrby_offset";
      return;
    } else if (step === "incrby_offset") {
      tempOffset = parseInt(input);
      if (isNaN(tempOffset) || tempOffset < 0) {
        socket.write("-ERR: Invalid offset\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      socket.write("Enter increment value: ");
      step = "incrby_value";
      return;
    } else if (step === "incrby_value") {
      tempValue = parseInt(input);
      if (isNaN(tempValue)) {
        socket.write("-ERR: Invalid value\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      socket.write("Enter overflow mode (WRAP, SAT, FAIL): ");
      step = "incrby_overflow";
      return;
    } else if (step === "incrby_overflow") {
      tempOverflow = input.toUpperCase();
      if (!["WRAP", "SAT", "FAIL"].includes(tempOverflow)) {
        socket.write("-ERR: Invalid overflow mode (use WRAP, SAT, FAIL)\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }

      // Execute the incrByBitfield command
      const result = db.bitfield.incrByBitfield(
        tempKey,
        tempType,
        tempOffset,
        tempValue,
        tempOverflow
      );
      socket.write(`:${result}\r\n`);

      socket.write(displayMenu());
      step = null;
      tempKey = null;
      tempType = null;
      tempOffset = null;
      tempValue = null;
      tempOverflow = null;
      return;
    } else if (step === "bitfield_operations") {
      // Handle EXECUTE operation where multiple bitfield commands can be given
      const operations = input.split(";");
      const parsedOperations = operations.map((op) => {
        const parts = op.trim().split(" ");
        if (parts.length < 3) {
          socket.write(
            "-ERR: Invalid operation format. Use SET|GET|INCRBY <type> <offset> <value>\r\n"
          );
          socket.write(displayMenu());
          step = null;
          return;
        }

        const [operation, type, offset, value] = parts;
        return [operation.toUpperCase(), type.toLowerCase(), offset, value];
      });

      // Execute multiple operations
      try {
        const results = db.bitfield.executeBitfieldOperations(
          tempKey,
          parsedOperations
        );
        results.forEach((result) => {
          socket.write(`+${result}\r\n`);
        });
      } catch (error) {
        socket.write("-ERR: " + error.message + "\r\n");
      }

      socket.write(displayMenu());
      step = null;
      return;
    }

    // Hyperloglog commands
    else if (step === "pfadd_key") {
      tempKey = input;
      step = "pfadd_elements";
      socket.write("Enter elements (comma-separated):\r\n");
      return;
    } else if (step === "pfadd_elements") {
      const elements = input.split(",").map((el) => el.trim());
      db.hll.pfAdd(tempKey, ...elements);
      socket.write(`+Elements added to HyperLogLog for key '${tempKey}'\r\n`);
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    } else if (step === "pfcount_key") {
      tempKey = input;
      const count = db.hll.pfCount(tempKey);
      socket.write(`+Estimated cardinality: ${count}\r\n`);
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    } else if (step === "pfmerge_destkey") {
      tempKey = input;
      step = "pfmerge_sourcekeys";
      socket.write("Enter source keys to merge (comma-separated):\r\n");
      return;
    } else if (step === "pfmerge_sourcekeys") {
      const sourceKeys = input.split(",").map((key) => key.trim());
      db.hll.pfMerge(tempKey, ...sourceKeys);
      socket.write(`+HyperLogLogs merged into '${tempKey}'\r\n`);
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    } else if (step === "ts_create_key") {
      tempKey = input;
      if (!tempKey) {
        socket.write("-ERR: Write a key name\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      try {
        db.ts.create(tempKey);
        socket.write(`+Time series '${tempKey}' created\r\n`);
      } catch (error) {
        socket.write(`-ERR: ${error.message}\r\n`);
      }
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    } else if (step === "ts_add") {
      tempKey = input;
      if (!tempKey) {
        socket.write("-ERR: Write a key name\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      socket.write("Enter timestamp: ");
      step = "ts_add_timestamp";
      return;
    } else if (step === "ts_add_timestamp") {
      let timestamp = parseInt(input);
      if (isNaN(timestamp)) {
        socket.write("-ERR: Invalid timestamp\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      socket.write("Enter value: ");
      step = "ts_add_value";
      return;
    } else if (step === "ts_add_value") {
      let value = parseInt(input);
      if (isNaN(value)) {
        socket.write("-ERR: Invalid value\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      console.log(
        `Adding data point to time series '${tempKey}' with timestamp ${timestamp} and value ${value}`
      );
      try {
        db.ts.add(tempKey, timestamp, value);
        socket.write(`+Data point added to time series '${tempKey}'\r\n`);
      } catch (error) {
        socket.write(`-ERR: ${error.message}\r\n`);
      }
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    } else if (step === "ts_range") {
      tempKey = input;
      if (!tempKey) {
        socket.write("-ERR: Write a key name\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      socket.write("Enter start timestamp: ");
      step = "ts_range_start";
      return;
    } else if (step === "ts_range_start") {
      let startTime = parseInt(input);
      if (isNaN(startTime)) {
        socket.write("-ERR: Invalid start timestamp\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      socket.write("Enter end timestamp: ");
      step = "ts_range_end";
      return;
    } else if (step === "ts_range_end") {
      let endTime = parseInt(input);
      if (isNaN(endTime)) {
        socket.write("-ERR: Invalid end timestamp\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      try {
        const dataPoints = db.ts.range(tempKey, startTime, endTime);
        socket.write(`*${dataPoints.length}\r\n`);
        for (let dataPoint of dataPoints) {
          socket.write(`${dataPoint.timestamp} ${dataPoint.value}\r\n`);
        }
      } catch (error) {
        socket.write(`-ERR: ${error.message}\r\n`);
      }
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    } else if (step === "ts_get") {
      tempKey = input;
      if (!tempKey) {
        socket.write("-ERR: Write a key name\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      try {
        const ts = db.ts.get(tempKey);
        if (ts) {
          socket.write(`*1\r\n${ts.timestamp} ${ts.value}\r\n`);
        } else {
          socket.write("-ERR: No data points available\r\n");
        }
      } catch (error) {
        socket.write(`-ERR: ${error.message}\r\n`);
      }
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    } else if (step === "ts_downsample") {
      tempKey = input;
      if (!tempKey) {
        socket.write("-ERR: Write a key name\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      socket.write("Enter downsampling interval: ");
      step = "ts_downsample_interval";
      return;
    } else if (step === "ts_downsample_interval") {
      let interval = parseInt(input);
      if (isNaN(interval) || interval <= 0) {
        socket.write("-ERR: Invalid interval\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      try {
        const downsampledData = db.ts.downsample(tempKey, interval);
        socket.write(`+Downsampled data for '${tempKey}':\r\n`);
        for (let { timestamp, value } of downsampledData) {
          socket.write(`${timestamp}: ${value}\r\n`);
        }
      } catch (error) {
        socket.write(`-ERR: ${error.message}\r\n`);
      }
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    } else if (step === "ts_aggregate") {
      tempKey = input;
      if (!tempKey) {
        socket.write("-ERR: Write a key name\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      socket.write("Enter start timestamp: ");
      step = "ts_aggregate_start";
      return;
    } else if (step === "ts_aggregate_start") {
      let startTime = parseInt(input);
      if (isNaN(startTime)) {
        socket.write("-ERR: Invalid start timestamp\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      socket.write("Enter end timestamp: ");
      step = "ts_aggregate_end";
      return;
    } else if (step === "ts_aggregate_end") {
      let endTime = parseInt(input);
      if (isNaN(endTime)) {
        socket.write("-ERR: Invalid end timestamp\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      socket.write(
        "Enter aggregation type (SUM, AVG, MAX, MIN, COUNT, FIRST, LAST): "
      );
      step = "ts_aggregate_type";
      return;
    } else if (step === "ts_aggregate_type") {
      let aggType = input.toUpperCase();
      const validAggTypes = [
        "SUM",
        "AVG",
        "MAX",
        "MIN",
        "COUNT",
        "FIRST",
        "LAST",
      ];
      if (!validAggTypes.includes(aggType)) {
        socket.write("-ERR: Invalid aggregation type\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      try {
        const result = db.ts.aggregate(tempKey, startTime, endTime, aggType);
        socket.write(
          `+Aggregation result (${aggType}) for '${tempKey}': ${result}\r\n`
        );
      } catch (error) {
        socket.write(`-ERR: ${error.message}\r\n`);
      }
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    }

    // TTL commands
    else if (step === "ttl_expiry") {
      tempKey = input;
      socket.write("Enter expiry time in seconds: ");
      step = "ttl_expiry_time";
      return;
    } else if (step === "ttl_expiry_time") {
      let expiryTime = parseInt(input);
      if (isNaN(expiryTime) || expiryTime <= 0) {
        socket.write("-ERR: Invalid expiry time\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      db.ttl.expire(tempKey, expiryTime);
      socket.write(`+OK\r\n`);
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    } else if (step === "pexpire") {
      tempKey = input;
      socket.write("Enter expiry time in milliseconds: ");
      step = "pexpire_time";
      return;
    } else if (step === "pexpire_time") {
      let expiryTime = parseInt(input);
      if (isNaN(expiryTime) || expiryTime <= 0) {
        socket.write("-ERR: Invalid expiry time\r\n");
        socket.write(displayMenu());
        step = null;
        return;
      }
      db.ttl.pexpire(tempKey, expiryTime);
      socket.write(`+OK\r\n`);
      socket.write(displayMenu());
      step = null;
      tempKey = null;
      return;
    } else if (step === "ttl") {
      let ttlValue = db.ttl.ttl(input);
      if (ttlValue === -2) {
        socket.write("-1 Key does not exist or has expired\r\n");
      } else if (ttlValue === -1) {
        socket.write("-1 No TTL set for key\r\n");
      } else {
        socket.write(`TTL for key "${input}": ${ttlValue} seconds\r\n`);
      }
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "pttl") {
      let pttlValue = db.ttl.pttl(input);
      if (pttlValue === -2) {
        socket.write("-1 Key does not exist or has expired\r\n");
      } else if (pttlValue === -1) {
        socket.write("-1 No TTL set for key\r\n");
      } else {
        socket.write(`PTTL for key "${input}": ${pttlValue} milliseconds\r\n`);
      }
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "persist") {
      let result = db.ttl.persist(input);
      if (result === 0) {
        socket.write("-ERR: Key does not exist or no TTL set\r\n");
      } else {
        socket.write("+OK Expiration removed\r\n");
      }
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "MULTI") {
      db.transaction.multi(clientId);
      socket.write(
        "+OK: Transaction started. Queue commands using 'string.set', 'json.set', etc.\r\n"
      );
      socket.write("Send 'EXEC' to execute or 'DISCARD' to cancel.\r\n");
      step = "QUEUE";
      return;
    } else if (step === "QUEUE") {
      let command = input.trim();

      if (command.toUpperCase() === "EXEC") {
        const results = db.transaction.exec(clientId);
        socket.write(results + "\r\n");
        step = null; // Reset state after execution
        socket.write(displayMenu());
        return;
      } else if (command.toUpperCase() === "DISCARD") {
        db.transaction.discard(clientId);
        socket.write("+OK: Transaction discarded.\r\n");
        step = null; // Reset state after discarding
        return;
      }

      // Ensure the command follows the correct format (e.g., string.set, json.set, etc.)
      if (!command.match(/^(string|json|list|set|hash|zset)\.\w+\(.*\)$/)) {
        socket.write(
          "-ERR: Invalid command format. Use 'string.set', 'json.set', etc.\r\n"
        );
        return;
      }

      // Queue command
      db.transaction.queueCommand(clientId, command);
      socket.write("+QUEUED\r\n");

      // **THIS LINE RE-PROMPTS THE USER TO INPUT MORE COMMANDS**
      socket.write("Enter another command or type 'EXEC' to execute all.\r\n");
      return;
    } 
    
    else if (step === "subscribe") {
      channel = input.trim();
      db.subscribe(socket, channel);
      socket.write(`+Subscribed to channel '${channel}'\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    } else if (step === "publish") {
      channel = input.trim();
      socket.write("Enter message: ");
      step = "publish_message";
      return;
    } else if (step === "publish_message") {
      message = input.trim();
      db.pubsub.publish(channel, message);
      socket.write(`+Message published to channel '${channel}'\r\n`);
    } else if(step === "unsubscribe") {
      channel = input.trim();
      db.pubsub.unsubscribe(socket, channel);
      socket.write(`+Unsubscribed from channel '${channel}'\r\n`);
      socket.write(displayMenu());
      step = null;
      return;
    }

    switch (input) {
      case "1":
        socket.write("Enter key for SET: ");
        step = "set_key";
        break;

      case "2":
        socket.write("Enter key for GET: ");
        step = "get_key";
        break;

      case "3":
        socket.write("Enter key for APPEND: ");
        step = "append_key";
        break;

      case "4":
        socket.write("Enter key for STRLEN: ");
        step = "strlen_key";
        break;

      case "5":
        socket.write("Enter key for INCR: ");
        step = "incr_key";
        break;

      case "6":
        socket.write("Enter key for DECR: ");
        step = "decr_key";
        break;

      case "7":
        socket.write("Enter key for INCRBY: ");
        step = "incrby_key";
        break;

      case "8":
        socket.write("Enter key for DECRBY: ");
        step = "decby_key";
        break;

      case "9":
        socket.write("Enter key for GETRANGE: ");
        step = "getrange_key";
        break;

      case "10":
        socket.write("Enter key for SETRANGE: ");
        step = "setrange_key";
        break;

      case "11":
        socket.write("Enter key for JSON.SET: ");
        step = "json_set_key";
        break;

      case "12":
        socket.write("Enter key for JSON.GET: ");
        step = "json_get_key";
        break;

      case "13":
        socket.write("Enter key for JSON.DEL: ");
        step = "json_del_key";
        break;

      case "14":
        socket.write("Enter key for JSON.ARRAPPEND: ");
        step = "json_arrappend_key";
        break;

      case "15":
        socket.write("Enter key for LPUSH: ");
        step = "lpush_key";
        break;

      case "16":
        socket.write("Enter key for RPUSH: ");
        step = "rpush_key";
        break;

      case "17":
        socket.write("Enter key for LPOP: ");
        step = "lpop_key";
        break;

      case "18":
        socket.write("Enter key for RPOP: ");
        step = "rpop_key";
        break;

      case "19":
        socket.write("Enter key for LRANGE: ");
        step = "lrange_key";
        break;

      case "20":
        socket.write("Enter key for LINDEX: ");
        step = "lindex_key";
        break;

      case "21":
        socket.write("Enter key for LSET: ");
        step = "lset_key";
        break;

      case "22":
        socket.write("Enter key for SADD: ");
        step = "sadd_key";
        break;

      case "23":
        socket.write("Enter key for SREM: ");
        step = "srem_key";
        break;

      case "24":
        socket.write("Enter key for SISMEMBERS: ");
        step = "sismember_key";
        break;

      case "25":
        socket.write("Enter key for SMEMBERS: ");
        step = "smembers_key";
        break;

      case "26":
        socket.write("Enter key for SINTER: ");
        step = "sinter_key1";
        break;

      case "27":
        socket.write("Enter key for SUNION: ");
        step = "sunion_key1";
        break;

      case "28":
        socket.write("Enter key for SDIFF: ");
        step = "sdiff_key1";
        break;

      case "29":
        socket.write("Enter key for HSET: ");
        step = "hset_key";
        break;

      case "30":
        socket.write("Enter key for HGET: ");
        step = "hget_key";
        break;

      case "31":
        socket.write("Enter key for HMSET: ");
        step = "hmset_key";
        break;

      case "32":
        socket.write("Enter key for HGETALL: ");
        step = "hgetall_key";
        break;

      case "33":
        socket.write("Enter key for HDEL: ");
        step = "hdel_key";
        break;

      case "34":
        socket.write("Enter key for HEXISTS: ");
        step = "hexists_key";
        break;

      case "35":
        socket.write("Enter key for ZADD: ");
        step = "zadd_key";
        break;

      case "36":
        socket.write("Enter key for ZRANGE: ");
        step = "zrange_key";
        break;

      case "37":
        socket.write("Enter key for ZRANK: ");
        step = "zrank_key";
        break;

      case "38":
        socket.write("Enter key for ZRANGEBYSCORE: ");
        step = "zrangebyscore_key";
        break;

      case "39":
        socket.write("Enter key for XADD: ");
        step = "xadd_key";
        break;

      case "40":
        socket.write("Enter count for XREAD: ");
        step = "xread_count";
        break;

      case "41":
        socket.write("Enter stream for XRANGE: ");
        step = "xrange_stream";
        break;

      case "42":
        socket.write("Enter stream for XLEN: ");
        step = "xlen_stream";
        break;

      case "43":
        socket.write("Enter stream for XGROUP CREATE: ");
        step = "xgroup_stream";
        break;

      case "44":
        socket.write("Enter stream for XREADGROUP: ");
        step = "xreadgroup_stream";
        break;

      case "45":
        socket.write("Enter stream for XACK: ");
        step = "xack_stream";
        break;

      case "46":
        socket.write("Enter key for GEOADD: ");
        step = "geoadd_key";
        break;

      case "47":
        socket.write("Enter key for GEOSEARCH: ");
        step = "geosearch_key";
        break;

      case "48":
        socket.write("Enter key for GEODIST: ");
        step = "geodist_key";
        break;

      case "49":
        socket.write("Enter key for SETBIT: ");
        step = "setbit_key";
        break;
      case "50":
        socket.write("Enter key for GETBIT: ");
        step = "getbit_key";
        break;
      case "51":
        socket.write("Enter key for BITCOUNT: ");
        step = "bitcount_key";
        break;
      case "52":
        socket.write("Enter operation (AND, OR, XOR, NOT) for BITOP: ");
        step = "bitop_op";
        break;
      case "53":
        socket.write("Enter key for BITFIELD SET: ");
        step = "bitfield_set_key";
        break;

      case "54":
        socket.write("Enter key for BITFIELD GET: ");
        step = "get_bitfield";
        break;

      case "55":
        socket.write("Enter key for BITFIELD INCRBY: ");
        step = "incrby_bitfield";
        break;
      case "56":
        socket.write("Enter operation for BITFIELD (SET, GET, INCRBY): ");
        step = "bitfield_operations";
        break;

      case "57":
        socket.write("Enter key for PFADD: ");
        step = "pfadd_key";
        break;

      case "58":
        socket.write("Enter key for PFCOUNT: ");
        step = "pfcount_key";
        break;

      case "59":
        socket.write("Enter destination key for PFMERGE: ");
        step = "pfmerge_destkey";
        break;

      case "60":
        socket.write("Create Key for TS.CREATE: ");
        step = "ts_create_key";
        break;

      case "61":
        socket.write("Enter key for TS.ADD: ");
        step = "ts_add_key";
        break;

      case "62":
        socket.write("Enter key for TS.GET: ");
        step = "ts_get";
        break;

      case "63":
        socket.write("Enter key for TS.RANGE: ");
        step = "ts_range";
        break;

      case "64":
        socket.write("Enter key for TS.DOWNSAMPLE: ");
        step = "ts_downsample";
        break;

      case "65":
        socket.write("Enter key for TS.AGGREGATE: ");
        step = "ts_aggregate";
        break;

      case "66":
        socket.write("Enter key for TS.expire: ");
        step = "ttl_expiry";
        break;
      case "67":
        socket.write("Enter key for PEXPIRE: ");
        step = "pexpire";
        break;
      case "68":
        socket.write("Enter key for TTL: ");
        step = "ttl";
        break;
      case "69":
        socket.write("Enter key for PTTL");
        step = "pttl";
        break;
      case "70":
        socket.write("Enter key for PERSIST: ");
        step = "persist";
        break;
      case "71":
        socket.write("Enter client ID for MULTI: ");
        step = "MULTI";
        break;
      case "72": 
        socket.write("Enter the channel to subscribe to: ");
        step = "subscribe";
        break;
      case "73":
        socket.write("Enter the channel to publish to: ");
        step = "publish";
        break;
      case "74":
        socket.write("Enter the channel to unsubscribe from: ");
        step = "unsubscribe";
        break;
      case "75":
        db.saveSnapshot();
        socket.write("+OK Snapshot saved\r\n");
        socket.write(displayMenu());
        break;
      case "76":
        db.clearStore();
        db.clearSnapshot();
        process.exit(0);
        break;

      default:
        socket.write("Invalid choice. Try again.\r\n");
        socket.write(displayMenu());
    }
  });

  socket.on("end", () => console.log("Client disconnected"));
  socket.on("error", (err) => console.error("Socket error:", err));
});

server.listen(PORT, () => {
  console.log(`Redis-like server listening on port ${PORT}`);
});
