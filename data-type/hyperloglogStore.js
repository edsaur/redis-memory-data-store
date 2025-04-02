import { createHash } from 'crypto';

class HyperLogLogStore {
    constructor(store, appendToAOF, registersCount = 16) {
        this.store = store; // To persist data (e.g., Redis-like in-memory store)
        this.appendToAOF = appendToAOF; // To append commands to AOF file
        this.registersCount = registersCount; // Number of registers (buckets) for HyperLogLog
    }

    // Hash function using SHA-1 for better distribution
    _hash(value) {
        const hash = createHash('sha1').update(value).digest('hex');
        return parseInt(hash.substring(0, 8), 16); // Use first 8 hex characters (32 bits)
    }

    // Calculate the leading zeros of a hash
    _leadingZeroes(hash) {
        let leadingZeroes = 0;
        let value = hash;
        while ((value & 0x80000000) === 0 && leadingZeroes < 32) {
            leadingZeroes++;
            value <<= 1;
        }
        return leadingZeroes;
    }

    // PFADD - Adds elements to the HyperLogLog
    pfAdd(key, ...elements) {
        // Get the current HyperLogLog from the store
        let hyperLogLog = this.store.get(key);
        if (!hyperLogLog) {
            // Initialize HyperLogLog if not exists
            hyperLogLog = new Array(this.registersCount).fill(0);
        }

        elements.forEach(element => {
            const hash = this._hash(element);
            const registerIndex = hash % this.registersCount; // Assign to a register (bucket)
            const leadingZeroes = this._leadingZeroes(hash);
            hyperLogLog[registerIndex] = Math.max(hyperLogLog[registerIndex], leadingZeroes);
        });

        this.store.set(key, hyperLogLog);
        
        this.appendToAOF('db.hll.pfadd', {key, ...elements});
    }

    // PFCOUNT - Returns the estimated cardinality
    pfCount(key) {
        const hyperLogLog = this.store.get(key);
        if (!hyperLogLog) {
            return 0; // No elements added, estimated cardinality is 0
        }

        const registersCount = hyperLogLog.length;
        let sum = 0;

        // Calculate the harmonic mean of the registers
        for (let i = 0; i < registersCount; i++) {
            sum += Math.pow(2, -hyperLogLog[i]);
        }

        // HyperLogLog cardinality estimation formula
        const rawEstimate = (0.7213 / (1 + 1.079 / registersCount)) * Math.pow(registersCount, 2) / sum;
        return Math.round(rawEstimate);
    }

    // PFMERGE - Merges multiple HyperLogLogs
    pfMerge(destKey, ...sourceKeys) {
        let mergedHLL = new Array(this.registersCount).fill(0);

        sourceKeys.forEach(sourceKey => {
            const hyperLogLog = this.store.get(sourceKey);
            if (hyperLogLog) {
                for (let i = 0; i < this.registersCount; i++) {
                    mergedHLL[i] = Math.max(mergedHLL[i], hyperLogLog[i]);
                }
            }
        });

        this.store.set(destKey, mergedHLL);
        this.appendToAOF('db.hll.pfmerge', {destKey, ...sourceKeys});
    }
}

export default HyperLogLogStore;
