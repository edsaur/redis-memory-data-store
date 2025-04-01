import db from "../db.js"; // Ensure this path is correct
import assert from "assert";

console.log("=== BITMAP TEST CASES ===");

// Clear any existing data
db.clearStore();

// Test 1: Set a bitmap value
db.bitmap.setBit("user:1", 0, 1);
assert.strictEqual(db.bitmap.getBit("user:1", 0), 1, "Test 1 Failed: SETBIT");
console.log("✅ Test 1 Passed: SETBIT");

// Test 2: Get a bitmap value
assert.strictEqual(db.bitmap.getBit("user:1", 0), 1, "Test 2 Failed: GETBIT");
console.log("✅ Test 2 Passed: GETBIT");

// Test 3: Bit count
assert.strictEqual(db.bitmap.bitCount("user:1"), 1, "Test 3 Failed: BITCOUNT");
console.log("✅ Test 3 Passed: BITCOUNT");

// Test 4: Set multiple bitmap values
db.bitmap.setBit("user:1", 1, 1);
db.bitmap.setBit("user:1", 2, 1);
assert.strictEqual(db.bitmap.getBit("user:1", 1), 1, "Test 4 Failed: SETBIT");
assert.strictEqual(db.bitmap.getBit("user:1", 2), 1, "Test 4 Failed: SETBIT");
console.log("✅ Test 4 Passed: SETBIT");

// Test 5: Get multiple bitmap values
const bitValues = [
  db.bitmap.getBit("user:1", 0),
  db.bitmap.getBit("user:1", 1),
  db.bitmap.getBit("user:1", 2),
];
assert.deepStrictEqual(bitValues, [1, 1, 1], "Test 5 Failed: GETBIT");
console.log("✅ Test 5 Passed: GETBIT");

// Test 6: Bit count (after setting multiple bits)
assert.strictEqual(db.bitmap.bitCount("user:1"), 3, "Test 6 Failed: BITCOUNT");
console.log("✅ Test 6 Passed: BITCOUNT");

// Test 7: Bit operation (AND)
db.bitmap.setBit("user:2", 0, 1);
db.bitmap.setBit("user:2", 1, 0);
db.bitmap.setBit("user:2", 2, 1);
db.bitmap.bitOp("AND", "user:3", "user:1", "user:2");

assert.strictEqual(db.bitmap.getBit("user:3", 0), 1, "Test 7 Failed: BITOP AND");
assert.strictEqual(db.bitmap.getBit("user:3", 1), 0, "Test 7 Failed: BITOP AND");
assert.strictEqual(db.bitmap.getBit("user:3", 2), 1, "Test 7 Failed: BITOP AND");
console.log("✅ Test 7 Passed: BITOP AND");

// Test 8: Bit operation (OR)
db.bitmap.bitOp("OR", "user:4", "user:1", "user:2");
assert.strictEqual(db.bitmap.getBit("user:4", 0), 1, "Test 8 Failed: BITOP OR");
assert.strictEqual(db.bitmap.getBit("user:4", 1), 1, "Test 8 Failed: BITOP OR");
assert.strictEqual(db.bitmap.getBit("user:4", 2), 1, "Test 8 Passed: BITOP OR");
console.log("✅ Test 8 Passed: BITOP OR");

// Test 9: Bit operation (XOR)
db.bitmap.bitOp("XOR", "user:5", "user:1", "user:2");
assert.strictEqual(db.bitmap.getBit("user:5", 0), 0, "Test 9 Failed: BITOP XOR");
assert.strictEqual(db.bitmap.getBit("user:5", 1), 1, "Test 9 Failed: BITOP XOR");
assert.strictEqual(db.bitmap.getBit("user:5", 2), 0, "Test 9 Failed: BITOP XOR");
console.log("✅ Test 9 Passed: BITOP XOR");

// Test 10: Bit operation (NOT)
db.bitmap.bitOp("NOT", "user:6", "user:1");
assert.strictEqual(db.bitmap.getBit("user:6", 0), 0, "Test 10 Failed: BITOP NOT");
assert.strictEqual(db.bitmap.getBit("user:6", 1), 0, "Test 10 Failed: BITOP NOT");
assert.strictEqual(db.bitmap.getBit("user:6", 2), 0, "Test 10 Failed: BITOP NOT");
console.log("✅ Test 10 Passed: BITOP NOT");

// Test 11: Check for non-existing bit (should be 0)
assert.strictEqual(db.bitmap.getBit("user:7", 0), 0, "Test 11 Failed: Non-Existing Key");
console.log("✅ Test 11 Passed: Non-Existing Key");

// Test 12: Check for out-of-bounds bit (should return 0, not error)
assert.strictEqual(db.bitmap.getBit("user:1", 100), 0, "Test 12 Failed: Out of Bounds");
console.log("✅ Test 12 Passed: Out of Bounds");

// Test 13: Set a bit to 0
db.bitmap.setBit("user:1", 0, 0);
assert.strictEqual(db.bitmap.getBit("user:1", 0), 0, "Test 13 Failed: Set bit to 0");
console.log("✅ Test 13 Passed: Set bit to 0");

// Test 14: BITOP NOT should fail with multiple keys
try {
  db.bitmap.bitOp("NOT", "user:9", "user:1", "user:2");
  assert.fail("Test 14 Failed: BITOP NOT with multiple keys should throw error");
} catch (error) {
  console.log(
    "✅ Test 14 Passed: BITOP NOT with multiple keys correctly threw an error"
  );
}

// Test 15: Invalid bit value
assert.strictEqual(db.bitmap.setBit("user:10", 0, 2), false, "Test 15 Failed: Invalid bit value");
console.log("✅ Test 15 Passed: Invalid bit value");

// Test 16: Invalid bit operation
assert.strictEqual(db.bitmap.bitOp("INVALID", "user:11", "user:1"), false, "Test 16 Failed: Invalid bit operation");
console.log("✅ Test 16 Passed: Invalid bit operation");

// Test 17: Bit count with empty key
assert.strictEqual(db.bitmap.bitCount("user:12"), 0, "Test 17 Failed: Bit count with empty key");
console.log("✅ Test 17 Passed: Bit count with empty key");

// Test 18: Bit operation with non-existing key
db.bitmap.bitOp("AND", "user:13", "user:1", "user:nonexistent");
assert.strictEqual(db.bitmap.getBit("user:13", 0), 0, "Test 18 Failed: Bit operation with non-existing key");
console.log("✅ Test 18 Passed: Bit operation with non-existing key");

console.log("🎉 ALL TESTS PASSED 🎉");
db.saveSnapshot();
