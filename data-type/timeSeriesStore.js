class TimeSeriesStore {
  constructor(store, appendToAOF) {
    this.store = store; // To persist data (e.g., Redis-like in-memory store)
    this.appendToAOF = appendToAOF; // To append commands to AOF file
  }

  // TS.CREATE - Create a new time series
  create(key) {
    if (this.store.has(key)) {
      return `Time series ${key} already exists`;
    }
    this.store.set(key, []);
    this.appendToAOF(`db.ts.create`, {key});
  }

  // TS.ADD - Add a data point to the time series
  add(key, timestamp, value) {
    if (!this.store.has(key)) {
      return `Time series ${key} does not exist`;
    }
    const timeSeries = this.store.get(key);
    timeSeries.push({ timestamp, value }); // Append new data point

    this.appendToAOF(`db.ts.add`, {key, timestamp, value});
 
  }

  // TS.RANGE - Get data points in the given time range
  range(key, startTime, endTime) {
    if (!this.store.has(key)) {
      return `Time series ${key} does not exist`;
    }
    const timeSeries = this.store.get(key);
    return timeSeries.filter(
      ({ timestamp }) => timestamp >= startTime && timestamp <= endTime
    );
  }

  // TS.GET - Get the most recent data point
  get(key) {
    if (!this.store.has(key)) {
      return `Time series ${key} does not exist`;
    }
    const timeSeries = this.store.get(key);
    return timeSeries.length > 0 ? timeSeries[timeSeries.length - 1] : null;
  }

  // TS.DOWNSAMPLE - Downsample the time series to a specified interval
  downsample(key, interval) {
    if (!this.store.has(key)) {
      return `Time series ${key} does not exist`;
    }
    const timeSeries = this.store.get(key);
    const grouped = new Map();
  
    for (const { timestamp, value } of timeSeries) {
      const bucket = Math.floor(timestamp / interval) * interval;
  
      if (!grouped.has(bucket)) {
        grouped.set(bucket, { sum: 0, count: 0 });
      }
  
      const entry = grouped.get(bucket);
      entry.sum += value;
      entry.count += 1;
    }
  
    // Now aggregate each bucket
    const result = [];
    for (const [timestamp, { sum, count }] of grouped.entries()) {
      result.push({ timestamp, value: sum / count });
    }
  
    // Sort by timestamp
    return result.sort((a, b) => a.timestamp - b.timestamp);
  }
  

  // Aggregation: Sum over a specific interval (e.g., sum of values in a range)
  aggregate(key, startTime, endTime, aggregationType = "sum") {
    const dataInRange = this.range(key, startTime, endTime);
    let result;

    if (aggregationType === "SUM") {
      result = dataInRange.reduce((acc, { value }) => acc + value, 0);
    } else if (aggregationType === "AVG") {
      result =
        dataInRange.reduce((acc, { value }) => acc + value, 0) /
        dataInRange.length;
    } else if (aggregationType === "MAX") {
      result = Math.max(...dataInRange.map(({ value }) => value));
    } else if (aggregationType === "MIN") {
      result = Math.min(...dataInRange.map(({ value }) => value));
    } else if (aggregationType === "COUNT") {
      result = dataInRange.length; // Number of points in the range
    } else if (aggregationType === "FIRST") {
      result = dataInRange.length > 0 ? dataInRange[0].value : null; // First data point
    } else if (aggregationType === "LAST") {
      result =
        dataInRange.length > 0
          ? dataInRange[dataInRange.length - 1].value
          : null; // Last data point
    } else {
      return `Unsupported aggregation type: ${aggregationType}`;
    }

    return result + "\u00B0C";
  }
}

export default TimeSeriesStore;
