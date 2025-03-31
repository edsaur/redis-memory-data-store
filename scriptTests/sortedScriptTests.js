import db from "../db.js";

db.zset.zadd("mySortedSet", 1, "one");
db.zset.zadd("mySortedSet", 2, "two");
db.zset.zadd("mySortedSet", 3, "three");
db.zset.zadd("mySortedSet", 4, "four");
db.zset.zadd("mySortedSet", 5, "five");
db.zset.zadd("mySortedSet", 6, "six");

console.log(db.zset.zrange("mySortedSet", 0, 6)); // [ 'one', 'two', 'three', 'four', 'five', 'six' ]
console.log(db.zset.zrange("mySortedSet", 0, 2)); // [ 'one', 'two', 'three' ]
console.log(db.zset.zrangebyscore("mySortedSet", 2, 5)); // [ 'two', 'three', 'four', 'five' ]

db.saveSnapshot();
