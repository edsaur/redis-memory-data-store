class TTLStore {
    constructor(store, appendToAOF) {
        this.store = store;
        this.expirations = new Map(); // Stores expiration timestamps
        this.appendToAOF = appendToAOF;
    }

    expire(key, seconds) {
        if (!this.store.has(key)) return 0; // Key does not exist
        this.expirations.set(key, Date.now() + seconds * 1000);
        this.appendToAOF("db.ttl.expire", { key, seconds });
        return 1; // Success
    }

    pexpire(key, milliseconds) {
        if (!this.store.has(key)) return 0;
        this.expirations.set(key, Date.now() + milliseconds);
        this.appendToAOF("db.ttl.pexpire", { key, milliseconds });
        return 1;
    }

    ttl(key) {
        if (!this.store.has(key)) return -2; // Key does not exist
        if (!this.expirations.has(key)) return -1; // No TTL set
        const remaining = (this.expirations.get(key) - Date.now()) / 1000;
        return remaining > 0 ? Math.floor(remaining) : -2; // Expired
    }

    pttl(key) {
        if (!this.store.has(key)) return -2;
        if (!this.expirations.has(key)) return -1;
        const remaining = this.expirations.get(key) - Date.now();
        return remaining > 0 ? remaining : -2;
    }

    persist(key) {
        if (!this.store.has(key) || !this.expirations.has(key)) return 0;
        this.expirations.delete(key);
        this.appendToAOF("db.ttl.persist", { key });
        return 1;
    }

    // Clean up expired keys
    cleanup() {
        const now = Date.now();
        for (const [key, expireAt] of this.expirations.entries()) {
            if (expireAt <= now) {
                this.store.remove(key);
                this.expirations.delete(key);
            }
        }
    }
}

export default TTLStore;
