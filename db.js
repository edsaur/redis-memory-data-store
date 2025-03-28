import fs from "fs";
import StringStore from "./data-type/stringStore.js";
import JsonStore from "./data-type/jsonStore.js";
import InMemoryStore from "./store.js";
import ListStore from "./data-type/listsStore.js";
import SetStore from "./data-type/setStore.js";
import HashStore from "./data-type/hashStore.js";

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
        // Only parse if the value is a string AND it looks like a JSON object (starts and ends with curly braces)
        const parsedValue =
          typeof value === "string" &&
          value.startsWith("{") &&
          value.endsWith("}")
            ? JSON.parse(value)
            : value;
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
}

const db = new RedisLikeDB();
export default db;
