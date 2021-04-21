const express = require("express");
const bodyParser = require("body-parser");
const { JSONRPCServer, JSONRPCClient } = require("json-rpc-2.0");
const fetch = require("node-fetch");
const ethers = require('ethers');
const providers = require('ethers').providers;
const config = require("./config");

const GANACHE_URL = (process.env.GANACHE_URL ? process.env.GANACHE_URL : 'http://localhost:8545');
const PUBLISHER_URL = (process.env.PUBLISHER_URL ? process.env.PUBLISHER_URL : config.publisher_url);

const provider = new providers.JsonRpcProvider(GANACHE_URL);

// TODO: This will be removed at a later point in time -----
var privateKey = "0x055652e9cf0d7041fd22b47eb736c72721275b2dd4ca26f8e878df80e15f063c";
var wallet = new ethers.Wallet(privateKey, provider);
console.log("Address: " + wallet.address);
// -----

const server = new JSONRPCServer();

// json-rpc client in order to send data to the publisher
const client = new JSONRPCClient((jsonRPCRequest) =>
  fetch(`${PUBLISHER_URL}/json-rpc`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(jsonRPCRequest),
  }).then((response) => {
    if (response.status === 200) {
      // Use client.receive when you received a JSON-RPC response.
      return response
        .json()
        .then((jsonRPCResponse) => client.receive(jsonRPCResponse));
    } else if (jsonRPCRequest.id !== undefined) {
      return Promise.reject(new Error(response.statusText));
    }
  })
);

// First parameter is a method name.
// Second parameter is a method itself.
// A method takes JSON-RPC params and returns a result.
// It can also return a promise of the result.
server.addMethod("echo", ({text}) => {
    console.log(text);
    return text;
});

server.addMethod("log", ({ message }) => console.log(message));

server.addMethod("eth_sendRawTransaction", async (rawTransactions) => {
  console.log(`Invoking eth_sendRawTransaction with ${rawTransactions} as parameter`);
  let receipt;
  for (let tx of rawTransactions) {
    console.log(`Sending transaction ${tx} to process`);
    try {
      receipt = await provider.sendTransaction(tx);
    } catch (e) {
      console.log(e.reason);
      console.log(e.code);
      console.log();
      continue;
    }   
    console.log('Waiting to be processed');
    await provider.waitForTransaction(receipt.hash); 
  }

  let blocknumber = await provider.getBlockNumber();
  // let blockheader = await provider.getBlock(blocknumber);
  // provider.getBlock doesn't give all the fields backs.
  const block = await provider.send('eth_getBlockByNumber', [ethers.utils.hexValue(blocknumber), true]);
  console.log('State Root:', block.stateRoot);
  const rollupInformation = {
    stateRoot: block.stateRoot,
    transactions: rawTransactions
  }

  // the rollupInformation has to be send to the publisher
  client
    .request("eth_sendRollupInformation", rollupInformation)
    .then((result) => console.log(result));
  

  // let balance = await provider.getBalance(wallet.address);
  // console.log('Balance (1):', balance.toString());
  // balance = await provider.getBalance('0xA9cc08841d5a533841a6B7A5E0dcD72A743E356A');
  // console.log('Balance (2)', balance.toString());
  
  // let transaction = {
  //   nonce: 5,
  //   gasLimit: 21000,
  //   gasPrice: ethers.BigNumber.from("20000000000"),

  //   to: "0x036D0e47E9844e6D0fB5BD104043599f889FC215",

  //   value: ethers.utils.parseEther("1.0"),
  //   data: "0x",
  // }
  // sendTransaction takes an unsinged transation!
  // console.log('Sending tx');
  // let receipt = await wallet.sendTransaction(transaction);

  // let signed_tx = await wallet.signTransaction(transaction);
  // //console.log(signed_tx);
  // let receipt = await provider.sendTransaction(signed_tx);
  // let tx_hash = await provider.waitForTransaction(receipt.hash);
  // console.log(tx_hash);

  // balance = await provider.getBalance(wallet.address);
  // console.log('Balance (1):', balance.toString());
  // balance = await provider.getBalance('0xA9cc08841d5a533841a6B7A5E0dcD72A743E356A');
  // console.log('Balance (2)', balance.toString());
  return '' //balance.toString();
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

app.listen(config.port);