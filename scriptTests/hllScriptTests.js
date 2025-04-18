import db from "../core/db.js";
import assert from "assert";

// Add elements to hll_test
db.hll.pfAdd("hll_test", "element1", "element2");
db.hll.pfAdd("hll_test", "element3", "element4");
console.log("Estimated cardinality of hll_test:", db.hll.pfCount("hll_test"));
console.log("Actual amount hll_test:", db.hll.exactCount("hll_test"));
assert.ok(db.hll.pfCount("hll_test") >= 3, "hll_test cardinality should be at least 3");

// Add elements to hll_test2
db.hll.pfAdd("hll_test2", "element6", "element4", "element5");
console.log("Estimated cardinality of hll_test2:", db.hll.pfCount("hll_test2"));
console.log("Actual amount hll_test:", db.hll.exactCount("hll_test2"));
assert.ok(db.hll.pfCount("hll_test2") >= 3, "hll_test2 cardinality should be at least 3");

// Merge hll_test and hll_test2 into merged_hll
db.hll.pfMerge("merged_hll", "hll_test", "hll_test2");
console.log("Estimated cardinality of merged_hll:", db.hll.pfCount("merged_hll"));
console.log("Actual amount hll_test:", db.hll.exactCount("merged_hll"));
assert.ok(db.hll.pfCount("merged_hll") >= 5, "merged_hll cardinality should be at least 5");

// Add more elements to hll_test
db.hll.pfAdd("hll_test", "element6", "element7", "element8", "element9", "element10");
console.log("Estimated cardinality of hll_test after adding more elements:", db.hll.pfCount("hll_test"));
assert.ok(db.hll.pfCount("hll_test") >= 8, "hll_test cardinality should be at least 8");

// Merge hll_test and hll_test2 into merged_hll again
db.hll.pfMerge("merged_hll", "hll_test", "hll_test2");
console.log("Estimated cardinality of merged_hll after merging again:", db.hll.pfCount("merged_hll"));
assert.ok(db.hll.pfCount("merged_hll") >= 10, "merged_hll cardinality should be at least 10");

db.saveSnapshot(); // Save the current state to a snapshot file
