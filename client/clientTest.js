import client from "./client.js";

async function test() {
    await client.connect();
    console.log(await client.set("testKey", "testValue")); // Output: OK
    console.log(await client.get("testKey")); // Output: testValue

    console.log(await client.saveSnapshot());

    console.log(client.disconnect());
  }

test();
