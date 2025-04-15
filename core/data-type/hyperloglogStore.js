import { createHash } from "crypto";

class HyperLogLogStore {
  constructor(store, appendToAOF, registersCount = 16) {
    this.store = store; // To persist data (e.g., Redis-like in-memory store)
    this.appendToAOF = appendToAOF; // To append commands to AOF file
    this.registersCount = registersCount; // Number of registers (buckets) for HyperLogLog
    this.exactSets = new Map(); // Map to store exact elements
  }

  // Hash function using SHA-1 for better distribution
  _hash(value) {
    const hash = createHash("sha1").update(value).digest("hex");
    const parsedHash = parseInt(hash.substring(0, 8), 16); // Use first 8 hex characters (32 bits)
    console.log(`Hash for ${value}: ${parsedHash}`);
    return parsedHash;
  }

  // Calculate the leading zeros of a hash
  _leadingZeroes(hash) {
    let leadingZeroes = 0;
    if (hash === 0) {
      return 32; // Special case for hash = 0
    }
    for (let i = 31; i >= 0; i--) {
      if ((hash & (1 << i)) !== 0) {
        break;
      }
      leadingZeroes++;
    }
    return leadingZeroes;
  }


  // PFADD - Adds elements to the HyperLogLog and exact set
  pfAdd(key, ...elements) {
    // Get the current HyperLogLog from the store
    let hyperLogLog = this.store.get(key);
    if (!hyperLogLog) {
      // Initialize HyperLogLog if not exists
      hyperLogLog = new Array(this.registersCount).fill(0);
    }

    elements.forEach((element) => {
      const hash = this._hash(element);
      const registerIndex = hash % this.registersCount; // Assign to a register (bucket)
      const leadingZeroes = this._leadingZeroes(hash);
      hyperLogLog[registerIndex] = Math.max(
        hyperLogLog[registerIndex],
        leadingZeroes
      );
    });

    this.store.set(key, hyperLogLog);

    // Update exact set
    if (!this.exactSets.has(key)) {
      this.exactSets.set(key, new Set());
    }
    const exactSet = this.exactSets.get(key);
    elements.forEach((element) => exactSet.add(element));

    this.appendToAOF("db.hll.pfAdd", { key, elements });
  }

  pfCount(key) {
    const hyperLogLog = this.store.get(key);
    if (!hyperLogLog) {
      return 0; // No elements added, estimated cardinality is 0
    }

    const registersCount = hyperLogLog.length;
    let alpha;

    // Determine the correct alpha value based on the number of registers
    if (registersCount === 16) {
      alpha = 0.673;
    } else if (registersCount === 32) {
      alpha = 0.697;
    } else if (registersCount === 64) {
      alpha = 0.709;
    } else {
      alpha = 0.7213 / (1 + 1.079 / registersCount);
    }

    let sum = 0;

    // Calculate the harmonic mean of the registers
    for (let i = 0; i < registersCount; i++) {
      sum += Math.pow(2, -hyperLogLog[i]);
    }

    // HyperLogLog cardinality estimation formula
    const rawEstimate = (alpha * Math.pow(registersCount, 2)) / sum;
    return Math.round(rawEstimate);
  }

  // PFMERGE - Merges multiple HyperLogLogs
  pfMerge(destKey, ...sourceKeys) {
    let mergedHLL = new Array(this.registersCount).fill(0);

    sourceKeys.forEach((sourceKey) => {
      const hyperLogLog = this.store.get(sourceKey);
      if (hyperLogLog) {
        for (let i = 0; i < this.registersCount; i++) {
          mergedHLL[i] = Math.max(mergedHLL[i], hyperLogLog[i]);
        }
      }
    });

    this.store.set(destKey, mergedHLL);
    this.appendToAOF("db.hll.pfMerge", { destKey, ...sourceKeys });
  }

  // Exact count of unique elements
  exactCount(key) {
    const exactSet = this.exactSets.get(key);
    return exactSet ? exactSet.size : 0;
  }
}

export default HyperLogLogStore;
