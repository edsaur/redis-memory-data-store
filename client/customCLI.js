import readline from "readline";
import net from "net";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = net.createConnection({ host: "localhost", port: 6379 }, () => {
  console.log("Connected to server");
  rl.setPrompt("> ");
  rl.prompt();

  rl.on("line", (line) => {
    client.write(line + "\r\n");
    rl.prompt();
  });
});

client.on("data", (data) => {
  console.log(data.toString());
});

client.on("end", () => {
  console.log("Disconnected from server");
  rl.close();
});