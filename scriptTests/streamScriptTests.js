import db from "../db.js";
import assert from "assert";

// Clear any existing data
db.clearStore();

// Add entries
const id1 = db.stream.xadd("mystream", "*", "name", "Alice", "age", "25");
const id2 = db.stream.xadd("mystream", "*", "name", "Bob", "age", "30");
const id3 = db.stream.xadd("mystream", "*", "name", "Charlie", "age", "35");
const id4 = db.stream.xadd("mystream", "*", "name", "David", "age", "40");

console.log("Added entries to mystream:");
console.log(`  Entry 1 ID: ${id1}`);
console.log(`  Entry 2 ID: ${id2}`);
console.log(`  Entry 3 ID: ${id3}`);
console.log(`  Entry 4 ID: ${id4}`);

// Read latest 2 messages
const readResult = db.stream.xread({ count: 2, stream: "mystream" });
console.log("\nRead latest 2 messages:");
console.log(readResult);
assert.strictEqual(readResult.length, 2);
assert.strictEqual(readResult[0].id, id1);
assert.strictEqual(readResult[1].id, id2);

// Read messages within a range
const rangeResult = db.stream.xrange("mystream", id2, id4);
console.log("\nRead messages within a range:");
console.log(rangeResult);
assert.strictEqual(rangeResult.length, 1);

// Get stream length
const streamLength = db.stream.xlen("mystream");
console.log("\nStream length:");
console.log(streamLength);
assert.strictEqual(streamLength, 4);

// Create consumer group
db.stream.xgroupCreate("mystream", "group1");
console.log("\nCreated consumer group: group1");

// Read messages as a group
const groupReadResult = db.stream.xreadgroup("mystream", "group1", 2);
console.log("\nRead messages as a group (group1):");
console.log(groupReadResult);
assert.strictEqual(groupReadResult.length, 2);
assert.strictEqual(groupReadResult[0].id, id1);
assert.strictEqual(groupReadResult[1].id, id2);

// Acknowledge a message
const ackResult = db.stream.xack("mystream", "group1", id1);
console.log("\nAcknowledged message:", id1);
console.log(ackResult);
assert.strictEqual(ackResult, true);

// Try to acknowledge a non-existent message
const ackResult2 = db.stream.xack("mystream", "group1", "non-existent-id");
console.log("\nTry to acknowledge a non-existent message:");
console.log(ackResult2);
assert.strictEqual(ackResult2, false);

// Test creating a group on a non-existent stream
try {
  db.stream.xgroupCreate("nonexistentstream", "group2");
  assert.fail("Expected an error when creating a group on a non-existent stream");
} catch (error) {
  console.log("\nCaught expected error:", error.message);
  assert.strictEqual(error.message, "-ERROR: Stream does not exist.");
}

// Test reading from a non-existent group
try {
  db.stream.xreadgroup("mystream", "nonexistentgroup", 2);
  assert.fail("Expected an error when reading from a non-existent group");
} catch (error) {
  console.log("\nCaught expected error:", error.message);
  assert.strictEqual(error.message, "Expected an error when reading from a non-existent group");
}

db.saveSnapshot(); 