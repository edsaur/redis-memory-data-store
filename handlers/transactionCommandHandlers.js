export const transactionCommandHandlers = {
  SET: (db, args) => {
    const [key, ...valueParts] = args;
    const value = valueParts.join(" ");
    db.string.set(key, value);
    return "+OK";
  },
  "GET": (db, args) => {
    const [key] = args;
    const value = db.string.get(key);
    return value !== null ? `+${value}` : "$-1";
  },
  "JSON.SET": (db, args) => {
    const [key, path, ...valueParts] = args;
    const value = JSON.parse(valueParts.join(" "));
    db.json.set(key, path, value);
    return "+OK";
  },
  "JSON.GET": (db, args) => {
    const [key, path] = args;
    const value = db.json.get(key, path);
    return value !== null ? `+${JSON.stringify(value)}` : "$-1";
  },
  "JSON.ARRAPPEND": (db, args) => {
    const [key, path, ...valueParts] = args;
    const value = JSON.parse(valueParts.join(" "));
    db.json.arrAppend(key, path, value);
    return "+OK";
  },
  "JSON.DELETE": (db, args) => {
    const [key, path] = args;
    db.json.delete(key, path || "$");
    return "+OK";
  },
  "LPUSH": (db, args) => {
    const [key, ...values] = args;
    db.list.lpush(key, ...values);
    return "+OK";
  },
  "RPUSH": (db, args) => {
    const [key, ...values] = args;
    db.list.rpush(key, ...values);
    return "+OK";
  },
  "LPOP": (db, args) => {
    const [key] = args;
    const value = db.list.lpop(key);
    return value !== null ? `+${value}` : "$-1";
  },
  "RPOP": (db, args) => {
    const [key] = args;
    const value = db.list.rpop(key);
    return value !== null ? `+${value}` : "$-1";
  },
};