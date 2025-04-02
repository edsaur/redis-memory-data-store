class BitmapsStore {
  constructor(store, appendToAOF) {
    this.store = store;
    this.appendToAOF = appendToAOF;
  }

  setBit(key, offset, value) {
    if (value !== 0 && value !== 1) {
      return false;
    }

    let binaryStr = this.store.get(key) || "";
    let binaryArr = binaryStr.split("").map(Number);

    while (binaryArr.length <= offset) {
      binaryArr.push(0);
    }

    binaryArr[offset] = value;
    this.store.set(key, binaryArr.join(""));
    this.appendToAOF("db.bitmaps.setBitmap", { key, offset, value });

    return value;
  }

  getBit(key, offset) {
    const binaryStr = this.store.get(key) || "";
    return offset < binaryStr.length ? Number(binaryStr[offset]) : 0;
  }

  bitCount(key) {
    const binaryStr = this.store.get(key) || "";
    return (binaryStr.match(/1/g) || []).length;
  }

  bitOp(op, destKey, ...keys) {
    const bitArr = keys.map((key) => this.store.get(key) || "0");
    const maxLength = Math.max(...bitArr.map((str) => str.length));
    const resultArr = Array(maxLength).fill(0);

    for (let i = 0; i < maxLength; i++) {
      const bits = bitArr.map((str) => str[i] || "0").map(Number);
      switch (op) {
        case "AND":
          resultArr[i] = bits.reduce((acc, bit) => acc & bit, 1);
          break;
        case "OR":
          resultArr[i] = bits.reduce((acc, bit) => acc | bit, 0);
          break;
        case "XOR":
          resultArr[i] = bits.reduce((acc, bit) => acc ^ bit, 0);
          break;
        case "NOT":
          for (let i = 0; i < bits.length; i++) {
            resultArr[i] = bits[i] === 0 ? 1 : 0; // Flip each bit
          }
          break;
        default:
          return false; // Invalid operation
      }
    }

    this.store.set(destKey, resultArr.join(""));
    this.appendToAOF("db.bitmaps.bitOp", { op, destKey, keys });
    return resultArr.length;
  }
}

export default BitmapsStore;
