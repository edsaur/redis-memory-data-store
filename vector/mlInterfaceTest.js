import ml from "./mlInterface.js";
async function runTests() {
  console.log("Running tests for ML Interface...\n");

  // Test: Store vectors
  console.log("Test 1: Storing vectors...");
  ml.setEmbedding("doc1", [0.3, 0.5, 0.9]);
  ml.setEmbedding("doc2", [0.31, 0.52, 0.91]);
  ml.setEmbedding("doc3", [0.2, 0.1, 0.4]);
  console.log("Vectors stored successfully!");

  // Test: Get stored vector
  console.log("\nTest 2: Retrieving stored vectors...");
  const doc1 = ml.getEmbedding("doc1");
  console.log("doc1 vector:", doc1);

  const doc2 = ml.getEmbedding("doc2");
  console.log("doc2 vector:", doc2);

  // Test: KNN Search (Cosine similarity)
  console.log("\nTest 3: KNN Search...");
  const results = ml.searchKNN([0.3, 0.5, 0.9], 2, "cosine");
  console.log("KNN Search Results (Cosine):", results);

  // Test: Basic vector operations (Dot product, Addition, Subtraction)
  console.log("\nTest 4: Vector operations...");
  const dotProduct = ml.dot("doc1", "doc2");
  console.log("Dot product between doc1 and doc2:", dotProduct);

  const sum = ml.add("doc1", "doc2");
  console.log("Sum of doc1 and doc2 vectors:", sum);

  const difference = ml.subtract("doc1", "doc2");
  console.log("Difference between doc1 and doc2 vectors:", difference);

  // Test: Batch insert
  console.log("\nTest 5: Batch Insert...");
  const batchResults = ml.batchInsert([
    { key: "doc4", vector: [0.1, 0.1, 0.2] },
    { key: "doc5", vector: [0.5, 0.5, 0.5] },
  ]);
  console.log(batchResults);

  // Retrieve batch inserted vectors to ensure they were added
  console.log("\nTest 6: Retrieve batch inserted vectors...");
  const doc4 = ml.getEmbedding("doc4");
  const doc5 = ml.getEmbedding("doc5");
  console.log("doc4 vector:", doc4);
  console.log("doc5 vector:", doc5);

  console.log("\nAll tests completed!");
}

// Run the tests
runTests().catch((error) => {
  console.error("Test run failed:", error);
});
