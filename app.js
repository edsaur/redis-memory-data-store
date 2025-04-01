import net from "net";
import db from "./db.js"; // Your database module

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
49. SAVE snapshot
50. Exit
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
    }
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
    } 
    
    else if (step === "sadd_key") {
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
    }  else if (step === "xadd_key") {
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
        db.saveSnapshot();
        socket.write("+OK Snapshot saved\r\n");
        socket.write(displayMenu());
        break;

      case "50":
        socket.write("Bye!\r\n");
        socket.end();
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
