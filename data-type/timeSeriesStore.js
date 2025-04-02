class TimeSeriesStore {
    constructor(store, appendToAOF) {
        this.store = store; // To persist data (e.g., Redis-like in-memory store)
        this.appendToAOF = appendToAOF; // To append commands to AOF file
    }

    // TS.CREATE - Create a new time series
    create(key) {
        if (this.store.has(key)) {
            throw new Error(`Time series ${key} already exists`);
        }
        this.store.set(key, []);
        this.appendToAOF(`TS.CREATE ${key}`);
    }

    // TS.ADD - Add a data point to the time series
    add(key, timestamp, value) {
        if (!this.store.has(key)) {
            throw new Error(`Time series ${key} does not exist`);
        }
        const timeSeries = this.store.get(key);
        timeSeries.push({ timestamp, value });
        this.appendToAOF(`TS.ADD ${key} ${timestamp} ${value}`);
    }

    // TS.RANGE - Get data points in the given time range
    range(key, startTime, endTime) {
        if (!this.store.has(key)) {
            throw new Error(`Time series ${key} does not exist`);
        }
        const timeSeries = this.store.get(key);
        return timeSeries.filter(({ timestamp }) => timestamp >= startTime && timestamp <= endTime);
    }

    // TS.GET - Get the most recent data point
    get(key) {
        if (!this.store.has(key)) {
            throw new Error(`Time series ${key} does not exist`);
        }
        const timeSeries = this.store.get(key);
        return timeSeries.length > 0 ? timeSeries[timeSeries.length - 1] : null;
    }
    
    // Downsampling: Aggregate values over a specified interval (e.g., average)
    downsample(key, interval) {
        if (!this.store.has(key)) {
            throw new Error(`Time series ${key} does not exist`);
        }
        const timeSeries = this.store.get(key);

        let aggregated = [];
        let currentIntervalStart = timeSeries[0].timestamp;
        let sum = 0;
        let count = 0;

        for (const { timestamp, value } of timeSeries) {
            if (timestamp >= currentIntervalStart + interval) {
                aggregated.push({
                    timestamp: currentIntervalStart + interval,
                    value: sum / count, // Calculate average for the interval
                });
                currentIntervalStart += interval;
                sum = 0;
                count = 0;
            }
            sum += value;
            count += 1;
        }

        // Add last interval
        if (count > 0) {
            aggregated.push({
                timestamp: currentIntervalStart + interval,
                value: sum / count,
            });
        }

        return aggregated;
    }

    // Aggregation: Sum over a specific interval (e.g., sum of values in a range)
    aggregate(key, startTime, endTime, aggregationType = 'sum') {
        const dataInRange = this.tsRange(key, startTime, endTime);
        let result;

        if (aggregationType === 'sum') {
            result = dataInRange.reduce((acc, { value }) => acc + value, 0);
        } else if (aggregationType === 'avg') {
            result = dataInRange.reduce((acc, { value }) => acc + value, 0) / dataInRange.length;
        }

        return result;
    }
}

export default TimeSeriesStore;
