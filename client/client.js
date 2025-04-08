import net from "net";
import db from "../db.js";

class RedisCloneClient {
  constructor(port = 6379, host = "127.0.0.1") {
    this.port = port;
    this.host = host;
    this.socket = null;
    this.reconnectDelay = 1000; // 1 second
    this.queue = [];
    this.buffer = "";
    this.connected = false; // Track connection state
    this.shouldReconnect = true; // Flag to control reconnection behavior
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection(
        { port: this.port, host: this.host },
        () => {
          console.log("✅ Connected to Redis-like server");
          this.connected = true;
          resolve();
        }
      );

      this.socket.on("data", (data) => {
        this.buffer += data.toString();
        if (this.buffer.includes("\n")) {
          const [response, ...rest] = this.buffer.split("\n");
          this.buffer = rest.join("\n");
          const callback = this.queue.shift();
          if (callback) callback(null, response.trim());
        }
      });

      this.socket.on("error", (err) => {
        console.log(err)
        if (err.code === "ECONNRESET") {
          console.error("❌ Connection reset by server.");
        } else {
          console.error("❌ Socket error:", err.message);
        }
        if (this.shouldReconnect && this.socket && !this.socket.destroyed) {
          this.reconnect();
        }
      });

      this.socket.on("end", () => {
        console.warn("⚠️ Disconnected from server");
        this.connected = false;
        if (this.shouldReconnect) {
          this.reconnect();
        }
      });

      this.socket.on("close", () => {
        console.log("⚠️ Connection closed");
      });
    });
  }

  reconnect() {
    setTimeout(() => {
      console.log("🔄 Reconnecting...");
      this.connect().catch((err) => console.error("Failed to reconnect:", err));
    }, this.reconnectDelay);
  }

  sendCommand(command) {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.destroyed) {
        return reject(new Error("Client not connected"));
      }

      this.socket.write(`${command}\n`);
      this.queue.push((err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }

  disconnect() {
    if (this.socket && this.connected) {
      this.socket.end(); // Gracefully terminate the connection
      console.log("🛑 Client disconnected gracefully");

      // We should avoid destroying the socket immediately as it could cause ECONNRESET errors
      this.socket.once("close", () => {
        this.socket.destroy();
      });

      this.connected = false; // Update connection state
      this.shouldReconnect = false; // Stop reconnection after disconnection
    } else {
      console.warn("Client is not connected.");
    }

    db.clearStore(); // Assuming `db.clearStore` is to clean the server state on disconnect
  }

  // Supported commands (add more as needed)
  async set(key, value) {
    return await this.sendCommand(`SET ${key} ${value}`);
  }

  async get(key) {
    return await this.sendCommand(`GET ${key}`);
  }

  async del(key) {
    return await this.sendCommand(`DEL ${key}`);
  }

  async jsonSet(key, path, value) {
    return await this.sendCommand(
      `JSON.SET ${key} ${path} ${JSON.stringify(value)}`
    );
  }

  async jsonGet(key, path) {
    return await this.sendCommand(`JSON.GET ${key} ${path}`);
  }

  async jsonArrAppend(key, path, value) {
    return await this.sendCommand(
      `JSON.ARRAPPEND ${key} ${path} ${JSON.stringify(value)}`
    );
  }

  async jsonDelete(key) {
    return await this.sendCommand(`JSON.DEL ${key}`);
  }

  async lpush(key, value) {
    return await this.sendCommand(`LPUSH ${key} ${value}`);
  }

  async lpop(key) {
    return await this.sendCommand(`LPOP ${key}`);
  }

  async rpush(key, value) {
    return await this.sendCommand(`RPUSH ${key} ${value}`);
  }

  async rpop(key) {
    return await this.sendCommand(`RPOP ${key}`);
  }

  async lset(key, index, value) {
    return await this.sendCommand(`LSET ${key} ${index} ${value}`);
  }

  async sadd(key, ...values) {
    return await this.sendCommand(`SADD ${key} ${values.join(" ")}`);
  }

  async saveSnapshot() {
    return await this.sendCommand(`SAVE`);
  }
}

const client = new RedisCloneClient(6379, "localhost");

export default client;
