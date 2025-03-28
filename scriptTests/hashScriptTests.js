import db from "../db.js";

db.hash.hset("user:1", "name", "Alice");
db.hash.hset("user:1", "age", "25");
console.log(db.hash.hget("user:1", "name")); // Alice

db.hash.hmset("user:2", { name: "Bob", age: "30", city: "NY" });
console.log(db.hash.hgetall("user:2")); // { name: 'Bob', age: '30', city: 'NY' }

db.hash.hdel("user:1", "age");
console.log(db.hash.hgetall("user:1")); // { name: 'Alice' }

console.log(db.hash.hexists("user:2", "city")); // 1
console.log(db.hash.hexists("user:2", "country")); // 0

setInterval(() => db.saveSnapshot(), 10000);