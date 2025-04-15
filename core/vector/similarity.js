import vectorStore from "./vectorStore.js";

class VectorSimilarity {
  constructor() {
    this.buckets = new Map(); // For basic LSH-style bucketing (hash -> [keys])

    // Register available distance metrics
    this.distanceMetrics = {
      cosine: this.cosineSimilarity,
      euclidean: this.euclideanDistance,
    };
  }

  // Hash function for LSH bucketing
  _hashVector(vector, numBits = 8) {
    return vector
      .slice(0, numBits)
      .map((val) => (val >= 0 ? "1" : "0"))
      .join("");
  }

  // Add a vector to the LSH bucket (for potential optimization later)
  indexVector(key) {
    const vector = vectorStore.getVector(key);
    if (!vector) throw new Error(`No vector found for key: ${key}`);

    const hash = this._hashVector(vector);
    if (!this.buckets.has(hash)) {
      this.buckets.set(hash, []);
    }
    this.buckets.get(hash).push(key);
  }

  // K-Nearest Neighbor Search
  knnSearch(queryVector, k = 3, metric = "cosine") {
    const distanceFn = this.distanceMetrics[metric];
    if (!distanceFn) {
      throw new Error(`Unsupported distance metric: ${metric}`);
    }

    const candidates = [];

    for (const [key, vector] of vectorStore.vectors.entries()) {
      const distance = distanceFn.call(this, queryVector, vector);
      candidates.push({ key, distance });
    }

    // Sort based on metric type
    return metric === "cosine"
      ? candidates.sort((a, b) => b.distance - a.distance).slice(0, k) // higher = better
      : candidates.sort((a, b) => a.distance - b.distance).slice(0, k); // lower = better
  }

  euclideanDistance(a, b) {
    if (a.length !== b.length) throw new Error("Vector dimensions must match");
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  }

  cosineSimilarity(a, b) {
    if (a.length !== b.length) throw new Error("Vector dimensions must match");

    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));

    if (normA === 0 || normB === 0) return 0;
    return dot / (normA * normB);
  }
}

const similarity = new VectorSimilarity();
export default similarity;