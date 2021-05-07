const { toUtf8CodePoints } = require('@ethersproject/strings');
const express = require('express');
const router = express.Router();
const { ethers } = require("ethers");
const {sendTransaction, sendBatchTransactions} = require('../buisnessFacade/ordererBF');

const signer = new ethers.Wallet('2ff716e2adfb575da83db6191bccb4506237050fd924312b80d3665c9ed95741');
const account = "0x094Ad0423fCEe80bf2193Cefc4D5b7f2Dfc785C5";

router.get('/sendtransaction', function(req, res, next) {

    res.send('sendtransaction');
});

router.get('/sendbatchtransactions', function(req, res, next) {

    console.log("Batching Transactions.....");
    res.send('sendbatchtransactions');
});

router.post('/sendtransaction', async(req, res, next) => {


    console.log("inside signing transactions");


    var _to = req.body._to;
    var _value = ethers.utils.hexlify(req.body._value);

    var tx = {
        from: account,
        value: _value,
        to: _to,
        gasPrice: 0,
        gasLimit: 21000
    }

    var signed_tx = await signer.signTransaction(tx);

    console.log('transaction signed');

    sendTransaction(signed_tx);
    res.send(signed_tx);
});

router.post('/sendbatchtransactions', async(req, res, next) => {

    console.log("Batching Transactions.....");



    var _to1 = req.body._to1;
    var _value1 = ethers.utils.hexlify(req.body._value1);
    var _nonce1 = req.body._nonce1;
    var _to2 = req.body._to2;
    var _value2 = ethers.utils.hexlify(req.body._value2);
    var _nonce2 = req.body._nonce2;

    var tx1 = {
        from: account,
        value: _value1,
        to: _to1,
        nonce: _nonce1,
        gasPrice: 0,
        gasLimit: 21000
    }

    var tx2 = {
        from: account,
        value: _value2,
        to: _to2,
        nonce: _nonce2,
        gasPrice: 0,
        gasLimit: 21000
    }

    var signed_tx1 = await signer.signTransaction(tx1);

    var signed_tx2 = await signer.signTransaction(tx2);
    const batched_tx = [ signed_tx1, signed_tx2];
    sendBatchTransactions(signed_tx1,signed_tx2);
    res.send("sendBatchTransactions");
});



module.exports = router;