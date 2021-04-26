const express = require("express");
const bodyParser = require("body-parser");
const { JSONRPCServer } = require("json-rpc-2.0");
const config = require("./config");
const ethers = require('ethers');
const providers = require('ethers').providers;

const ETHEREUM_RPC_URL = (process.env.ETHEREUM_RPC_URL ? process.env.ETHEREUM_RPC_URL : config.ethereum_rpc_url);
const POLYGON_RPC_URL = (process.env.POLYGON_RPC_URL ? process.env.POLYGON_RPC_URL : config.polygon_rpc_url);

const eth_provider = new providers.JsonRpcProvider(ETHEREUM_RPC_URL);
// const polygon_provider = new providers.JsonRpcProvider(POLYGON_RPC_URL);
// const signer = eth_provider.getSigner()
// console.log(signer);
const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', eth_provider);
wallet.getAddress()
  .then((address) => console.log('My address:', address));

const server = new JSONRPCServer();

// async function contractTest() {
//   const eth_provider = new providers.JsonRpcProvider('http://127.0.0.1:8545');
//   const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
//   await wallet;
//   console.log(await wallet.getAddress());

//   // ******** CONTRACT STUFF ************
//   // The Contract interface
//   let abi = [
//     "constructor(address _publisher)",
//     "function updateState(bytes32 executor_r, bytes32 executor_s, uint8 executor_v, bytes32 oldStorageRoot, bytes32 newStorageRoot) public",
//     "function getCurrentStorageRoot() public view returns (bytes32)"
//   ];
//   // await wallet;
//   let walletWithProvider = await wallet.connect(eth_provider);
  
//   // hashing the "transaction data!"
//   let message_hash = ethers.utils.solidityKeccak256(
//     [ "bytes32", "bytes32"],
//     [ "0x0000000000000000000000000000000000000000000000000000000000000000",
//       "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
//     ]
//   );
//   // signing the data
//   let signature = await walletWithProvider.signMessage(ethers.utils.arrayify(message_hash));
//   // getting the values
//   const r = signature.slice(0, 66);
//   const s = '0x' + signature.slice(66, 130);
//   const v = '0x' + signature.slice(130, 132);

//   let contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
//   // We connect to the Contract using a Provider, so we will only
//   // have read-only access to the Contract
//   let contract = new ethers.Contract(contractAddress, abi, walletWithProvider);
  
//   let tx = await contract.updateState(
//     r, s, v,
//     '0x0000000000000000000000000000000000000000000000000000000000000000',
//     '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
//     );
//   await tx.wait();
//   let root = await contract.getCurrentStorageRoot();
//   console.log(root);
//   // ******** CONTRACT STUFF ************
// }
// contractTest()

// /**
//  * Checks the gas prices for the providers and returns the one with the lowest gas price.
//  */
// function getLowestProvider() {
//   return Promise.all([eth_provider.getGasPrice(), polygon_provider.getGasPrice()])
//     .then((values) => {
//       console.log(`Ethereum gas price: ${(values[0].div(1000000000)).toString()} GWei`);
//       console.log(`Polygon  gas price: ${(values[1].div(1000000000)).toString()} Gwei`);
//       return (values[0].lt(values[1]) ? eth_provider : polygon_provider);
//     });
// }
let contractAddress;
server.addMethod("sendContractAddress", async (address) => {
  console.log(address);
  contractAddress = address
})
server.addMethod("eth_sendRollupInformation", async (rollupInformation) => {
  // console.log(rollupInformation)
  //get provider with lowest gas price
  // const provider = await getLowestProvider();
  //TODO: send information to contract/chain

  let abi = [
    "function updateState(bytes32 orderer_r, bytes32 orderer_s, uint8 orderer_v,bytes32 executor_r, bytes32 executor_s, uint8 executor_v, bytes32 oldStorageRoot, bytes32 newStorageRoot) public",
    "function getCurrentStorageRoot() public view returns (bytes32)"
  ];
  // const eth_provider = new providers.JsonRpcProvider('http://tmpGanache:8545');
  // const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', eth_provider);
  // let contractAddress = "0x447a4f37DdB05341beAf484876a2c729357a966F";
  // We connect to the Contract using a Provider, so we will only
  // have read-only access to the Contract
  let contract = new ethers.Contract(contractAddress, abi, wallet);
  // let tx = await contract.updateState(
  //   rollupInformation.executorSig.r, // needs to be changed to orderer r 
  //   rollupInformation.executorSig.s, // needs to be changed to orderer s
  //   rollupInformation.executorSig.v, // needs to be changed to orderer v
  //   rollupInformation.executorSig.r, 
  //   rollupInformation.executorSig.s, 
  //   rollupInformation.executorSig.v,
  //   rollupInformation.oldStateRoot,
  //   rollupInformation.newStateRoot,
  //   {gasLimit: 3000000}
  // );
  // await tx.wait();
  // let root = await contract.getCurrentStorageRoot();
  // console.log('Current Storage Rott:', root);
  contract.updateState(
    rollupInformation.executorSig.r, // needs to be changed to orderer r 
    rollupInformation.executorSig.s, // needs to be changed to orderer s
    rollupInformation.executorSig.v, // needs to be changed to orderer v
    rollupInformation.executorSig.r, 
    rollupInformation.executorSig.s, 
    rollupInformation.executorSig.v,
    rollupInformation.oldStateRoot,
    rollupInformation.newStateRoot,
    {gasLimit: 3000000}
  )
  .then((tx) => tx.wait())
  .then(() => contract.getCurrentStorageRoot())
  .then((storageRoot) => console.log('Current Storage Root:', storageRoot));
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

// getLowestProvider().then((v) => console.log(v));