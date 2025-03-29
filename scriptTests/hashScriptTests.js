import db from "../db.js";

db.hash.hset("user:3", "name", "Alice");
db.hash.hset("user:3", "age", "25");
console.log(db.hash.hget("user:3", "name")); // Alice

db.hash.hmset("user:4", { name: "Bob", age: "30", city: "NY" });
console.log(db.hash.hgetall("user:4")); // { name: 'Bob', age: '30', city: 'NY' }

db.hash.hdel("user:3", "age");
console.log(db.hash.hgetall("user:3")); // { name: 'Alice' }

console.log(db.hash.hexists("user:4", "city")); // 1
console.log(db.hash.hexists("user:4", "country")); // 0

db.saveSnapshot();
