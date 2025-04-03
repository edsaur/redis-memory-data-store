import db from "../db.js";
// Mock store with basic operations
// Manual Tests
console.log("\n--- TEST: MULTI ---");
console.log(db.transaction.multi("client1")); // Should start a transaction for client1

console.log("\n--- TEST: QUEUE COMMANDS ---");
console.log(db.transaction.queueCommand("client1", "string.set('username', 'Alice')")); // Use store.set instead of set
db.transaction.queueCommand("client1", "string.set('age', '25')");
db.transaction.queueCommand("client1", "string.incr('age')");

console.log("\n--- TEST: EXEC ---");
db.transaction.exec("client1"); // Should execute queued commands

console.log("\n--- TEST: GET VALUES AFTER EXEC ---");
console.log("username:", db.string.get("username")); // Should be "Alice"
console.log("age:", db.string.get("age")); // Should be 26 (since it was incremented).

db.saveSnapshot();