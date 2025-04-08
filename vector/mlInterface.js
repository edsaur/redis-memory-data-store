import vectorStore from "./vectorStore.js";
import similarity from "./similarity.js";

class MLInterface {
  // Store an embedding vector
  setEmbedding(key, vector) {
    vectorStore.setVector(key, vector);
    similarity.indexVector(key); // optional indexing
    return "+OK";
  }

  // Get embedding by key
  getEmbedding(key) {
    return vectorStore.getVector(key);
  }

  // Search for top-K similar vectors
  searchKNN(queryVector, k = 5, distance = "cosine") {
    return similarity.knnSearch(queryVector, k, distance);
  }

  // Batch insert embeddings
  batchInsert(batch) {
    for (const { key, vector } of batch) {
      this.setEmbedding(key, vector);
    }
    return `+OK ${batch.length} inserted`;
  }

  // Useful for debugging or understanding vector ops
  dot(key1, key2) {
    const vector1 = vectorStore.getVector(key1);
    const vector2 = vectorStore.getVector(key2);
    return vectorStore.dotProduct(vector1, vector2);
  }

  add(key1, key2) {
    const vector1 = vectorStore.getVector(key1);
    const vector2 = vectorStore.getVector(key2);
    return vectorStore.add(vector1, vector2);
  }

  subtract(key1, key2) {
    const vector1 = vectorStore.getVector(key1);
    const vector2 = vectorStore.getVector(key2);
    return vectorStore.subtract(vector1, vector2);
  }
}

const ml = new MLInterface();

export default ml;
