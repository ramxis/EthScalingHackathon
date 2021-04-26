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

const executor_wallet = new ethers.Wallet('0xd6a60e5456f19647625ff5ee67a7f043905806b9ecf26fe8637bb511321c20b5');
executor_wallet.getAddress()
  .then((address) => {
    console.log('My address:', address);
  })

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

function getStateRoot() {
  return provider.getBlockNumber()
    .then((blocknumber) => provider.send('eth_getBlockByNumber', [ethers.utils.hexValue(blocknumber), true]))
    .then((block) => block.stateRoot);
}

server.addMethod("eth_sendRawTransaction", async (rawTransactions) => {
  console.log(`Invoking eth_sendRawTransaction with ${rawTransactions} as parameter`);

  // get the old state root before executing transactions
  // let blocknumber = await provider.getBlockNumber();
  // let block = await provider.send('eth_getBlockByNumber', [ethers.utils.hexValue(blocknumber), true]);
  // const oldStateRoot = block.stateRoot;
  const oldStateRoot = await getStateRoot();
  console.log('Old State Root:', oldStateRoot);

  // execute one transaction after the other
  let receipt;
  for (let tx of rawTransactions) {
    console.log(`Sending transaction ${tx} to process`);
    try {
      receipt = await provider.sendTransaction(tx);
    } catch (e) {
      console.log(e.error.data);
      console.log();
      continue;
    }   
    console.log('Waiting to be processed');
    await provider.waitForTransaction(receipt.hash); 
  }

  const newStateRoot = await getStateRoot();

  // time to sign the data
  // first we hash the data
  let message_hash = ethers.utils.solidityKeccak256([ "bytes32", "bytes32"], [ oldStateRoot, newStateRoot]);

  executor_wallet.signMessage(ethers.utils.arrayify(message_hash))
    .then((signature) => {
      // (r, s, v)
      const sig = { 
        r: signature.slice(0, 66), 
        s: `0x${signature.slice(66, 130)}`, 
        v: `0x${signature.slice(130, 132)}`
      };
      const rollupInformation = {
        oldStateRoot,
        newStateRoot,
        executorSig: sig,
        transactions: rawTransactions
      };
      client.request("eth_sendRollupInformation", rollupInformation);
    })
    .then((result) => console.log(result))
    .catch((e) => console.log(e));

  // CODE TO BUILD A SIMPLE TRANSFER TX
  // const wallet = new ethers.Wallet('0x280feae9420dd9de35311ba06cd84f0e76f42648cf402296bd4d620a32adbcb1', provider);
  // let transaction = {
  //   nonce: 0,
  //   gasLimit: 21000,
  //   gasPrice: 0, //ethers.BigNumber.from("20000000000"),

  //   to: "0x036D0e47E9844e6D0fB5BD104043599f889FC215",

  //   value: ethers.utils.parseEther("1.0"),
  //   data: "0x",
  // }
  // sendTransaction takes an unsinged transation!
  // console.log('Sending tx');
  // let receipt = await wallet.sendTransaction(transaction);

  // let signed_tx = await wallet.signTransaction(transaction);
  // HERE WE GET THE BYTECODE
  // console.log(signed_tx);
  return '';
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