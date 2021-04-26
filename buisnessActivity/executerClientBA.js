const { JSONRPCClient } = require("json-rpc-2.0");
const fetch = require("node-fetch");
// json-rpc client in order to send data to the executer
const sendToExecuter = (EXECUTER_URL, jsonRPCRequest)  => {

  //TODO:remove console log
  console.log(EXECUTER_URL, jsonRPCRequest);
  new JSONRPCClient((jsonRPCRequest) =>
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
        .then((jsonRPCResponse) => client.receive(jsonRPCResponse));
    } else if (jsonRPCRequest.id !== undefined) {
      return Promise.reject(new Error(response.statusText));
    }
  }));

}


module.exports = sendToExecuter;
