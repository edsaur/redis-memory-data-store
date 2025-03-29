import db from "../db.js";

// Add fruits to the "fruits" set
db.set.sadd("fruits", "Apple", "Banana", "Cherry");
db.set.sadd("fruits", "Dragonfruit", "Elderberry");
console.log("All fruits:", db.set.smembers("fruits"));

// Remove some fruits
db.set.srem("fruits", "Apple", "Elderberry");
console.log("After removal:", db.set.smembers("fruits"));

// Set operations with another fruit set "tropicalFruits"
db.set.sadd("tropicalFruits", "Mango", "Pineapple", "Banana");
console.log("Intersection:", db.set.sinter("fruits", "tropicalFruits")); // Common fruits
console.log("Union:", db.set.sunion("fruits", "tropicalFruits")); // All unique fruits
console.log("Difference:", db.set.sdiff("fruits", "tropicalFruits")); // Fruits in "fruits" but not in "tropicalFruits"


db.saveSnapshot();

