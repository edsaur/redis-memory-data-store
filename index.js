import InMemoryStore from "./store.js";

const db = new InMemoryStore();

// TEST CASES FOR STRINGS

db.set("name", "John Doe");

console.log("name exists: " + db.has("name")); // Output: true
console.log("User's name is " + db.get("name")); // Output: "John Doe"

db.string.append("name", " Smith"); // Output: "John Doe Smith"
console.log("User's new name is " + db.get("name"));

console.log(db.string.strlen("name") + " characters"); // Output: 14

// TEST CASES FOR RANGES
console.log(db.string.getRange("name", 0, 4)); // Output: "John"

db.string.setRange("name", 8, " Dionido");
console.log("User's new name is " + db.get("name"));

//  TEST CASES FOR NUMBERS
db.string.set("age", 30);
console.log("User's initial: " + db.get("age")); // Output: 30

db.string.incr("age");
console.log("age increment: " + db.get("age")); // Output: 31

db.string.decr("age");
console.log("age decremented: " + db.get("age")); // Output: 30

db.string.incrBy("age", 5);
console.log("age incremented by 5: " + db.get("age")); // Output: 35

db.string.decBy("age", 5);
console.log("age decremented by 5: " + db.get("age")); // Output: 30
