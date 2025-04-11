# Welcome to Redislike Memory Store!

Hello this is my assessment for **ASG Platform** where I replicated Redis functionalities into my own ways. 

This Redis-like memory store replication has most of the basic Redis Functionalities as follows:
- **SET, GET, DEL, HAS functionality**
- **Support functions for major Redis datatypes (Strings, JSON, Lists, Sets, Hashes, Sorted Sets, Streams, Geospatial, Bitmaps, Bitfields, Probabilistic Data Structure, and Time Series)**
- **Key Expirations**
- **Server to Client interaction**
- **AOFs and Snapshots**
- **Transactions**
- **PUB/SUB Mechanism**
- **Client Development**
- **Vector Database Functionality**

 The tech stack I used:
 -
- Javascript (Node.JS)
- sockets (for server process)
- netcat TCP (for command line interface replicating Redis-CLI)
- TensorFlow (Machine Learning Library [for Vector functionalities])

# How to use this?
Clone or download this [repository](https://github.com/edsaur/asg-redis-memory-data-store) and install all the dependencies using "npm install" (if you're using NPM)

## Running the Server and using the Redis-like CLI
### Running the server
To run the server simply input `node app.js` to turn on the server. (If you don't have nodejs installed, install it [here](https://nodejs.org/en/download))

### Accessing the command line interface
(Final Version)
- 
**For users who cannot install netcat or does not know how to use netcat, there is a custom CLI situated in the client's folder. To run simply input** `node client/customCLI.js`.


~~(First version)~~
- 
~~The CLI uses [netcat](https://en.wikipedia.org/wiki/Netcat). (If you don't have netcat yet, download netcat [here](https://nmap.org/ncat/)).~~

~~#### To access the CLI using netcat
Run your CMD as admin, and input `ncat localhost 6379`. (NOTE: Make sure that the SERVER IS RUNNING FIRST!)~~

See the comprehensive list of the commands for the Redis-like CLI [here](https://github.com/edsaur/asg-redis-memory-data-store/blob/main/commands.md) 
