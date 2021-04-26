
const sendToExecuter = require('../buisnessActivity/executerClientBA');
const config = require("../config");
const EXECUTER_URL = (process.env.EXECUTER_URL ? process.env.EXECUTER_URL : config.executer_url);


function sendTransaction(jsonRPC) {
  sendToExecuter(EXECUTER_URL,jsonRPC);
}

function sendBatchTransactions(...batchedTransactions) {
  console.log("Batching....");
  console.log(EXECUTER_URL);

}

module.exports = { sendBatchTransactions, sendTransaction } ;
