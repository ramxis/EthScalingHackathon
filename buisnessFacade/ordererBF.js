
const sendToExecuter = require('../buisnessActivity/executerClientBA');



function sendTransaction(signedTx) {
  console.log(signedTx);

  let tx = `{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params": [${signedTx}],"id":1}`;
  return sendToExecuter(tx);
}

function sendBatchTransactions(...batchedTransactions) {
  console.log("Batching....");
  // for (let tx of batchedTransactions){
  //    let tx = `{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params": [${tx}],"id":1}`;
    // sendToExecuter(tx);
  // }
  let tx = `{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params": [${batchedTransactions}],"id":1}`;
  return sendToExecuter(tx);

}

module.exports = { sendBatchTransactions, sendTransaction } ;
