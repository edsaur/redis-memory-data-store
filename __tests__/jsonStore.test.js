import { jest } from "@jest/globals";
import JsonStore from "../data-type/jsonStore.js";

describe("JsonStore", () => {
  let store, mockAppendToAOF, jsonStore;

  beforeEach(() => {
    store = new Map();
    mockAppendToAOF = jest.fn(); // Mock AOF function
    jsonStore = new JsonStore(store, mockAppendToAOF);
  });

  test("should set and get a JSON object", () => {
    jsonStore.set("user:1", "$", { name: "Alice", age: 25 });
    expect(jsonStore.get("user:1")).toEqual({ name: "Alice", age: 25 });
    expect(mockAppendToAOF).toHaveBeenCalledWith("db.json.set", {
      key: "user:1",
      path: "$",
      value: { name: "Alice", age: 25 },
    });
  });

  test("should update an existing JSON key", () => {
    jsonStore.set("user:1", "$", { name: "Alice", age: 25 });
    jsonStore.set("user:1", "age", 30);

    expect(jsonStore.get("user:1", "age")).toBe(30);
    expect(mockAppendToAOF).toHaveBeenCalledWith("db.json.set", {
      key: "user:1",
      path: "age",
      value: 30,
    });
  });

  test("should delete a JSON key", () => {
    jsonStore.set("user:1", "$", { name: "Alice", age: 25 });

    expect(jsonStore.del("user:1")).toBe(true); // Successfully deleted
    expect(jsonStore.get("user:1")).toBe(null); // Ensure key is deleted
    expect(mockAppendToAOF).toHaveBeenCalledWith("db.json.del", {
      key: "user:1",
    });

    // Try deleting a non-existent key (should return false, not throw an error)
    expect(jsonStore.del("user:1")).toBe(false);
  });

  test("should append to an array in JSON", () => {
    jsonStore.set("user:1", "$", { skills: ["JavaScript"] });
    jsonStore.arrAppend("user:1", "skills", "Node.js");

    expect(jsonStore.get("user:1", "skills")).toEqual([
      "JavaScript",
      "Node.js",
    ]);
    expect(mockAppendToAOF).toHaveBeenCalledWith("db.json.arrAppend", {
      key: "user:1",
      path: "skills",
      value: "Node.js",
    });
  });
});
