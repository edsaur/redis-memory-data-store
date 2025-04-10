# This are the Redis Commands to use for Command Line Interface

STRINGS (and other data-types that are not complex)
-
- **SET *key* *value*** - This is to SET to the store the key-value pairs
- **GET *key*** - Accepts a key and gets the value from that key.
- **DEL key** - Accepts a key and removes the key-value pair from the store
- **HAS *key*** - Accepts a key and checks if a key exists.

JSON
- 
**NOTE:** **the $ is the root of the JSON object**
- **JSON.SET *key path value*** - Sets a JSON value at a specified key and path.
  - Setting for the first time (**JSON.SET *key* *$* {"json": "values"}**)
  - Inserting new key-value pair (**JSON.SET *key* *path* *value***) 
- **JSON.GET *key path (or) $*** - Retrieves a JSON value from a specified key and path.
- **JSON.ARRAPPEND *key array_path value*** - Appends a value to a JSON array at a specified key and path.
- **JSON.DEL *key*** - Deletes a JSON value at a specified key and path.

LISTS
-
- **LPUSH** - Inserts one or more values at the beginning of a list.
- **RPUSH** - Inserts one or more values at the end of a list.
- **LPOP** - Removes and returns the first element of a list.
- **RPOP** - Removes and returns the last element of a list.
- **LRANGE** - Retrieves a range of elements from a list based on start and end indices.
- **LINDEX** - Retrieves an element from a list by its index.
- **LSET** - Sets the value of an element in a list at a specified index.

SETS
-
- **SADD** - Adds one or more values to a set.
- **SREM** - Removes one or more values from a set.
- **SISMEMBER** - Checks if a value is a member of a set.
- **SMEMBERS** - Retrieves all members of a set.
- **SINTER** - Returns the intersection of multiple sets.
- **SUNION** - Returns the union of multiple sets.
- **SDIFF** - Returns the difference between multiple sets.

HASHES
-
- **HSET** - Sets a field-value pair in a hash.
- **HGET** - Retrieves the value of a field in a hash.
- **HMSET** - Sets multiple field-value pairs in a hash.
- **HGETALL** - Retrieves all field-value pairs in a hash.
- **HDEL** - Deletes one or more fields from a hash.
- **HEXISTS** - Checks if a field exists in a hash.

Sorted Sets
-
- **ZADD** - Adds a value to a sorted set with a specified score.
- **ZRANGE** - Retrieves a range of elements from a sorted set based on their rank.
- **ZRANK** - Retrieves the rank of a value in a sorted set.
- **ZREM** - Removes one or more values from a sorted set.
- **ZRANGEBYSCORE** - Retrieves elements from a sorted set based on a score range.

STREAMS
-
- **XADD** - Adds an entry to a stream with a specified key and field-value pairs.
- **XREAD** - -   Reads entries from one or more streams starting from a specific ID.
- **XRANGE** - Retrieves entries from a stream within a specified ID range.
- **XLEN** - Retrieves the number of entries in a stream.
- **XGROUP CREATE** - Creates a consumer group for a stream.
- **XREADGROUP** - Reads entries from a stream as part of a consumer group.
- **XACK** - Acknowledges the processing of a message in a stream.

GEOSPATIAL
-
- **GEOADD** - Adds a geospatial point (latitude, longitude, and name) to a key.
- **GEOSEARCH** - Searches for geospatial points within a radius of a specified location.
- **GEODIST** - Calculates the distance between two geospatial points.

BITMAPS
-
- **SETBIT** - Sets or clears a bit at a specified offset in a bitmap.
- **GETBIT** - Retrieves the value of a bit at a specified offset in a bitmap.
- **BITCOUNT** - Counts the number of set bits (1s) in a bitmap.
- **BITOP (AND, OR, XOR, NOT)** - Performs bitwise operations (AND, OR, XOR, NOT) on one or more bitmaps.

HyperLogLog
-
- **PFADD** - Adds elements to a HyperLogLog data structure.
- **PFCOUNT** - Estimates the cardinality (number of unique elements) of a HyperLogLog.
- **PFMERGE** - Merges multiple HyperLogLogs into one.

Time Series
-
- **TS.CREATE** - Creates a new time series with a specified key.
- **TS.ADD** - Adds a data point (timestamp and value) to a time series.
- **TS.GET** - Retrieves the most recent data point from a time series.
- **TS.RANGE** - Retrieves data points from a time series within a specified time range.

KEY EXPIRATION
- 
- **EXPIRE** - Sets a time-to-live (TTL) for a key in seconds.
- **PEXPIRE** - Sets a time-to-live (TTL) for a key in milliseconds.
- **TTL** - Retrieves the remaining TTL for a key in seconds.
- **PTTL** - Retrieves the remaining TTL for a key in milliseconds.
- **PERSIST** - Removes the TTL from a key, making it persistent.

PUBLISH/SUBSCRIBE MECHANISM
-
- **SUBSCRIBE *channel*** - Subscribes to a socket channel for 
- **PUBLISH *channel* *message*** - Publish message to subscribed channel. Subscribed users will get the published message.
- **UNSUBSCRIBE *channel*** - Unsubscribes to a channel

TRANSACTIONS
-
- **MULTI** - Starts a transaction, queuing subsequent commands.
- **EXEC** - Executes together the queued commands
- **DISCARD** - Discards the Transaction


SAVE/CLEARING/DISCONNECTION
-
- **SAVE *(seconds)*** - This snapshots the stored data in the store and stores in a JSON file 
- **CLEAR** - clears the store, aof file, and snapshots
- **QUIT** - Quits the CLI and clears the store and the snapshots