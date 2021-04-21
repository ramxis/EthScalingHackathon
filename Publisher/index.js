const express = require("express");
const bodyParser = require("body-parser");
const { JSONRPCServer } = require("json-rpc-2.0");
const config = require("./config");
const ethers = require('ethers');
const providers = require('ethers').providers;

const ETHEREUM_RPC_URL = (process.env.ETHEREUM_RPC_URL ? process.env.ETHEREUM_RPC_URL : config.ethereum_rpc_url);
const POLYGON_RPC_URL = (process.env.POLYGON_RPC_URL ? process.env.POLYGON_RPC_URL : config.polygon_rpc_url);

const eth_provider = new providers.JsonRpcProvider(ETHEREUM_RPC_URL);
const polygon_provider = new providers.JsonRpcProvider(POLYGON_RPC_URL);

const server = new JSONRPCServer();

/**
 * Checks the gas prices for the providers and returns the one with the lowest gas price.
 */
function getLowestProvider() {
  return Promise.all([eth_provider.getGasPrice(), polygon_provider.getGasPrice()])
    .then((values) => {
      console.log(`Ethereum gas price: ${(values[0].div(1000000000)).toString()} GWei`);
      console.log(`Polygon  gas price: ${(values[1].div(1000000000)).toString()} Gwei`);
      return (values[0].lt(values[1]) ? eth_provider : polygon_provider);
    });
}

server.addMethod("eth_sendRollupInformation", async (rollupInformation) => {
  console.log(rollupInformation)
  //get provider with lowest gas price
  const provider = await getLowestProvider();
  //TODO: send information to contract/chain
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

getLowestProvider().then((v) => console.log(v));