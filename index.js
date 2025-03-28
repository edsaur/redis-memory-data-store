// import InMemoryStore from "./store.js";
import db from "./db.js";
// const db = new InMemoryStore();

// TEST CASES FOR STRINGS

// db.set("name", "John Doe");

// console.log("name exists: " + db.has("name")); // Output: true
// console.log("User's name is " + db.get("name")); // Output: "John Doe"

// db.string.append("name", " Smith"); // Output: "John Doe Smith"
// console.log("User's new name is " + db.get("name"));

// console.log(db.string.strlen("name") + " characters"); // Output: 14

// // TEST CASES FOR RANGES
// console.log(db.string.getRange("name", 0, 4)); // Output: "John"

// db.string.setRange("name", 8, " Dionido");
// console.log("User's new name is " + db.get("name"));

// //  TEST CASES FOR NUMBERS
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


// TEST CASES FOR JSON
// db.json.set("user:1", "$", {
//   name: "John Doe",
//   age: 30,
//   skills: ["HTML", "CSS", "JavaScript"],
// });
// console.log(`First time: ${JSON.stringify(db.json.get("user:1"))}`);

// db.json.set("user:1", "skills[2]", "Node.js");
// console.log(`This gets the skills: ${JSON.stringify(db.json.get("user:1", "skills"))}`);

// db.json.set("user:1", "hobbies[0]", "Gaming"); // creates a new array if it doesn't exist
// console.log(db.json.get("user:1"));

// db.json.arrAppend("user:1", "skills", "Python"); // Should throw an error because path is not an array

// console.log(db.json.del("user:1", "skills")); // Deletes the specific path
// console.log(db.json.get("user:1"));


// TEST CASES FOR DB
// Test: String Store
db.string.set("username", "Alice");
console.log(db.string.get("username")); // "Alice"

db.string.append("username", "BobTheBuilder");
console.log(db.string.get("username")); // "AliceBob"

// Test: Number Store
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

// Test: JSON Store
db.json.set("user:1", "$", { name: "John", age: 30 });
console.log(db.json.get("user:1")); // { name: "John", age: 30 }
db.json.set("user:1", "skills[0]", "JavaScript");
console.log(db.json.get("user:1")); // { name: "John", age: 30, skills: ["JavaScript"] }


db.json.set("user:2", "$", {
  name: "John Doe",
  age: 30,
  skills: ["HTML", "CSS", "JavaScript"],
});
console.log(db.json.get("user:2")); // { name: "John", age: 30 }

db.json.set("user:2", "skills[2]", "Node.js");
console.log(`This gets the skills: ${JSON.stringify(db.json.get("user:2", "skills"))}`);

db.json.set("user:2", "hobbies[0]", "Gaming"); // creates a new array if it doesn't exist
console.log(db.json.get("user:2"));

db.json.arrAppend("user:2", "skills", "Python"); // Should throw an error because path is not an array

// Periodically save snapshot
setInterval(() => db.saveSnapshot(), 10000);