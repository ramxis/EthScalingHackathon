
const sendToExecuter = require('../buisnessActivity/executerClientBA');



function sendTransaction(signedTx) {
  console.log(signedTx);

  let tx = `{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params": [${signedTx}],"id":1}`;
  return sendToExecuter(tx);
}

function sendBatchTransactions(...batchedTransactions) {
  console.log("Batching....");
  console.log(EXECUTER_URL);

}

module.exports = { sendBatchTransactions, sendTransaction } ;
