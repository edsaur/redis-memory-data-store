import fs from "fs";
import StringStore from "./data-type/stringStore.js";
import JsonStore from "./data-type/jsonStore.js";
import InMemoryStore from "./store.js";
import ListStore from "./data-type/listsStore.js";
import SetStore from "./data-type/setStore.js";
import HashStore from "./data-type/hashStore.js";
import SortedStore from "./data-type/sortedStore.js";

class RedisLikeDB {
  constructor(aofFile = "data.aof", snapshotFile = "data.snapshot.json") {
    this.store = new InMemoryStore();
    this.aofFile = aofFile;
    this.snapshotFile = snapshotFile;

    //  Initialize subsystems
    this.string = new StringStore(this.store, this.appendToAOF.bind(this));
    this.json = new JsonStore(this.store, this.appendToAOF.bind(this));
    this.list = new ListStore(this.store, this.appendToAOF.bind(this));
    this.set = new SetStore(this.store, this.appendToAOF.bind(this));
    this.hash = new HashStore(this.store, this.appendToAOF.bind(this));
    this.zset = new SortedStore(this.store, this.appendToAOF.bind(this));

    // Clear the store, AOF, and snapshot files on startup
    this.clearStore();
    this.clearAOF();
    this.clearSnapshot();

    //  Load snapshot file
    this.loadSnapshot();
    this.replayAOF();
  }

  appendToAOF(command, data) {
    const logEntry = JSON.stringify({ command, data });

    console.log("Appending to AOF:", logEntry); // ✅ Debug log
    fs.appendFileSync(this.aofFile, logEntry + "\n");
  }

  // Load snapshot file
  loadSnapshot() {
    if (fs.existsSync(this.snapshotFile)) {
      const data = fs.readFileSync(this.snapshotFile, "utf-8");
      const snapshotData = JSON.parse(data);

      for (const [key, value] of Object.entries(snapshotData)) {
        let parsedValue = value;
        if (Array.isArray(value)) {
          // Reconstruct Sets from arrays
          parsedValue = new Set(value);
        } else if (typeof value === 'object' && value !== null) {
          // Handle nested objects (for JSON data)
          parsedValue = value;
        }
        this.store.set(key, parsedValue);
      }
      console.log("Snapshot loaded");
    } else {
      console.log("No snapshot found");
    }
  }


  // Replay AOF file
  replayAOF() {
    if (!fs.existsSync(this.aofFile)) {
      fs.writeFileSync(this.aofFile, "");
      console.log("AOF file created");
      return;
    }

    const aofData = fs.readFileSync(this.aofFile, "utf-8").trim();
    if (!aofData) return; // File exists but is empty

    const commands = aofData.split("\n").filter((line) => line.trim() !== "");

    for (const command of commands) {
      try {
        JSON.parse(command);
      } catch (error) {
        console.error("❌ Error parsing AOF command:", error);
      }
    }

    console.log("✅ AOF replayed successfully");
  }

  //   Save snapshot file
  saveSnapshot() {
    const snapshotData = {};
    for (const [key, value] of this.store.store) {
      // Convert Sets to arrays for JSON serialization
      snapshotData[key] = value instanceof Set ? Array.from(value) : value;
    }
    fs.writeFileSync(this.snapshotFile, JSON.stringify(snapshotData, null, 2));
    console.log("Snapshot saved");
  }

  get(key) {
    return this.store.get(key);
  }

  // Clear the store
  clearStore() {
    this.store.store.clear();
    console.log("Store cleared");
  }
  // Clear the AOF file
  clearAOF() {
      fs.writeFileSync(this.aofFile, "");
      console.log("AOF file cleared");
  }
  // Clear the snapshot file
  clearSnapshot() {
      fs.writeFileSync(this.snapshotFile, "{}");
      console.log("Snapshot file cleared");
  }
}

const db = new RedisLikeDB();
export default db;
