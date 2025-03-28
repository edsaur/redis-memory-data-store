import db from "./db.js";

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

db.list.lpush("users", "Alice", "Bob", "Charlie");
console.log(db.list.lrange("users", 0, -1));


// Periodically save snapshot
setInterval(() => db.saveSnapshot(), 10000);