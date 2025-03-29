import db from "../db.js";

db.list.lpush("users", "Alice", "Bob", "Charlie");
db.list.rpush("users", "David", "Eve");
console.log(db.list.lrange("users", 0, -1));

console.log(db.list.lpop("users")); // "Alice"
console.log(db.list.rpop("users")); // "Eve"

console.log(db.list.lrange("users", 0, -1));


db.saveSnapshot();
