class SkipListNode {
  constructor(score, value, level) {
    this.score = score;
    this.value = value;
    this.next = Array.from({ length: level }, () => null);
  }
}

export class SkipList {
  constructor(maxLevel = 5, p = 0.5) {
    this.maxLevel = maxLevel;
    this.p = p;
    this.head = new SkipListNode(-Infinity, null, maxLevel);
    this.level = 1;
  }

  randomLevel() {
    let level = 1;
    while (Math.random() < this.p && level < this.maxLevel) {
      level++;
    }
    return level;
  }

  insert(score, value) {
    const existing = this.find(value);
    if (existing) {
      // Optional: Update the score or skip
      this.remove(value);
    }

    let update = Array(this.maxLevel).fill(null);
    let curr = this.head;

    // Traverse the skip list to find the position to insert the new node
    for (let i = this.level - 1; i >= 0; i--) {
      while (curr.next[i] && curr.next[i].score < score) {
        curr = curr.next[i];
      }
      update[i] = curr; // Store the last node at each level
    }

    let nodeLevel = this.randomLevel(); // Determine the level of the new node
    if (nodeLevel > this.level) {
      for (let i = this.level; i < nodeLevel; i++) {
        update[i] = this.head; // Update the head for new levels
      }
      this.level = nodeLevel; // Update the current level of the skip list
    }

    let newNode = new SkipListNode(score, value, nodeLevel); // Create a new node
    for (let i = 0; i < nodeLevel; i++) {
      newNode.next[i] = update[i].next[i]; // Link the new node to the next nodes
      update[i].next[i] = newNode; // Link the previous nodes to the new node
    }
  }

  find(value) {
    let curr = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      while (curr.next[i] && curr.next[i].value < value) {
        curr = curr.next[i];
      }
    }
    curr = curr.next[0]; // Move to the next node at level 0
    return curr && curr.value === value ? curr : null; // Return the node if found
  }

  remove(value) {
    let update = Array(this.maxLevel).fill(null);
    let curr = this.head;

    // Traverse the skip list to find the node to remove
    for (let i = this.level - 1; i >= 0; i--) {
      while (curr.next[i] && curr.next[i].value < value) {
        curr = curr.next[i];
      }
      update[i] = curr; // Store the last node at each level
    }

    let nodeToRemove = curr.next[0]; // The node to remove is the next node at level 0
    if (!nodeToRemove || nodeToRemove.value !== value) return false; // Node not found

    for (let i = 0; i < this.level; i++) {
      if (update[i].next[i] !== nodeToRemove) break; // Stop if the next node is not the target
      update[i].next[i] = nodeToRemove.next[i]; // Bypass the node to remove it
    }

    while (this.level > 1 && this.head.next[this.level - 1] === null) {
      this.level--; // Decrease the level if necessary
    }
    return true; // Node removed successfully
  }

  range(start, end) {
    let resultArr = [];
    let curr = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      while (curr.next[i] && curr.next[i].score < start) {
        curr = curr.next[i];
      }
    }
    curr = curr.next[0];
    while (curr && curr.score <= end) {
      resultArr.push(curr.value);
      curr = curr.next[0];
    }
    return resultArr;
  }

  rank(val) {
    let curr = this.head;
    let rank = 0;

    for (let i = this.level - 1; i >= 0; i--) {
      while (curr.next[i] && curr.next[i].score < val) {
        rank++;
        curr = curr.next[i];
      }
    }
    curr = curr.next[0];
    return curr && curr.value === val ? rank : null; // Return the rank if found
  }
}

class SortedStore {
  constructor(store, appendToAOF) {
    this.store = store;
    this.appendToAOF = appendToAOF;
  }

  zadd(key, score, value) {
    if (!this.store.has(key) || !(this.store.get(key) instanceof SkipList)) {
      this.store.set(key, new SkipList());
    }

    this.store.get(key).insert(score, value);
    this.appendToAOF("db.zset.zadd", { key, score, value });
    return 1;
  }

  zrange(key, start, end) {
    if (!this.store.has(key)) return []; // Return an empty array if the key doesn't exist

    let values = this.store.get(key).range(-Infinity, Infinity); // Get the range of values

    return values.slice(start, end + 1); // Return the sliced array based on start and end indices
  }

  zrank(key, value) {
    if (!this.store.has(key)) return null; // Key does not exist

    const skipList = this.store.get(key); // Get the SkipList from the map
    let rank = 0;
    let curr = skipList.head.next[0]; // Start at the first element in the SkipList

    // Traverse the SkipList and rank the elements
    while (curr) {
      if (curr.value === value) {
        return rank; // Return the rank if the value is found
      }
      rank++; // Increment the rank as you go through the list
      curr = curr.next[0]; // Move to the next node at level 0
    }

    return null; // Return null if the value was not found
  }

  zrem(key, value) {
    if (!this.store.has(key)) return false; // Return false if the key doesn't exist

    this.appendToAOF("db.zset.zrem", { key, value }); // Append to AOF
    return this.store.get(key).remove(value); // Remove the value from the skip list
  }

  zrangebyscore(key, min, max) {
    if (!this.store.has(key)) return []; // Return an empty array if the key doesn't exist
    return this.store.get(key).range(min, max); // Get the range of values based on min and max scores
  }
}

export default SortedStore;
