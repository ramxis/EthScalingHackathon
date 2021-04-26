const { toUtf8CodePoints } = require('@ethersproject/strings');
const express = require('express');
const router = express.Router();
const {sendTransaction, sendBatchTransactions} = require('../buisnessFacade/ordererBF');

router.post('/sendtransaction', function(req, res, next) {

    //TODO: call in the view to create a transaction using metamask and send its rpc here
    //TODO: Should I check if it is a correct eth transaction , may be also check if its correctly signed by the sender? or should these two steps happen at the executer? JACEK>>?

    sendTransaction(req.body);
    res.send(req.body);
});

router.post('/sendbatchtransactions', function(req, res, next) {

    console.log("Batching Transactions.....");
    sendBatchTransactions();
    res.send("sendBatchTransactions");
});

module.exports = router;