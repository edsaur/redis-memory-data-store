import db from "./db.js"; 

class TransactionStore {
  constructor(store, appendToAOF) {
    this.store = store;
    this.appendToAOF = appendToAOF;
    this.transactions = new Map(); // Active transactions per client
  }

  multi(clientId) {
    if (this.transactions.has(clientId)) {
      return "-ERR: Transaction already in progress\r\n";
    }
    this.transactions.set(clientId, []);
    return "+OK: Transaction started\r\n";
  }

  queueCommand(clientId, command) {
    if (!this.transactions.has(clientId)) {
      return "-ERR: No active transaction\r\n";
    }

    console.log(command);
    this.transactions.get(clientId).push(command);
    return "+QUEUED\r\n";
  }

  exec(clientId) {
    if (!this.transactions.has(clientId)) {
      return "-ERR: No active transaction\r\n";
    }

    let responses = [];
    let commands = this.transactions.get(clientId);

    for (const command of commands) {
      try {
        let result = eval(`db.${command}`); // Execute the command
        responses.push(result);
        this.appendToAOF(`db.execTransaction`, { command });
      } catch (error) {
        console.log(error);
        responses.push("-ERR: Failed to execute command");
      }
    }

    this.transactions.delete(clientId); // Clear transaction
    return responses.join("\n") + "\r\n";
  }

  discard(clientId) {
    if (!this.transactions.has(clientId)) {
      return "-ERR: No active transaction\r\n";
    }
    this.transactions.delete(clientId);
    return "+OK: Transaction discarded\r\n";
  }
}

export default TransactionStore;
