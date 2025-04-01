import db from "../db.js";

db.bitfield.setBitfield("user_stats", "i4", 0, 3);
console.log(db.bitfield.getBitfield("user_stats", "i4", 0)); // 3

db.bitfield.setBitfield("user_stats", "u8", 4, 255);
console.log(db.bitfield.getBitfield("user_stats", "u8", 4)); // 255

// Overflow Handling: WRAP
db.bitfield.incrByBitfield("user_stats", "u8", 4, 10, "WRAP");
console.log(db.bitfield.getBitfield("user_stats", "u8", 4)); // 9 (Wraps around)

// Overflow Handling: SATURATE
db.bitfield.incrByBitfield("user_stats", "u8", 4, 10, "SAT");
console.log(db.bitfield.getBitfield("user_stats", "u8", 4)); // 255 (Caps at max)

// Overflow Handling: FAIL (should throw error)
try {
    db.bitfield.incrByBitfield("user_stats", "u8", 4, 10, "FAIL");
} catch (error) {
    console.log(error.message); // Error: Value out of range
}

// Multiple Operations with Overflow Mode
const results = db.bitfield.executeBitfieldOperations("user_stats", [
    ["SET", "i4", "0", "5"],
    ["GET", "i4", "0"],
    ["INCRBY", "u8", "4", "20"],
    ["GET", "u8", "4"]
], "WRAP");

console.log(results); // ["OK", 5, 19, 19]

db.saveSnapshot(); // Save the current state to a snapshot file