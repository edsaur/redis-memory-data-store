import db from "../db.js";

// // Test: Creating a Time Series
// console.log("\n✅ TS.CREATE Test");
// db.ts.create("temperature");
// console.log(db.get("temperature")); // Should print an empty array []

// // Get current timestamp
// const now = Date.now();
// const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

// // Test: Adding Data Points (1-hour intervals)
// console.log("\n✅ TS.ADD Test with 1-Hour Intervals");
// const timestamps = [
//     now - 3 * oneHour, // 3 hours ago
//     now - 2 * oneHour, // 2 hours ago
//     now - 1 * oneHour, // 1 hour ago
//     now // Now
// ];

// const values = [18.5, 20.1, 21.3, 22.8];

// timestamps.forEach((timestamp, index) => {
//     db.ts.add("temperature", timestamp, values[index]);
// });

// console.log(db.get("temperature")); // Should print stored data with timestamps

// // Test: Getting Latest Data Point
// console.log("\n✅ TS.GET Test");
// const latest = db.ts.get("temperature");
// console.log("latest: " + latest); // Should print the latest timestamp and value

// // Test: Querying a Range of Data (Last 3 Hours)
// console.log("\n✅ TS.RANGE Test (Last 3 Hours)");
// const rangeData = db.ts.range("temperature", now - 3 * oneHour, now);
// console.log("Ranges Data: " + rangeData); // Should return all data points in the last 3 hours

// // Test: Edge Case - Querying an Empty Series
// console.log("\n✅ TS.GET on Empty Series");
// db.ts.create("humidity");
// console.log(db.ts.get("humidity")); // Should return undefined

// // Test: Querying Out-of-Bounds Range
// console.log("\n✅ TS.RANGE Out-of-Bounds Test");
// const outOfBoundsData = db.ts.range("temperature", 0, now - 4 * oneHour); // Before first data point
// console.log(outOfBoundsData); // Should return an empty array []


// Create a new time series
db.ts.create("temperature");

// Add hourly temperature readings (realistic timestamps)
const now = Date.now();
for (let i = 0; i < 24; i++) {  // Simulating 24 hours of data
    db.ts.add("temperature", now - (i * 3600 * 1000), Math.floor(Math.random() * 10) + 20);
}

// ✅ Downsampling: Reduce to 3-hour intervals
console.log("\n✅ TS.DOWNSAMPLE (3-hour intervals)");
const downsampledData = db.ts.downsample("temperature", 3 * 3600 * 1000);
console.log(downsampledData);  // Expect fewer data points

// ✅ Aggregation: Get average temperature over the last 12 hours
console.log("\n✅ TS.AGGREGATE (AVG over last 12 hours)");
const avgTemp = db.ts.aggregate("temperature", now - (12 * 3600 * 1000), now, "AVG");
console.log(`Average Temperature (last 12h): ${avgTemp}`);

// ✅ Aggregation: Get maximum temperature over last 6 hours
console.log("\n✅ TS.AGGREGATE (MAX over last 6 hours)");
const maxTemp = db.ts.aggregate("temperature", now - (6 * 3600 * 1000), now, "MAX");
console.log(`Max Temperature (last 6h): ${maxTemp}`);


db.saveSnapshot();