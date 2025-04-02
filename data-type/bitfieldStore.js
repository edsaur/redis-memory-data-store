class BitfieldStore {
  constructor(store, appendToAOF) {
    this.store = store;
    this.appendToAOF = appendToAOF; // AOF logging function
  }

  _getBinaryString(key) {
    return this.store.get(key) || "";
  }

  _setBinaryString(key, binaryStr) {
    this.store.set(key, binaryStr);
  }

  _intToBinary(value, bitSize, signed = false, overflowMode = "WRAP") {
    let maxVal = signed ? (1 << (bitSize - 1)) - 1 : (1 << bitSize) - 1;
    let minVal = signed ? -(1 << (bitSize - 1)) : 0;

    if (overflowMode === "FAIL" && (value > maxVal || value < minVal)) {
      throw new Error(
        `Value ${value} out of range for ${bitSize}-bit ${
          signed ? "signed" : "unsigned"
        } integer`
      );
    }

    if (overflowMode === "SAT") {
      value = Math.max(minVal, Math.min(maxVal, value)); // Clamp value to range ✅
    } else if (overflowMode === "WRAP") {
      value = ((value - minVal) % (maxVal - minVal + 1)) + minVal; // Wrap around
    }

    let binary = (value >>> 0).toString(2);
    binary = binary.slice(-bitSize).padStart(bitSize, "0");
    return binary;
  }

  _binaryToInt(binary, signed = false) {
    if (signed && binary[0] === "1") {
      return parseInt(binary, 2) - (1 << binary.length);
    }
    return parseInt(binary, 2);
  }

  _ensureSize(binaryString, offset, bitSize) {
    return binaryString.padEnd(offset + bitSize, "0");
  }

  setBitfield(key, type, offset, value, overflowMode = "WRAP") {
    const bitSize = parseInt(type.substring(1));
    const signed = type.startsWith("i");
    const binaryValue = this._intToBinary(value, bitSize, signed, overflowMode);

    let binaryString = this._getBinaryString(key);
    binaryString = this._ensureSize(binaryString, offset, bitSize);

    binaryString =
      binaryString.substring(0, offset) +
      binaryValue +
      binaryString.substring(offset + bitSize);

    this._setBinaryString(key, binaryString);

    // Append to AOF log
    this.appendToAOF("db.bitfield.setBitfield", {
      key,
      type,
      offset,
      value,
      overflowMode,
    });
  }

  getBitfield(key, type, offset) {
    const bitSize = parseInt(type.substring(1));
    const signed = type.startsWith("i");

    let binaryString = this._getBinaryString(key);
    if (binaryString.length < offset + bitSize) {
      return 0; // Default value if out of bounds
    }

    const binarySegment = binaryString.substring(offset, offset + bitSize);
    return this._binaryToInt(binarySegment, signed);
  }

  incrByBitfield(key, type, offset, increment, overflowMode = "WRAP") {
    const current = this.getBitfield(key, type, offset);
    const newValue = current + increment;
    this.setBitfield(key, type, offset, newValue, overflowMode);

    // Append to AOF log
    this.appendToAOF("db.bitfield.incrByBitfield", {
      key,
      type,
      offset,
      value,
      overflowMode,
    });

    return this.getBitfield(key, type, offset);
  }

  executeBitfieldOperations(key, operations, overflowMode = "WRAP") {
    let results = [];
    for (let op of operations) {
      const [operation, type, offset, value] = op;
      try {
        if (operation === "SET") {
          this.setBitfield(
            key,
            type,
            parseInt(offset),
            parseInt(value),
            overflowMode
          );
          results.push("OK");
        } else if (operation === "GET") {
          results.push(this.getBitfield(key, type, parseInt(offset)));
        } else if (operation === "INCRBY") {
          results.push(
            this.incrByBitfield(
              key,
              type,
              parseInt(offset),
              parseInt(value),
              overflowMode
            )
          );
        } else {
          results.push("ERR: Invalid operation " + operation);
        }
      } catch (error) {
        results.push("ERR: " + error.message);
      }
    }
    return results;
  }
}

export default BitfieldStore;
