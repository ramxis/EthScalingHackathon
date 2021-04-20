const express = require("express");
const bodyParser = require("body-parser");
const { JSONRPCServer } = require("json-rpc-2.0");
const config = require("./config");
// const ethers = require('ethers');
// const providers = require('ethers').providers;

// const provider = new providers.JsonRpcProvider();

const server = new JSONRPCServer();


server.addMethod("eth_sendRollupInformation", async (rollupInformation) => {
  console.log(rollupInformation)
  //TODO: get gas prices from ethereum and polygon
  return ''
})

const app = express();
app.use(bodyParser.json());

app.post("/json-rpc", (req, res) => {
  const jsonRPCRequest = req.body;
  // server.receive takes a JSON-RPC request and returns a promise of a JSON-RPC response.
  // Alternatively, you can use server.receiveJSON, which takes JSON string as is (in this case req.body).
  server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
    if (jsonRPCResponse) {
      res.json(jsonRPCResponse);
    } else {
      // If response is absent, it was a JSON-RPC notification method.
      // Respond with no content status (204).
      res.sendStatus(204);
    }
  });
});

console.log(`Listening on port ${config.port}`);
app.listen(config.port);