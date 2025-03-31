import db from "../db.js";

db.geo.geoadd("cities", 40.7128, -74.0060, "NewYork");
db.geo.geoadd("cities", 34.0522, -118.2437, "LosAngeles");
db.geo.geoadd("cities", 14.5995, 120.9842, "Manila");


console.log(db.geo.geodist("cities", "NewYork", "Manila")); // ~3940 km
console.log(db.geo.geosearch("cities", 14.5547, 121.0244, 50)); // Finds NYC

db.saveSnapshot(); // Save the current state to a snapshot file