import db from "../db.js";

// TEST CASES FOR DB
// Test: String Store
db.string.set("username", "Alice");
db.ttl.expire("username", 10);
setInterval(() => {
    console.log(db.ttl.ttl("username")); // Output: Remaining TTL in seconds
    console.log(db.string.get("username")); // Output: "Alice"
}, 1000); // Run every second

// setTimeout(() => {
//     console.log(db.ttl.ttl("username")); // Output: -2 (key expired)
// }, 9000);

console.log(db.string.get("username")); // "Alice"

// db.string.append("username", "BobTheBuilder");
// console.log(db.string.get("username")); // "AliceBob"

// // Test: Number Store
// db.string.set("age", 30);
// console.log("User's initial: " + db.get("age")); // Output: 30

// db.string.incr("age");
// console.log("age increment: " + db.get("age")); // Output: 31

// db.string.decr("age");
// console.log("age decremented: " + db.get("age")); // Output: 30

// db.string.incrBy("age", 5);
// console.log("age incremented by 5: " + db.get("age")); // Output: 35

// db.string.decBy("age", 5);
// console.log("age decremented by 5: " + db.get("age")); // Output: 30

db.saveSnapshot();
