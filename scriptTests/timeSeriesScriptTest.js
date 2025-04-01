import db from "../db.js";

// Test: Creating a Time Series
console.log("\n✅ TS.CREATE Test");
db.ts.create("temperature");
console.log(db.get("temperature")); // Should print an empty array []

// Test: Adding Data Points
console.log("\n✅ TS.ADD Test");
db.ts.add("temperature", 22.5);
db.ts.add("temperature", 23.1);
db.ts.add("temperature", 24.0);
console.log(db.get("temperature")); // Should print an array with timestamps

// Test: Getting Latest Data Point
console.log("\n✅ TS.GET Test");
const latest = db.ts.get("temperature");
console.log(latest); // Should print the latest timestamp and value

// Test: Querying a Range of Data
console.log("\n✅ TS.RANGE Test");
const now = Date.now();
const tenSecondsAgo = now - 10000;
const fiveSecondsAgo = now - 5000;

// Add test data with manual timestamps
db.ts.add("temperature", 20.0, tenSecondsAgo);
db.ts.add("temperature", 21.5, fiveSecondsAgo);
const rangeData = db.ts.range("temperature", tenSecondsAgo, now);
console.log(rangeData); // Should return all data points within the last 10 seconds

// Test: Edge Case - Querying an Empty Series
console.log("\n✅ TS.GET on Empty Series");
db.ts.create("humidity");
console.log(db.ts.get("humidity")); // Should return null or an error

// Test: Querying Out-of-Bounds Range
console.log("\n✅ TS.RANGE Out-of-Bounds Test");
const outOfBoundsData = db.ts.range("temperature", 0, 1000); // Before Unix epoch
console.log(outOfBoundsData); // Should return an empty array []

db.saveSnapshot(); // Save the current state to a snapshot file