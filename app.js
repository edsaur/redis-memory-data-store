import net from 'net';
import db from './db.js'; // Import your RedisLikeDB instance

const PORT = 6379; // Default Redis port

const server = net.createServer((socket) => {
  console.log('Client connected');

  socket.on('data', (data) => {
    const command = data.toString().trim();
    console.log(`Received command: ${command}`);

    // Basic command parsing (you'll need to expand this)
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Handle commands (this is a very basic example)
    switch (cmd) {
      case 'ping':
        socket.write('+PONG\r\n');
        break;

      case 'get':
        if (args.length !== 1) {
          socket.write('-ERR wrong number of arguments for \'get\' command\r\n');
          break;
        }
        const value = db.get(args[0]);
        if (value !== null && value !== undefined) {
          socket.write(`+${value}\r\n`);
        } else {
          socket.write('$-1\r\n'); // Null value
        }
        break;

      case 'set':
        if (args.length !== 2) {
          socket.write('-ERR wrong number of arguments for \'set\' command\r\n');
          break;
        }
        db.string.set(args[0], args[1]);
        socket.write('+OK\r\n');
        break;

      case 'sadd':
        if (args.length < 2) {
          socket.write('-ERR wrong number of arguments for \'sadd\' command\r\n');
          break;
        }

        const saddCount = db.set.sadd(args[0], ...args.slice(1));
        socket.write(`:${saddCount}\r\n`);
        break;

      case 'smembers':
        if (args.length !== 1) {
          socket.write('-ERR wrong number of arguments for \'smembers\' command\r\n');
          break;
        }
        const members = db.set.smembers(args[0]);
        socket.write(`*${members.length}\r\n`);
        members.forEach(member => {
          socket.write(`$${member.length}\r\n${member}\r\n`);
        });
        break;


      case 'hset':
        if (args.length !== 3) {
          socket.write('-ERR wrong number of arguments for \'hset\' command\r\n');
          break;
        }
        db.hash.hset(args[0], args[1], args[2]);
        socket.write(':1\r\n');
        break;


      case 'hget':
        if (args.length !== 2) {
          socket.write('-ERR wrong number of arguments for \'hget\' command\r\n');
          break;
        }
        const hashValue = db.hash.hget(args[0], args[1]);
        if (hashValue !== null && hashValue !== undefined) {
          socket.write(`+${hashValue}\r\n`);
        } else {
          socket.write('$-1\r\n'); // Null value
        }
        break;
        
      case 'save':
        db.saveSnapshot();
        socket.write('+OK\r\n');
        break;
      default:
        socket.write(`-ERR unknown command '${cmd}'\r\n`);
    }
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

server.listen(PORT, () => {
  console.log(`Redis-like server listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
