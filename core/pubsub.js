class PubSub {
    constructor() {
      this.channels = new Map(); // { "channelName": Set(sockets) }
    }
  
    subscribe(socket, channel) {
      if (!this.channels.has(channel)) {
        this.channels.set(channel, new Set());
      }
      this.channels.get(channel).add(socket);
      socket.write(`+SUBSCRIBED ${channel}\r\n`);
    }
  
    publish(channel, message) {
      if (!this.channels.has(channel)) return 0; // No subscribers
  
      const subscribers = this.channels.get(channel);
      let count = 0;
  
      for (const socket of subscribers) {
        if (socket.writable) {
          socket.write(`\r\nMessage from ${channel}: ${message}\r\n`);
          count++;
        }
      }
  
      return count; // Number of clients that received the message
    }
  
    unsubscribe(socket, channel) {
      if (!this.channels.has(channel)) return 0;
      
      this.channels.get(channel).delete(socket);
      
      if (this.channels.get(channel).size === 0) {
        this.channels.delete(channel); // Remove empty channels
      }
    }
  }
  
export default PubSub;