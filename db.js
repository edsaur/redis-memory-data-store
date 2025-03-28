import fs from "fs";
import StringStore from "./data-type/stringStore.js";
import JsonStore from "./data-type/jsonStore.js";
import InMemoryStore from "./store.js";
import ListStore from "./data-type/listsStore.js";

class RedisLikeDB {
  constructor(aofFile = "data.aof", snapshotFile = "data.snapshot.json") {
    this.store = new InMemoryStore();
    this.aofFile = aofFile;
    this.snapshotFile = snapshotFile;

    //  Initialize subsystems
    this.string = new StringStore(this.store, this.appendToAOF.bind(this));
    this.json = new JsonStore(this.store, this.appendToAOF.bind(this));
    this.list = new ListStore(this.store, this.appendToAOF.bind(this));

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
        this.store.set(key, value);
      }
      console.log("Snapshot loaded");
    } else {
      console.log("No snapshot found");
    }
  }

  // Replay AOF file
  replayAOF() {
   if(!fs.existsSync(this.aofFile)) {
    fs.writeFileSync(this.aofFile, "");
    console.log("AOF file created");
    return;
   }

   const commands = fs.readFileSync(this.aofFile, "utf-8").split("\n");

   for (const command of commands) {
    try {
      const parsedCommand = JSON.parse(command)
      eval(parsedCommand);
    } catch (error) {
      console.error(error);
    }
   }

   console.log("AOF replayed");
  }

  //   Save snapshot file
  saveSnapshot() {
    fs.writeFileSync(this.snapshotFile, JSON.stringify(Object.fromEntries([...this.store.store]), null, 2));

    console.log("Snapshot saved");
  }

  get(key) {
    return this.store.get(key);
  }

}

const db = new RedisLikeDB();
export default db;


