const nodeAbi = require("node-abi");

// electron abi
console.log("Electron v25.0.0 abi: ", nodeAbi.getAbi("25.0.0", "electron"));
console.log("Electron v25.1.1 abi: ", nodeAbi.getAbi("25.1.1", "electron"));

// node abi
console.log("Node v20.0.0 abi: ", nodeAbi.getAbi("20.0.0", "node"));
