import db from "../db.js";

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

db.saveSnapshot();
