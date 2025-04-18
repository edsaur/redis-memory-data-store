class GeoStore {
    constructor(store, appendToAOF) {
        this.store = store;
        this.appendToAOF = appendToAOF;
    }

    // Add a location with geohashing
    geoadd(key, lat, lon, name) {
        if (!this.store.has(key)) {
            this.store.set(key, new Map());
        }
        this.store.get(key).set(name, { lat, lon });
        this.appendToAOF("db.geo.geoadd", { key, lat, lon, name });

        return 1; // Success
    }

    // Search for locations within a given radius
    geosearch(key, lat, lon, radius) {
        if (!this.store.has(key)) return [];

        const results = [];
        for (const [name, location] of this.store.get(key)) {
            const dist = this.calculateDistance(lat, lon, location.lat, location.lon);
            if (dist <= radius) {
                results.push({ name, lat: location.lat, lon: location.lon, distance: dist + " KM"});
            }
        }
        return results;
    }

    // Get distance between two locations
    geodist(key, name1, name2) {
        if (!this.store.has(key)) return null;
        
        const loc1 = this.store.get(key).get(name1);
        const loc2 = this.store.get(key).get(name2);
        
        if (!loc1 || !loc2) return null;

        return this.calculateDistance(loc1.lat, loc1.lon, loc2.lat, loc2.lon) + " KM";
    }

    // Helper function to calculate distance using Haversine formula
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of Earth in km
        const rad = Math.PI / 180;
        const dLat = (lat2 - lat1) * rad;
        const dLon = (lon2 - lon1) * rad;

        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;

        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}

export default GeoStore;