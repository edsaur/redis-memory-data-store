class VectorStore {
    constructor() {
      this.vectors = new Map(); // key: string, value: number[]
    }
  
    setVector(key, vector) {
      if (!Array.isArray(vector) || !vector.every((v) => typeof v === "number")) {
        throw new Error("Vector must be an array of numbers");
      }
      this.vectors.set(key, vector);
      return "+OK";
    }
  
    getVector(key) {
      if (!this.vectors.has(key)) {
        return null;
      }
      return this.vectors.get(key);
    }
  
    hasVector(key) {
      return this.vectors.has(key);
    }
  
    deleteVector(key) {
      return this.vectors.delete(key);
    }
  
    allVectors() {
      return Array.from(this.vectors.values());
    }
  
    clearStore() {
      this.vectors.clear();
    }
  
    // OPERATIONS
    add(a, b) {
      if (a.length !== b.length) throw new Error("Vector dimensions must match");
      return a.map((val, i) => val + b[i]);
    }
  
    subtract(a, b) {
      if (a.length !== b.length) throw new Error("Vector dimensions must match");
      return a.map((val, i) => val - b[i]);
    }
  
    dotProduct(a, b) {
      console.log(a, b);
      if (!Array.isArray(a) || !Array.isArray(b)) {
        throw new Error("Both inputs must be arrays");
      }
  
      if (a.length !== b.length) {
        throw new Error("Vector dimensions must match");
      }
  
      return a.reduce((sum, val, i) => sum + val * b[i], 0);
    }
  }
  
  const vectorStore = new VectorStore();
  
  export default vectorStore;
  