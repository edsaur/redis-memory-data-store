import InMemoryStore from "./store.js";

const store = new InMemoryStore();

// TEST CASES FOR STRINGS

store.set("name", "John Doe");

console.log("name exists: " + store.has("name")); // Output: true
console.log("User's name is" + store.get("name")); // Output: "John Doe"

store.append("name", " Smith"); // Output: "John Doe Smith"
console.log("User's new name is" + store.get("name"));

console.log(store.strlen("name") + " characters"); // Output: 13

// TEST CASES FOR RANGES
console.log(store.getRange("name", 0, 4)); // Output: "John"
store.setRange("name", 9, " Dionido");
console.log("User's new name is" + store.get("name"));

//  TEST CASES FOR NUMBERS
store.set("age", 30);
console.log("User's initial: " + store.get("age")); // Output: 30

store.incr("age");
console.log("age increment: " + store.get("age")); // Output: 31

store.decr("age");
console.log("age decremented: " + store.get("age")); // Output: 30

store.incrBy("age", 5);
console.log("age incremented by 5: " + store.get("age")); // Output: 35

store.decBy("age", 5);
console.log("age decremented by 5: " + store.get("age")); // Output: 30
