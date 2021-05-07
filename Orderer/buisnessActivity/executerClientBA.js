const { JSONRPCClient } = require("json-rpc-2.0");
const fetch = require("node-fetch");
const config = require("../config");
const EXECUTER_URL = (process.env.EXECUTER_URL ? process.env.EXECUTER_URL : config.executer_url);

let executerClient = new JSONRPCClient((jsonRPCRequest) =>
fetch(`${EXECUTER_URL}/json-rpc`, {
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
      .then((jsonRPCResponse) => executerClient.receive(jsonRPCResponse));
  } else if (jsonRPCRequest.id !== undefined) {
    return Promise.reject(new Error(response.statusText));
  }
}));

// json-rpc client in order to send data to the executer
const sendToExecuter = (jsonRPCRequest)  => {
  //TODO:remove console log
  console.log(jsonRPCRequest);
  executerClient
    .request("eth_sendRawTransaction", jsonRPCRequest)
    .then((result) => console.log(result));
}


module.exports = sendToExecuter;
