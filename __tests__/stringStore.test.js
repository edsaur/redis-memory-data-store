import {jest} from "@jest/globals";
import StringStore from "../data-type/stringStore.js";

describe("StringStore", () => {
  let store, mockAppendToAOF, stringStore;

  beforeEach(() => {
    store = new Map();
    mockAppendToAOF = jest.fn(); // Mock AOF function
    stringStore = new StringStore(store, mockAppendToAOF);
  });

  test("should set and get a string value", () => {
    stringStore.set("username", "Alice");
    expect(stringStore.get("username")).toBe("Alice");
    expect(mockAppendToAOF).toHaveBeenCalledWith("db.string.set", {
      key: "username",
      value: "Alice",
    });
  });
});
